import { StatusBar } from "expo-status-bar";
import { useState } from "react";

import { ScrollView, StyleSheet, Text, View } from "react-native";

import { NumericPolicyCard } from "../components/NumericPolicyCard";
import { PolicyCard } from "../components/PolicyCard";
import { initialCityState } from "../data/initialCityState";
import { firstPolicy, regularPolicies } from "../data/policies";
import { applyPolicyEffects } from "../utils/applyPolicyEffects";

// 発展段階の日本語名
const stageNames = {
  creation: "創生期",
  growth: "成長期",
  expansion: "拡大期",
  maturity: "成熟期",
  reorganization: "再編期",
};

// 現在のゲーム進行
type GamePhase = "cityStrategy" | "regularPolicy";

export default function HomeScreen() {
  // 現在の街の状態
  const [city, setCity] = useState(initialCityState);

  // 最初は都市戦略から始める
  const [phase, setPhase] = useState<GamePhase>("cityStrategy");

  // 現在表示している通常政策の番号
  const [currentPolicyIndex, setCurrentPolicyIndex] = useState(0);

  // 戦略型政策で選択している選択肢
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);

  // 数値型政策で選択している値
  const [numericValue, setNumericValue] = useState(() => {
    const firstRegularPolicy = regularPolicies[0];

    if (firstRegularPolicy.type === "numeric") {
      return firstRegularPolicy.defaultValue;
    }

    return 0;
  });

  // 直前の政策結果
  const [resultMessage, setResultMessage] = useState<string | null>(null);

  // 現在表示する通常政策
  const currentPolicy =
    regularPolicies[currentPolicyIndex % regularPolicies.length];

  // 発展段階の都市戦略を実行する
  function executeCityStrategy() {
    const selectedOption = firstPolicy.options.find(
      (option) => option.id === selectedOptionId,
    );

    if (!selectedOption) {
      return;
    }

    // 都市戦略なので年度は進めない
    setCity((currentCity) =>
      applyPolicyEffects(currentCity, selectedOption.effects, false),
    );

    setResultMessage(
      `「${selectedOption.label}」を都市の長期方針に決定しました。同じ1年目の通常政策へ進みます。`,
    );

    // 選択状態をリセットする
    setSelectedOptionId(null);

    // 通常政策へ移動する
    setPhase("regularPolicy");
  }

  // 戦略選択型の通常政策を実行する
  function executeRegularStrategy() {
    if (currentPolicy.type !== "strategy") {
      return;
    }

    const selectedOption = currentPolicy.options.find(
      (option) => option.id === selectedOptionId,
    );

    if (!selectedOption) {
      return;
    }

    // 通常政策なので年度を進める
    setCity((currentCity) =>
      applyPolicyEffects(currentCity, selectedOption.effects, true),
    );

    setResultMessage(
      `「${selectedOption.label}」を実行しました。街の状態に政策効果が反映されました。`,
    );

    moveToNextPolicy();
  }

  // 数値選択型の通常政策を実行する
  function executeNumericPolicy() {
    if (currentPolicy.type !== "numeric") {
      return;
    }

    // 選択した数値から結果を計算する
    const result = currentPolicy.calculateResult(numericValue, city);

    // 通常政策なので年度を進める
    setCity((currentCity) =>
      applyPolicyEffects(currentCity, result.effects, true),
    );

    setResultMessage(result.message);

    moveToNextPolicy();
  }

  // 次の通常政策へ移動する
  function moveToNextPolicy() {
    const nextPolicyIndex = (currentPolicyIndex + 1) % regularPolicies.length;

    const nextPolicy = regularPolicies[nextPolicyIndex];

    // 次の政策番号を保存する
    setCurrentPolicyIndex(nextPolicyIndex);

    // 前の戦略選択を解除する
    setSelectedOptionId(null);

    // 次が数値政策なら初期値を設定する
    if (nextPolicy.type === "numeric") {
      setNumericValue(nextPolicy.defaultValue);
    }
  }

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />

      {/* タイトルと現在の年度 */}
      <View style={styles.header}>
        <View>
          <Text style={styles.appName}>まちのかけひき</Text>

          <Text style={styles.subtitle}>政策選択型まちづくりゲーム</Text>
        </View>

        <View style={styles.yearArea}>
          <Text style={styles.yearLabel}>市政</Text>

          <Text style={styles.year}>{city.year}年目</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* 現在の発展段階 */}
        <View style={styles.stageCard}>
          <Text style={styles.sectionLabel}>CITY STAGE</Text>

          <Text style={styles.stageName}>{stageNames[city.stage]}</Text>

          <Text style={styles.stageDescription}>
            街を動かす財源と合意をつくる段階
          </Text>
        </View>

        {/* 街の状態 */}
        <Text style={styles.heading}>街の状態</Text>

        <View style={styles.metrics}>
          <MetricCard
            label="人口"
            value={city.population.toLocaleString()}
            unit="人"
          />

          <MetricCard label="財政" value={city.budget} unit="億円" />

          <MetricCard label="経済" value={city.economy} unit="pt" />

          <MetricCard label="都市基盤" value={city.infrastructure} unit="pt" />

          <MetricCard label="満足度" value={city.happiness} unit="pt" />

          <MetricCard label="信頼" value={city.trust} unit="pt" />
        </View>

        {/* 発展段階の都市戦略 */}
        {phase === "cityStrategy" && (
          <PolicyCard
            category="都市戦略"
            policy={firstPolicy}
            selectedOptionId={selectedOptionId}
            onSelectOption={setSelectedOptionId}
            onExecute={executeCityStrategy}
          />
        )}

        {/* 通常の数値政策 */}
        {phase === "regularPolicy" && currentPolicy.type === "numeric" && (
          <NumericPolicyCard
            policy={currentPolicy}
            city={city}
            value={numericValue}
            onChangeValue={setNumericValue}
            onExecute={executeNumericPolicy}
          />
        )}

        {/* 通常の戦略選択政策 */}
        {phase === "regularPolicy" && currentPolicy.type === "strategy" && (
          <PolicyCard
            category="政策戦略"
            policy={currentPolicy}
            selectedOptionId={selectedOptionId}
            onSelectOption={setSelectedOptionId}
            onExecute={executeRegularStrategy}
          />
        )}

        {/* 直前の政策結果 */}
        {resultMessage && (
          <View style={styles.resultBox}>
            <Text style={styles.resultLabel}>直前の政策結果</Text>

            <Text style={styles.resultText}>{resultMessage}</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// 数値カードが受け取るデータ
type MetricCardProps = {
  label: string;
  value: number | string;
  unit: string;
};

// 街の数値を表示する共通部品
function MetricCard({ label, value, unit }: MetricCardProps) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricLabel}>{label}</Text>

      <Text style={styles.metricValue}>
        {value}

        <Text style={styles.metricUnit}> {unit}</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#E8DFCC",
  },

  header: {
    paddingTop: 58,
    paddingHorizontal: 20,
    paddingBottom: 18,
    backgroundColor: "#0D2538",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  appName: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
  },

  subtitle: {
    marginTop: 2,
    color: "#A9C1CF",
    fontSize: 11,
  },

  yearArea: {
    alignItems: "flex-end",
  },

  yearLabel: {
    color: "#9AB4C4",
    fontSize: 11,
  },

  year: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "bold",
  },

  content: {
    padding: 14,
    paddingBottom: 50,
  },

  stageCard: {
    padding: 20,
    backgroundColor: "#FFFDF7",
    borderTopWidth: 5,
    borderTopColor: "#D99A37",
  },

  sectionLabel: {
    color: "#C95D36",
    fontSize: 11,
    fontWeight: "bold",
    letterSpacing: 2,
  },

  stageName: {
    marginTop: 8,
    color: "#142436",
    fontSize: 28,
    fontWeight: "bold",
  },

  stageDescription: {
    marginTop: 5,
    color: "#65717D",
    fontSize: 14,
  },

  heading: {
    marginTop: 22,
    marginBottom: 10,
    color: "#142436",
    fontSize: 18,
    fontWeight: "bold",
  },

  metrics: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  metricCard: {
    width: "48%",
    padding: 15,
    backgroundColor: "#FFFDF7",
    borderBottomWidth: 4,
    borderBottomColor: "#347F9E",
  },

  metricLabel: {
    color: "#65717D",
    fontSize: 13,
  },

  metricValue: {
    marginTop: 4,
    color: "#142436",
    fontSize: 23,
    fontWeight: "bold",
  },

  metricUnit: {
    color: "#65717D",
    fontSize: 11,
    fontWeight: "normal",
  },

  resultBox: {
    marginTop: 12,
    padding: 15,
    backgroundColor: "#E4EEE9",
    borderLeftWidth: 4,
    borderLeftColor: "#2D755E",
  },

  resultLabel: {
    color: "#2D755E",
    fontSize: 12,
    fontWeight: "bold",
  },

  resultText: {
    marginTop: 4,
    color: "#142436",
    fontSize: 15,
    lineHeight: 23,
  },
});
