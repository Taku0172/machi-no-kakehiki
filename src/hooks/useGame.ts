import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AppState } from "react-native";

import {
    beginAnalyticsSession,
    clearAnalyticsSession,
    getAnalyticsSessionId,
    recordAnalyticsEvent,
} from "../analytics/gameAnalytics";

import {
    createInitialGameState,
    executeNumericDecision,
    executeStrategyDecision,
    getCurrentPolicy,
} from "../engine/gameEngine";

import { calculateCityScores } from "../engine/scoreEngine";

import { deleteSavedGame, loadGame, saveGame } from "../storage/gameStorage";

import type { GameState, HistoryEntry, Policy } from "../types/game";

// ==================================================
// 分析セッションを準備する
// ==================================================

async function ensureAnalyticsSession(state: GameState): Promise<void> {
  const currentSessionId = await getAnalyticsSessionId();

  if (currentSessionId) {
    return;
  }

  await beginAnalyticsSession({
    year: state.city.year,
    stage: state.city.stage,
    phase: state.phase,
    developmentModel: state.developmentModel,
  });
}

// ==================================================
// 政策選択を分析データとして記録する
// ==================================================

async function recordPolicyDecision(
  previousState: GameState,
  nextState: GameState,
  policy: Policy,
  decision:
    | {
        kind: "strategy";
        optionId: string;
      }
    | {
        kind: "numeric";
        value: number;
      },
): Promise<void> {
  await ensureAnalyticsSession(previousState);

  const latestHistoryEntry = nextState.history[nextState.history.length - 1];

  // 政策がプレイヤーに提示されたことを記録する
  await recordAnalyticsEvent({
    eventType: "policy_presented",

    year: previousState.city.year,
    stage: previousState.city.stage,
    phase: previousState.phase,

    policyId: policy.id,
    policyTitle: policy.title,
    policyType: policy.type,
    policyCategory: policy.category,
    policyDomain: policy.domain,

    developmentModelBefore: previousState.developmentModel,

    developmentModelAfter: previousState.developmentModel,

    cityBefore: previousState.city,
  });

  if (decision.kind === "strategy") {
    if (policy.type !== "strategy") {
      return;
    }

    const selectedOption = policy.options.find(
      (option) => option.id === decision.optionId,
    );

    if (!selectedOption) {
      return;
    }

    await recordAnalyticsEvent({
      eventType: "decision_made",

      year: previousState.city.year,
      stage: previousState.city.stage,
      phase: previousState.phase,

      policyId: policy.id,
      policyTitle: policy.title,
      policyType: policy.type,
      policyCategory: policy.category,
      policyDomain: policy.domain,

      decisionKind: "strategy",

      optionId: selectedOption.id,
      optionLabel: selectedOption.label,

      developmentModelBefore: previousState.developmentModel,

      developmentModelAfter: nextState.developmentModel,

      strategySwitched:
        previousState.developmentModel !== nextState.developmentModel,

      cityBefore: previousState.city,
      cityAfter: nextState.city,

      effects: latestHistoryEntry?.effects ?? selectedOption.effects,
    });
  }

  if (decision.kind === "numeric") {
    if (policy.type !== "numeric") {
      return;
    }

    await recordAnalyticsEvent({
      eventType: "decision_made",

      year: previousState.city.year,
      stage: previousState.city.stage,
      phase: previousState.phase,

      policyId: policy.id,
      policyTitle: policy.title,
      policyType: policy.type,
      policyCategory: policy.category,
      policyDomain: policy.domain,

      decisionKind: "numeric",

      numericValue: decision.value,
      numericUnit: policy.unit,

      developmentModelBefore: previousState.developmentModel,

      developmentModelAfter: nextState.developmentModel,

      strategySwitched: false,

      cityBefore: previousState.city,
      cityAfter: nextState.city,

      effects: latestHistoryEntry?.effects,
    });
  }

  // 政策実行によって発展段階が変わった場合
  if (previousState.city.stage !== nextState.city.stage) {
    await recordAnalyticsEvent({
      eventType: "stage_changed",

      year: nextState.city.year,
      stage: nextState.city.stage,
      phase: nextState.phase,

      developmentModelBefore: previousState.developmentModel,

      developmentModelAfter: nextState.developmentModel,

      cityBefore: previousState.city,
      cityAfter: nextState.city,
    });
  }

  // 50年間のゲームが終了した場合
  if (!previousState.isFinished && nextState.isFinished) {
    await recordAnalyticsEvent({
      eventType: "game_completed",

      year: nextState.city.year,
      stage: nextState.city.stage,
      phase: "finished",

      developmentModelBefore: previousState.developmentModel,

      developmentModelAfter: nextState.developmentModel,

      cityBefore: previousState.city,
      cityAfter: nextState.city,

      finalScores: calculateCityScores(nextState.city),
    });
  }
}

// ==================================================
// ゲーム操作フック
// ==================================================

