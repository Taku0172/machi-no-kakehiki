import { StatusBar } from "expo-status-bar";
import { useState } from "react";

import { ScrollView, StyleSheet, Text, View } from "react-native";

import { NumericPolicyCard } from "../components/NumericPolicyCard";
import { PolicyCard } from "../components/PolicyCard";
import { initialCityState } from "../data/initialCityState";
import { firstPolicy, waterPolicy } from "../data/policies";
import { applyPolicyEffects } from "../utils/applyPolicyEffects";

// 発展段階の日本語名
const stageNames = {
  creation: "創生期",
  growth: "成長期",
  expansion: "拡大期",
  maturity: "成熟期",
  reorganization: "再編期",
};

// 現在どの政策場面にいるか
type GamePhase = "cityStrategy" | "regularPolicy" | "completed";

export default function HomeScreen() {
  // 現在の街の状態
  const [city, setCity] = useState(initialCityState);

  // 最初は都市戦略から始める
  const [phase, setPhase] = useState<GamePhase>("cityStrategy");

  // 現在選択している戦略
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);

  // 水道政策で選択している金額
  const [numericValue, setNumericValue] = useState(waterPolicy.defaultValue);

  // 政策実行後に表示する文章
  const [resultMessage, setResultMessage] = useState<string | null>(null);

  // 都市戦略を実行する
  function executeStrategyPolicy() {
    const selectedOption = firstPolicy.options.find(
      (option) => option.id === selectedOptionId,
    );

    // 戦略が選択されていなければ何もしない
    if (!selectedOption) {
      return;
    }

    // 都市戦略の効果を反映する
    // 第3引数がfalseなので年度は進まない
    setCity((currentCity) =>
      applyPolicyEffects(currentCity, selectedOption.effects, false),
    );

    setResultMessage(
      `「${selectedOption.label}」を実行しました。同じ1年目の通常政策へ進みます。`,
    );

    // 通常政策の画面へ切り替える
    setSelectedOptionId(null);
    setPhase("regularPolicy");
  }

  // 数値政策を実行する
  function executeNumericPolicy() {
    // 選択した金額と現在の街から結果を計算する
    const result = waterPolicy.calculateResult(numericValue, city);

    // 通常政策の効果を反映する
    // 第3引数がtrueなので年度が1年進む
    setCity((currentCity) =>
      applyPolicyEffects(currentCity, result.effects, true),
    );

    setResultMessage(result.message);
    setPhase("completed");
  }

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />

      {/* タイトルと年度 */}
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
        {/* 発展段階 */}
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
            policy={firstPolicy}
            selectedOptionId={selectedOptionId}
            onSelectOption={setSelectedOptionId}
            onExecute={executeStrategyPolicy}
          />
        )}

        {/* 同じ年度に行う通常政策 */}
        {phase === "regularPolicy" && (
          <NumericPolicyCard
            policy={waterPolicy}
            city={city}
            value={numericValue}
            onChangeValue={setNumericValue}
            onExecute={executeNumericPolicy}
          />
        )}

        {/* 政策実行後の結果 */}
        {resultMessage && (
          <View style={styles.resultBox}>
            <Text style={styles.resultLabel}>
              {phase === "completed" ? "2年目へ進みました" : "都市戦略の結果"}
            </Text>

            <Text style={styles.resultText}>{resultMessage}</Text>

            {phase === "completed" && (
              <Text style={styles.nextMessage}>
                次の政策課題は、次の実装で追加します。
              </Text>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

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

  nextMessage: {
    marginTop: 8,
    color: "#65717D",
    fontSize: 13,
  },
});
