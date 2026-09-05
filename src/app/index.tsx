import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  loadAnalyticsConsent,
  saveAnalyticsConsent,
} from "../analytics/analyticsConsent";
import { clearAnalyticsSession } from "../analytics/gameAnalytics";

import type { AnalyticsConsentChoice } from "../analytics/analyticsConsent";
import type { CityState } from "../types/game";

import { AnalyticsConsentScreen } from "../components/AnalyticsConsentScreen";
import { AnalyticsSettingsModal } from "../components/AnalyticsSettingsModal";
import { CityMetricsGrid } from "../components/CityMetricsGrid";
import { CityScoreBar } from "../components/CityScoreBar";
import { CurrentPolicySection } from "../components/CurrentPolicySection";
import { GameHeader } from "../components/GameHeader";
import { GameIntroScreen } from "../components/GameIntroScreen";
import { GameResultScreen } from "../components/GameResultScreen";
import { PolicyHistory } from "../components/PolicyHistory";
import { PolicyResultBanner } from "../components/PolicyResultBanner";
import { StageProgress } from "../components/StageProgress";

import { useGame } from "../hooks/useGame";

export default function HomeScreen() {
  const [hasEnteredGame, setHasEnteredGame] = useState(false);

  const [analyticsConsent, setAnalyticsConsent] =
    useState<AnalyticsConsentChoice | null>(null);

  const [isConsentLoading, setIsConsentLoading] = useState(true);

  const [isAnalyticsSettingsVisible, setIsAnalyticsSettingsVisible] =
    useState(false);

  const [isAnalyticsConsentUpdating, setIsAnalyticsConsentUpdating] =
    useState(false);

  const {
    gameState,
    city,
    scores,
    currentPolicy,
    lastResult,

    isLoading,
    isSaving,
    saveError,

    selectStrategyOption,
    submitNumericValue,
    startNewGame,
  } = useGame();

  useEffect(() => {
    let isMounted = true;

    async function restoreAnalyticsConsent() {
      const storedConsent = await loadAnalyticsConsent();

      if (isMounted) {
        setAnalyticsConsent(storedConsent);
        setIsConsentLoading(false);
      }
    }

    void restoreAnalyticsConsent();

    return () => {
      isMounted = false;
    };
  }, []);

  const hasExistingProgress =
    gameState.history.length > 0 || gameState.city.year > 1;

  const hasChosenDevelopmentModel =
    gameState.completedStageStrategies.includes("creation");

  const previousTimelinePoint = useMemo(() => {
    if (gameState.timeline.length < 2) {
      return null;
    }

    return gameState.timeline[gameState.timeline.length - 2];
  }, [gameState.timeline]);

  const previousCity: CityState | null = useMemo(() => {
    if (!previousTimelinePoint) {
      return null;
    }

    return {
      year: previousTimelinePoint.year,
      stage: city.stage,
      population: previousTimelinePoint.population,
      budget: previousTimelinePoint.budget,
      economy: previousTimelinePoint.economy,
      infrastructure: previousTimelinePoint.infrastructure,
      happiness: previousTimelinePoint.happiness,
      trust: previousTimelinePoint.trust,
      congestion: previousTimelinePoint.congestion,
      environment: previousTimelinePoint.environment,
    };
  }, [previousTimelinePoint, city.stage]);

  async function handleInitialAnalyticsChoice(choice: AnalyticsConsentChoice) {
    try {
      await saveAnalyticsConsent(choice);

      // 古い匿名セッションが残っている場合に備えて削除する
      await clearAnalyticsSession();
    } catch {
      // 保存に失敗した場合でも、選択された設定でゲームを続行する
    }

    setAnalyticsConsent(choice);
  }

  async function handleAnalyticsSettingChange(choice: AnalyticsConsentChoice) {
    if (isAnalyticsConsentUpdating) {
      return;
    }

    setIsAnalyticsConsentUpdating(true);

    try {
      await saveAnalyticsConsent(choice);

      // 設定変更後は新しい匿名セッションを使用する
      await clearAnalyticsSession();

      setAnalyticsConsent(choice);
    } catch (error) {
      console.warn("プレイデータの設定を変更できませんでした。", error);
    } finally {
      setIsAnalyticsConsentUpdating(false);
    }
  }

  async function handleRestart() {
    await startNewGame();
    setHasEnteredGame(false);
  }

  function openPrivacyPolicy() {
    router.push("/privacy");
  }

  // セーブデータと同意状態の読み込み中
  if (isLoading || isConsentLoading) {
    return (
      <SafeAreaView style={styles.loadingScreen}>
        <StatusBar style="light" />

        <ActivityIndicator size="large" color="#D99A37" />

        <Text style={styles.loadingTitle}>街を読み込んでいます</Text>

        <Text style={styles.loadingText}>保存された市政データを確認中です</Text>
      </SafeAreaView>
    );
  }

  // プレイデータ収集への同意画面
  if (analyticsConsent === null) {
    return (
      <AnalyticsConsentScreen
        onAccept={() => {
          void handleInitialAnalyticsChoice("accepted");
        }}
        onDecline={() => {
          void handleInitialAnalyticsChoice("declined");
        }}
      />
    );
  }

  // ゲーム説明画面
  if (!hasEnteredGame) {
    return (
      <SafeAreaView style={styles.introScreen}>
        <StatusBar style="dark" />

        <GameIntroScreen
          hasExistingProgress={hasExistingProgress}
          currentYear={city.year}
          onStart={() => setHasEnteredGame(true)}
        />
      </SafeAreaView>
    );
  }

  // 50年終了後の結果画面
  if (gameState.isFinished || gameState.phase === "finished") {
    return (
      <SafeAreaView style={styles.resultScreen}>
        <StatusBar style="light" />

        <View style={styles.resultHeader}>
          <View style={styles.resultHeaderTextArea}>
            <Text style={styles.resultAppName}>まちのかけひき</Text>
            <Text style={styles.resultHeaderText}>市政結果</Text>
          </View>

          <View style={styles.resultHeaderActions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="プライバシーポリシーを開く"
              onPress={openPrivacyPolicy}
              style={({ pressed }) => [
                styles.headerUtilityButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.headerUtilityButtonText}>プライバシー</Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="プレイデータの設定を開く"
              onPress={() => setIsAnalyticsSettingsVisible(true)}
              style={({ pressed }) => [
                styles.headerUtilityButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.headerUtilityButtonText}>データ設定</Text>
            </Pressable>
          </View>
        </View>

        <GameResultScreen gameState={gameState} onRestart={handleRestart} />

        <AnalyticsSettingsModal
          visible={isAnalyticsSettingsVisible}
          consent={analyticsConsent}
          isUpdating={isAnalyticsConsentUpdating}
          onChangeConsent={(choice) => {
            void handleAnalyticsSettingChange(choice);
          }}
          onClose={() => setIsAnalyticsSettingsVisible(false)}
        />
      </SafeAreaView>
    );
  }

  // 通常のゲーム画面
  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="light" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <GameHeader
          city={city}
          developmentModel={gameState.developmentModel}
          hasChosenDevelopmentModel={hasChosenDevelopmentModel}
          isSaving={isSaving}
        />

        <CityScoreBar
          scores={scores}
          previousScores={previousTimelinePoint?.scores ?? null}
        />

        {saveError && (
          <View style={styles.saveErrorBox}>
            <Text style={styles.saveErrorTitle}>
              ゲームを保存できませんでした
            </Text>

            <Text style={styles.saveErrorText}>{saveError}</Text>
          </View>
        )}

        <StageProgress currentStage={city.stage} />

        <View style={styles.mainContent}>
          <CityMetricsGrid city={city} previousCity={previousCity} />

          {lastResult && (
            <View style={styles.sectionSpacing}>
              <PolicyResultBanner result={lastResult} />
            </View>
          )}

          {currentPolicy ? (
            <View style={styles.sectionSpacing}>
              <CurrentPolicySection
                policy={currentPolicy}
                city={city}
                phase={gameState.phase}
                onExecuteStrategy={selectStrategyOption}
                onExecuteNumeric={submitNumericValue}
              />
            </View>
          ) : (
            <View style={styles.noPolicyBox}>
              <Text style={styles.noPolicyTitle}>
                次の政策を読み込めませんでした
              </Text>

              <Text style={styles.noPolicyText}>
                保存データと政策カタログの状態が一致していない可能性があります。
              </Text>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="最初からやり直す"
                onPress={() => {
                  void handleRestart();
                }}
                style={({ pressed }) => [
                  styles.newGameButton,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text style={styles.newGameButtonText}>最初からやり直す</Text>
              </Pressable>
            </View>
          )}

          <PolicyHistory history={gameState.history} />

          <View style={styles.footer}>
            <Text style={styles.footerTitle}>まちのかけひき</Text>

            <Text style={styles.footerText}>
              政策に正解は一つではありません。誰が利益を得て、誰が費用を負担するのかを考えながら、50年間の市政を進めてください。
            </Text>

            <View style={styles.saveStatus}>
              <View
                style={[
                  styles.saveDot,
                  {
                    backgroundColor: isSaving ? "#D99A37" : "#2D755E",
                  },
                ]}
              />

              <Text style={styles.saveStatusText}>
                {isSaving
                  ? "ゲームを保存しています"
                  : "ゲームは自動保存されています"}
              </Text>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="プレイデータの設定を開く"
              onPress={() => setIsAnalyticsSettingsVisible(true)}
              style={({ pressed }) => [
                styles.dataSettingsButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.dataSettingsButtonText}>
                プレイデータの設定
              </Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="プライバシーポリシーを開く"
              onPress={openPrivacyPolicy}
              style={({ pressed }) => [
                styles.privacyButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.privacyButtonText}>プライバシーポリシー</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      <AnalyticsSettingsModal
        visible={isAnalyticsSettingsVisible}
        consent={analyticsConsent}
        isUpdating={isAnalyticsConsentUpdating}
        onChangeConsent={(choice) => {
          void handleAnalyticsSettingChange(choice);
        }}
        onClose={() => setIsAnalyticsSettingsVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#0D2538",
  },

  introScreen: {
    flex: 1,
    backgroundColor: "#E8DFCC",
  },

  scrollView: {
    flex: 1,
    backgroundColor: "#E8DFCC",
  },

  scrollContent: {
    paddingBottom: 0,
  },

  loadingScreen: {
    flex: 1,
    backgroundColor: "#0D2538",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },

  loadingTitle: {
    marginTop: 18,
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },

  loadingText: {
    marginTop: 6,
    color: "#A9C1CF",
    fontSize: 11,
  },

  resultScreen: {
    flex: 1,
    backgroundColor: "#0D2538",
  },

  resultHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#0D2538",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  resultHeaderTextArea: {
    flex: 1,
  },

  resultAppName: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
  },

  resultHeaderText: {
    marginTop: 2,
    color: "#D99A37",
    fontSize: 11,
    fontWeight: "700",
  },

  resultHeaderActions: {
    marginLeft: 10,
    flexDirection: "row",
    gap: 6,
  },

  headerUtilityButton: {
    minHeight: 38,
    paddingHorizontal: 9,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#557084",
  },

  headerUtilityButtonText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },

  saveErrorBox: {
    marginHorizontal: 14,
    marginTop: 12,
    padding: 12,
    backgroundColor: "#FFF0EC",
    borderLeftWidth: 4,
    borderLeftColor: "#C95D36",
  },

  saveErrorTitle: {
    color: "#A84628",
    fontSize: 12,
    fontWeight: "800",
  },

  saveErrorText: {
    marginTop: 3,
    color: "#765449",
    fontSize: 10,
    lineHeight: 15,
  },

  mainContent: {
    paddingHorizontal: 14,
    paddingBottom: 35,
  },

  sectionSpacing: {
    marginTop: 14,
  },

  noPolicyBox: {
    marginTop: 14,
    padding: 17,
    backgroundColor: "#FFFDF7",
    borderTopWidth: 4,
    borderTopColor: "#C95D36",
  },

  noPolicyTitle: {
    color: "#142436",
    fontSize: 16,
    fontWeight: "800",
  },

  noPolicyText: {
    marginTop: 7,
    color: "#64717A",
    fontSize: 12,
    lineHeight: 18,
  },

  newGameButton: {
    minHeight: 48,
    marginTop: 14,
    backgroundColor: "#C95D36",
    alignItems: "center",
    justifyContent: "center",
  },

  newGameButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },

  buttonPressed: {
    opacity: 0.75,
  },

  footer: {
    marginTop: 18,
    padding: 17,
    backgroundColor: "#142D41",
  },

  footerTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },

  footerText: {
    marginTop: 6,
    color: "#A9C1CF",
    fontSize: 10,
    lineHeight: 16,
  },

  saveStatus: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  saveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },

  saveStatusText: {
    color: "#8FA9B9",
    fontSize: 9,
  },

  dataSettingsButton: {
    minHeight: 42,
    marginTop: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#557084",
  },

  dataSettingsButtonText: {
    color: "#C5D5DE",
    fontSize: 11,
    fontWeight: "700",
  },

  privacyButton: {
    minHeight: 42,
    marginTop: 8,
    alignItems: "center",
    justifyContent: "center",
  },

  privacyButtonText: {
    color: "#A9C1CF",
    fontSize: 10,
    fontWeight: "700",
    textDecorationLine: "underline",
  },
});
