import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";
import { Platform } from "react-native";

import { hasAcceptedAnalytics } from "./analyticsConsent";
import { isAnalyticsConfigured, supabase } from "./supabaseClient";

import type {
    CityScores,
    CityState,
    DevelopmentModel,
    DevelopmentStage,
    GamePhase,
    PolicyCategory,
    PolicyDomain,
    PolicyEffects,
    PolicyType,
} from "../types/game";

const ANALYTICS_SESSION_STORAGE_KEY = "@machi_no_kakehiki/analytics_session";

const CONSENT_VERSION = "1";
const SCHEMA_VERSION = 1;
const APP_VERSION = "1.0.0";

export type AnalyticsEventType =
  | "game_started"
  | "policy_presented"
  | "decision_made"
  | "stage_changed"
  | "game_completed";

export type AnalyticsDecisionKind = "strategy" | "numeric";

type StoredAnalyticsSession = {
  sessionId: string;
  nextEventSequence: number;
};

export type AnalyticsEventInput = {
  eventType: AnalyticsEventType;

  year?: number;
  stage?: DevelopmentStage;
  phase?: GamePhase;

  policyId?: string;
  policyTitle?: string;
  policyType?: PolicyType;
  policyCategory?: PolicyCategory;
  policyDomain?: PolicyDomain;

  decisionKind?: AnalyticsDecisionKind;

  optionId?: string;
  optionLabel?: string;

  numericValue?: number;
  numericUnit?: string;

  developmentModelBefore?: DevelopmentModel;
  developmentModelAfter?: DevelopmentModel;

  strategySwitched?: boolean;

  cityBefore?: CityState;
  cityAfter?: CityState;

  effects?: PolicyEffects;
  finalScores?: CityScores;
};

function getPlatformName(): "ios" | "android" | "web" | "unknown" {
  if (
    Platform.OS === "ios" ||
    Platform.OS === "android" ||
    Platform.OS === "web"
  ) {
    return Platform.OS;
  }

  return "unknown";
}

function getLocale(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().locale || "unknown";
  } catch {
    return "unknown";
  }
}

async function loadStoredSession(): Promise<StoredAnalyticsSession | null> {
  try {
    const storedValue = await AsyncStorage.getItem(
      ANALYTICS_SESSION_STORAGE_KEY,
    );

    if (!storedValue) {
      return null;
    }

    const parsedValue = JSON.parse(
      storedValue,
    ) as Partial<StoredAnalyticsSession>;

    if (
      typeof parsedValue.sessionId !== "string" ||
      typeof parsedValue.nextEventSequence !== "number"
    ) {
      return null;
    }

    return {
      sessionId: parsedValue.sessionId,
      nextEventSequence: parsedValue.nextEventSequence,
    };
  } catch (error) {
    console.warn("分析セッションを読み込めませんでした。", error);

    return null;
  }
}

async function saveStoredSession(
  session: StoredAnalyticsSession,
): Promise<void> {
  await AsyncStorage.setItem(
    ANALYTICS_SESSION_STORAGE_KEY,
    JSON.stringify(session),
  );
}

async function canSendAnalytics(): Promise<boolean> {
  if (!isAnalyticsConfigured || !supabase) {
    return false;
  }

  return hasAcceptedAnalytics();
}

