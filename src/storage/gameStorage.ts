import AsyncStorage from "@react-native-async-storage/async-storage";

import { findPolicyById } from "../data/policyCatalog";

import type { GameState } from "../types/game";

// 保存データの識別キー
const GAME_SAVE_KEY = "@machi-no-kakehiki/game-save";

// 保存形式を変更したときに使用するバージョン
const SAVE_DATA_VERSION = 1;

// AsyncStorageへ保存するデータ
type StoredGameData = {
  version: number;
  savedAt: string;
  state: GameState;
};

// ==================================================
// 保存データの検査
// ==================================================

function isStoredGameData(value: unknown): value is StoredGameData {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const data = value as Partial<StoredGameData>;

  if (
    data.version !== SAVE_DATA_VERSION ||
    typeof data.savedAt !== "string" ||
    !data.state
  ) {
    return false;
  }

  const state = data.state as Partial<GameState>;

  if (
    !state.city ||
    typeof state.city.year !== "number" ||
    typeof state.city.population !== "number" ||
    typeof state.city.budget !== "number" ||
    !Array.isArray(state.history) ||
    !Array.isArray(state.timeline) ||
    !Array.isArray(state.completedPolicyIds) ||
    !Array.isArray(state.recentPolicyIds)
  ) {
    return false;
  }

  return true;
}

// 現在の政策IDがカタログ内に存在するか確認する
function hasValidCurrentPolicy(state: GameState): boolean {
  if (state.isFinished) {
    return state.currentPolicyId === null;
  }

  if (!state.currentPolicyId) {
    return false;
  }

  return findPolicyById(state.currentPolicyId) !== null;
}

// ==================================================
// セーブ
// ==================================================

export async function saveGame(state: GameState): Promise<boolean> {
  try {
    const storedData: StoredGameData = {
      version: SAVE_DATA_VERSION,
      savedAt: new Date().toISOString(),
      state,
    };

    await AsyncStorage.setItem(GAME_SAVE_KEY, JSON.stringify(storedData));

    return true;
  } catch (error) {
    console.warn("ゲームデータの保存に失敗しました。", error);

    return false;
  }
}

// ==================================================
// ロード
// ==================================================

export async function loadGame(): Promise<GameState | null> {
  try {
    const savedJson = await AsyncStorage.getItem(GAME_SAVE_KEY);

    if (!savedJson) {
      return null;
    }

    const parsedData: unknown = JSON.parse(savedJson);

    if (!isStoredGameData(parsedData)) {
      console.warn("保存データの形式が正しくありません。");

      return null;
    }

    if (!hasValidCurrentPolicy(parsedData.state)) {
      console.warn("保存された政策が現在のカタログに存在しません。");

      return null;
    }

    return parsedData.state;
  } catch (error) {
    console.warn("ゲームデータの読み込みに失敗しました。", error);

    return null;
  }
}

// ==================================================
// セーブデータの削除
// ==================================================

export async function deleteSavedGame(): Promise<boolean> {
  try {
    await AsyncStorage.removeItem(GAME_SAVE_KEY);

    return true;
  } catch (error) {
    console.warn("ゲームデータの削除に失敗しました。", error);

    return false;
  }
}

// ==================================================
// セーブデータの存在確認
// ==================================================

export async function hasSavedGame(): Promise<boolean> {
  try {
    const savedJson = await AsyncStorage.getItem(GAME_SAVE_KEY);

    return savedJson !== null;
  } catch (error) {
    console.warn("セーブデータの確認に失敗しました。", error);

    return false;
  }
}

// ==================================================
// セーブ日時の取得
// ==================================================

export async function getSavedAt(): Promise<Date | null> {
  try {
    const savedJson = await AsyncStorage.getItem(GAME_SAVE_KEY);

    if (!savedJson) {
      return null;
    }

    const parsedData: unknown = JSON.parse(savedJson);

    if (!isStoredGameData(parsedData)) {
      return null;
    }

    return new Date(parsedData.savedAt);
  } catch (error) {
    console.warn("セーブ日時の取得に失敗しました。", error);

    return null;
  }
}
