import { StatusBar } from "expo-status-bar";
import { useState } from "react";

import { ScrollView, StyleSheet, Text, View } from "react-native";

import { PolicyCard } from "../components/PolicyCard";
import { initialCityState } from "../data/initialCityState";
import { firstPolicy } from "../data/policies";
import { CityMetric } from "../types/game";

// 発展段階の日本語名
const stageNames = {
  creation: "創生期",
  growth: "成長期",
  expansion: "拡大期",
  maturity: "成熟期",
  reorganization: "再編期",
};

export default function HomeScreen() {
  // 現在の街の状態
  const [city, setCity] = useState(initialCityState);

  // 現在選択している戦略
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);

  // 政策実行後に表示する文章
  const [resultMessage, setResultMessage] = useState<string | null>(null);

  // 選択した戦略を実行する
  function executePolicy() {
    const selectedOption = firstPolicy.options.find(
      (option) => option.id === selectedOptionId,
    );

    // 戦略が選択されていなければ何もしない
    if (!selectedOption) {
      return;
    }

    setCity((currentCity) => {
      // 現在の街をコピーする
      const updatedCity = { ...currentCity };

      // 選択した戦略の効果を順番に反映する
      Object.entries(selectedOption.effects).forEach(([key, value]) => {
        const metric = key as CityMetric;
        const change = value ?? 0;

        updatedCity[metric] += change;

        // 人口と財政以外は0〜100の範囲に収める
        if (metric !== "population" && metric !== "budget") {
          updatedCity[metric] = Math.max(0, Math.min(100, updatedCity[metric]));
        }
      });

      return updatedCity;
    });

    setResultMessage(`「${selectedOption.label}」を実行しました。`);
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

        {/* 最初の政策課題 */}
        <PolicyCard
          policy={firstPolicy}
          selectedOptionId={selectedOptionId}
          onSelectOption={setSelectedOptionId}
          onExecute={executePolicy}
        />

        {/* 政策実行後の結果 */}
        {resultMessage && (
          <View style={styles.resultBox}>
            <Text style={styles.resultLabel}>政策結果</Text>

            <Text style={styles.resultText}>{resultMessage}</Text>
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
  },
});
