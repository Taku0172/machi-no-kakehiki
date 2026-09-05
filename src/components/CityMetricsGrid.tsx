import { StyleSheet, Text, View } from "react-native";

import type { CityMetric, CityState } from "../types/game";

type CityMetricsGridProps = {
  city: CityState;
  previousCity?: CityState | null;
};

type MetricDefinition = {
  key: CityMetric;
  label: string;
  unit: string;
  color: string;
  lowerIsBetter?: boolean;
  format?: (value: number) => string;
};

const metricDefinitions: MetricDefinition[] = [
  {
    key: "population",
    label: "人口",
    unit: "人",
    color: "#347F9E",
    format: (value) => Math.round(value).toLocaleString(),
  },
  {
    key: "budget",
    label: "財政",
    unit: "億円",
    color: "#76588E",
  },
  {
    key: "economy",
    label: "経済",
    unit: "pt",
    color: "#C95D36",
  },
  {
    key: "infrastructure",
    label: "都市基盤",
    unit: "pt",
    color: "#347F9E",
  },
  {
    key: "happiness",
    label: "満足度",
    unit: "pt",
    color: "#D99A37",
  },
  {
    key: "trust",
    label: "信頼",
    unit: "pt",
    color: "#2D755E",
  },
  {
    key: "congestion",
    label: "混雑",
    unit: "pt",
    color: "#C95D36",
    lowerIsBetter: true,
  },
  {
    key: "environment",
    label: "環境",
    unit: "pt",
    color: "#4C8C68",
  },
];

export function CityMetricsGrid({
  city,
  previousCity = null,
}: CityMetricsGridProps) {
  return (
    <View>
      <View style={styles.headingRow}>
        <Text style={styles.heading}>街の状態</Text>

        <Text style={styles.headingNote}>混雑のみ低い方が良好</Text>
      </View>

      <View style={styles.grid}>
        {metricDefinitions.map((definition) => {
          const value = city[definition.key];

          const previousValue = previousCity?.[definition.key];

          const change =
            previousValue === undefined ? null : value - previousValue;

          return (
            <MetricCard
              key={definition.key}
              definition={definition}
              value={value}
              change={change}
            />
          );
        })}
      </View>
    </View>
  );
}

type MetricCardProps = {
  definition: MetricDefinition;
  value: number;
  change: number | null;
};

function MetricCard({ definition, value, change }: MetricCardProps) {
  const displayValue = definition.format
    ? definition.format(value)
    : Math.round(value).toLocaleString();

  const isNegativeBudget = definition.key === "budget" && value < 0;

  const isDangerousCongestion = definition.key === "congestion" && value >= 70;

  const isDanger = isNegativeBudget || isDangerousCongestion;

  const changeIsGood =
    change !== null &&
    change !== 0 &&
    (definition.lowerIsBetter ? change < 0 : change > 0);

  const changeIsBad = change !== null && change !== 0 && !changeIsGood;

  const changeText =
    change === null
      ? null
      : change > 0
        ? `+${change.toLocaleString()}`
        : change === 0
          ? "—"
          : change.toLocaleString();

  return (
    <View
      style={[
        styles.card,
        {
          borderBottomColor: isDanger ? "#C95D36" : definition.color,
        },
      ]}
      accessibilityLabel={
        `${definition.label}` + `${displayValue}` + `${definition.unit}`
      }
    >
      <View style={styles.cardHeader}>
        <Text style={styles.label}>{definition.label}</Text>

        {changeText && (
          <Text
            style={[
              styles.change,
              changeIsGood && styles.changeGood,
              changeIsBad && styles.changeBad,
              change === 0 && styles.changeNeutral,
            ]}
          >
            {changeText}
          </Text>
        )}
      </View>

      <View style={styles.valueRow}>
        <Text
          style={[styles.value, isDanger && styles.dangerValue]}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {displayValue}
        </Text>

        <Text style={styles.unit}>{definition.unit}</Text>
      </View>

      {isNegativeBudget && <Text style={styles.warning}>財政赤字</Text>}

      {isDangerousCongestion && <Text style={styles.warning}>深刻な混雑</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  headingRow: {
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },

  heading: {
    color: "#142436",
    fontSize: 18,
    fontWeight: "800",
  },

  headingNote: {
    color: "#7A746A",
    fontSize: 9,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  card: {
    width: "48.7%",
    minHeight: 92,
    paddingHorizontal: 13,
    paddingVertical: 12,
    backgroundColor: "#FFFDF7",
    borderBottomWidth: 4,
  },

  cardHeader: {
    minHeight: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  label: {
    color: "#65717D",
    fontSize: 12,
    fontWeight: "600",
  },

  change: {
    fontSize: 11,
    fontWeight: "700",
  },

  changeGood: {
    color: "#2D755E",
  },

  changeBad: {
    color: "#C95D36",
  },

  changeNeutral: {
    color: "#8C9298",
  },

  valueRow: {
    marginTop: 5,
    flexDirection: "row",
    alignItems: "baseline",
  },

  value: {
    flexShrink: 1,
    color: "#142436",
    fontSize: 23,
    fontWeight: "800",
  },

  dangerValue: {
    color: "#C95D36",
  },

  unit: {
    marginLeft: 4,
    color: "#7B858E",
    fontSize: 10,
  },

  warning: {
    marginTop: 4,
    color: "#C95D36",
    fontSize: 9,
    fontWeight: "700",
  },
});
