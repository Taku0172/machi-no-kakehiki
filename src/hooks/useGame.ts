import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AppState } from "react-native";

import {
    createInitialGameState,
    executeNumericDecision,
    executeStrategyDecision,
    getCurrentPolicy,
} from "../engine/gameEngine";
import { calculateCityScores } from "../engine/scoreEngine";
import { deleteSavedGame, loadGame, saveGame } from "../storage/gameStorage";

import type { GameState, HistoryEntry } from "../types/game";

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

  // 初回ロードが終わる前に、
  // 初期状態でセーブデータを上書きしないためのフラグ
  const hasLoadedRef = useRef(false);

  // 常に最新状態をRefへ反映する
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

  const selectStrategyOption = useCallback((optionId: string) => {
    setGameState((currentState) =>
      executeStrategyDecision(currentState, optionId),
    );
  }, []);

  // ==================================================
  // 数値選択
  // ==================================================

  const submitNumericValue = useCallback((value: number) => {
    setGameState((currentState) => executeNumericDecision(currentState, value));
  }, []);

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
    // 古いセーブデータを削除する
    await deleteSavedGame();

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