async function insertEvent(
  session: StoredAnalyticsSession,
  input: AnalyticsEventInput,
): Promise<boolean> {
  if (!supabase) {
    return false;
  }

  const eventId = Crypto.randomUUID();

  const { error } = await supabase.from("game_events").insert({
    id: eventId,
    session_id: session.sessionId,
    event_sequence: session.nextEventSequence,
    event_type: input.eventType,

    year: input.year ?? null,
    stage: input.stage ?? null,
    phase: input.phase ?? null,

    policy_id: input.policyId ?? null,
    policy_title: input.policyTitle ?? null,
    policy_type: input.policyType ?? null,
    policy_category: input.policyCategory ?? null,
    policy_domain: input.policyDomain ?? null,

    decision_kind: input.decisionKind ?? null,

    option_id: input.optionId ?? null,
    option_label: input.optionLabel ?? null,

    numeric_value: input.numericValue ?? null,
    numeric_unit: input.numericUnit ?? null,

    development_model_before: input.developmentModelBefore ?? null,

    development_model_after: input.developmentModelAfter ?? null,

    strategy_switched: input.strategySwitched ?? false,

    city_before: input.cityBefore ?? null,
    city_after: input.cityAfter ?? null,
    effects: input.effects ?? null,
    final_scores: input.finalScores ?? null,

    client_created_at: new Date().toISOString(),
    app_version: APP_VERSION,
  });

  if (error) {
    console.warn(
      `分析イベント「${input.eventType}」を送信できませんでした。`,
      error.message,
    );

    return false;
  }

  return true;
}

/**
 * 新しいゲーム用の匿名分析セッションを開始する。
 *
 * 氏名やメールアドレスなど、個人を特定する情報は送信しない。
 */
export async function beginAnalyticsSession(initialState: {
  year: number;
  stage: DevelopmentStage;
  phase: GamePhase;
  developmentModel: DevelopmentModel;
}): Promise<string | null> {
  const isAllowed = await canSendAnalytics();

  if (!isAllowed || !supabase) {
    return null;
  }

  const sessionId = Crypto.randomUUID();

  const session: StoredAnalyticsSession = {
    sessionId,
    nextEventSequence: 0,
  };

  const { error } = await supabase.from("game_sessions").insert({
    id: sessionId,
    consent_version: CONSENT_VERSION,
    schema_version: SCHEMA_VERSION,
    app_version: APP_VERSION,
    platform: getPlatformName(),
    locale: getLocale(),
    analytics_consent: true,

    // 現在の同意画面はゲーム改善への同意であり、
    // 研究利用への同意ではない。
    research_consent: false,
  });

  if (error) {
    console.warn("分析セッションを開始できませんでした。", error.message);

    return null;
  }

  try {
    await saveStoredSession(session);

    const startEventWasRecorded = await insertEvent(session, {
      eventType: "game_started",
      year: initialState.year,
      stage: initialState.stage,
      phase: initialState.phase,
      developmentModelBefore: initialState.developmentModel,
      developmentModelAfter: initialState.developmentModel,
    });

    if (startEventWasRecorded) {
      await saveStoredSession({
        ...session,
        nextEventSequence: 1,
      });
    }

    return sessionId;
  } catch (error) {
    console.warn("分析セッションを端末に保存できませんでした。", error);

    return null;
  }
}

/**
 * 現在の分析セッションへイベントを1件送信する。
 */
export async function recordAnalyticsEvent(
  input: AnalyticsEventInput,
): Promise<boolean> {
  const isAllowed = await canSendAnalytics();

  if (!isAllowed) {
    return false;
  }

  const session = await loadStoredSession();

  if (!session) {
    return false;
  }

  const wasRecorded = await insertEvent(session, input);

  if (!wasRecorded) {
    return false;
  }

  try {
    await saveStoredSession({
      ...session,
      nextEventSequence: session.nextEventSequence + 1,
    });

    return true;
  } catch (error) {
    console.warn("分析イベントの送信順を保存できませんでした。", error);

    return false;
  }
}

/**
 * 現在使用している匿名セッションIDを取得する。
 */
export async function getAnalyticsSessionId(): Promise<string | null> {
  const session = await loadStoredSession();

  return session?.sessionId ?? null;
}

/**
 * 新しいゲームを開始するときに、以前の分析セッションを終了する。
 *
 * Supabase上のデータは削除せず、
 * この端末に保存されたセッション情報だけを削除する。
 */
export async function clearAnalyticsSession(): Promise<void> {
  try {
    await AsyncStorage.removeItem(ANALYTICS_SESSION_STORAGE_KEY);
  } catch (error) {
    console.warn("分析セッションを削除できませんでした。", error);
  }
}