export function useGame() {
  const [gameState, setGameState] = useState<GameState>(createInitialGameState);

  const [isLoading, setIsLoading] = useState(true);

  const [isSaving, setIsSaving] = useState(false);

  const [saveError, setSaveError] = useState<string | null>(null);

  // アプリがバックグラウンドへ移動したときに、
  // 最新状態を参照するためのRef
  const gameStateRef = useRef(gameState);

  // 初回ロード完了前に初期状態を保存しないためのフラグ
  const hasLoadedRef = useRef(false);

  // 分析イベントを必ず順番に送信するためのキュー
  const analyticsQueueRef = useRef<Promise<void>>(Promise.resolve());

  // 常に最新のゲーム状態をRefへ反映する
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  // ==================================================
  // 初回ロード
  // ==================================================

  useEffect(() => {
    let isMounted = true;

    async function restoreGame() {
      const savedState = await loadGame();

      if (!isMounted) {
        return;
      }

      if (savedState) {
        setGameState(savedState);
      }

      hasLoadedRef.current = true;
      setIsLoading(false);
    }

    void restoreGame();

    return () => {
      isMounted = false;
    };
  }, []);

  // ==================================================
  // 状態変更時の自動セーブ
  // ==================================================

  useEffect(() => {
    if (!hasLoadedRef.current) {
      return;
    }

    let isMounted = true;

    async function autoSave() {
      setIsSaving(true);

      const succeeded = await saveGame(gameState);

      if (!isMounted) {
        return;
      }

      if (succeeded) {
        setSaveError(null);
      } else {
        setSaveError("ゲームの自動保存に失敗しました。");
      }

      setIsSaving(false);
    }

    void autoSave();

    return () => {
      isMounted = false;
    };
  }, [gameState]);

  // ==================================================
  // バックグラウンド移行時の保存
  // ==================================================

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "inactive" || nextAppState === "background") {
        void saveGame(gameStateRef.current);
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // ==================================================
  // 分析処理を送信キューへ追加
  // ==================================================

  const enqueueAnalytics = useCallback((task: () => Promise<void>) => {
    analyticsQueueRef.current = analyticsQueueRef.current
      .then(task)
      .catch((error) => {
        console.warn("分析データの処理に失敗しました。", error);
      });
  }, []);

  // ==================================================
  // 現在の表示データ
  // ==================================================

  const currentPolicy = useMemo(
    () => getCurrentPolicy(gameState),
    [gameState.currentPolicyId, gameState.isFinished],
  );

  const scores = useMemo(
    () => calculateCityScores(gameState.city),
    [gameState.city],
  );

  const lastResult: HistoryEntry | null = useMemo(() => {
    if (gameState.history.length === 0) {
      return null;
    }

    return gameState.history[gameState.history.length - 1];
  }, [gameState.history]);

  // ==================================================
  // 戦略選択
  // ==================================================

  const selectStrategyOption = useCallback(
    (optionId: string) => {
      setGameState((currentState) => {
        const policy = getCurrentPolicy(currentState);

        if (!policy || policy.type !== "strategy") {
          return currentState;
        }

        const nextState = executeStrategyDecision(currentState, optionId);

        gameStateRef.current = nextState;

        enqueueAnalytics(() =>
          recordPolicyDecision(currentState, nextState, policy, {
            kind: "strategy",
            optionId,
          }),
        );

        return nextState;
      });
    },
    [enqueueAnalytics],
  );

  // ==================================================
  // 数値選択
  // ==================================================

  const submitNumericValue = useCallback(
    (value: number) => {
      setGameState((currentState) => {
        const policy = getCurrentPolicy(currentState);

        if (!policy || policy.type !== "numeric") {
          return currentState;
        }

        const nextState = executeNumericDecision(currentState, value);

        gameStateRef.current = nextState;

        enqueueAnalytics(() =>
          recordPolicyDecision(currentState, nextState, policy, {
            kind: "numeric",
            value,
          }),
        );

        return nextState;
      });
    },
    [enqueueAnalytics],
  );

  // ==================================================
  // 手動セーブ
  // ==================================================

  const saveCurrentGame = useCallback(async () => {
    setIsSaving(true);

    const succeeded = await saveGame(gameStateRef.current);

    if (succeeded) {
      setSaveError(null);
    } else {
      setSaveError("ゲームの保存に失敗しました。");
    }

    setIsSaving(false);

    return succeeded;
  }, []);

  // ==================================================
  // ニューゲーム
  // ==================================================

  const startNewGame = useCallback(async () => {
    await deleteSavedGame();
    await clearAnalyticsSession();

    const newState = createInitialGameState();

    gameStateRef.current = newState;

    setGameState(newState);
    setSaveError(null);
  }, []);

  return {
    // ゲーム状態
    gameState,
    city: gameState.city,
    scores,
    currentPolicy,
    lastResult,

    // 読み込み・保存状態
    isLoading,
    isSaving,
    saveError,

    // 操作
    selectStrategyOption,
    submitNumericValue,
    saveCurrentGame,
    startNewGame,
  };
}
