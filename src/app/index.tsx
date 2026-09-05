// Reactの状態管理機能
import { useState } from "react";

// Expoのステータスバー
import { StatusBar } from "expo-status-bar";

// React Nativeの画面部品
import { ScrollView, StyleSheet, Text, View } from "react-native";

// ゲーム開始時の街データ
import { initialCityState } from "../data/initialCityState";

// 発展段階の英語データを日本語表示へ変換
const stageNames = {
  creation: "創生期",
  growth: "成長期",
  expansion: "拡大期",
  maturity: "成熟期",
  reorganization: "再編期",
};

export default function HomeScreen() {
  // 現在の街の状態をReactで管理する
  const [city] = useState(initialCityState);

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />

      {/* 上部のタイトルと年度 */}
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

        {/* 街の数値 */}
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
      </ScrollView>
    </View>
  );
}

// 数値カードが受け取るデータの型
type MetricCardProps = {
  label: string;
  value: number | string;
  unit: string;
};

// 同じ形の数値カードを繰り返し表示する部品
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

// 画面のデザイン
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
    paddingBottom: 40,
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
});
