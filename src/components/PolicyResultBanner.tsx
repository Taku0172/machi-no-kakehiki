import { StyleSheet, Text, View } from "react-native";

import type { CityMetric, HistoryEntry } from "../types/game";

type PolicyResultBannerProps = {
  result: HistoryEntry | null;
};

const metricLabels: Record<
  CityMetric,
  {
    label: string;
    unit: string;
    lowerIsBetter?: boolean;
  }
> = {
  population: {
    label: "人口",
    unit: "人",
  },

  budget: {
    label: "財政",
    unit: "億円",
  },

  economy: {
    label: "経済",
    unit: "pt",
  },

  infrastructure: {
    label: "都市基盤",
    unit: "pt",
  },

  happiness: {
    label: "満足度",
    unit: "pt",
  },

  trust: {
    label: "信頼",
    unit: "pt",
  },

  congestion: {
    label: "混雑",
    unit: "pt",
    lowerIsBetter: true,
  },

  environment: {
    label: "環境",
    unit: "pt",
  },
};

export function PolicyResultBanner({ result }: PolicyResultBannerProps) {
  if (!result) {
    return null;
  }

  const effects = Object.entries(result.effects)
    .filter(([, value]) => value !== undefined && value !== 0)
    .map(([key, value]) => ({
      metric: key as CityMetric,
      value: value ?? 0,
    }));

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.resultBadge}>
          <Text style={styles.resultBadgeText}>政策結果</Text>
        </View>

        <Text style={styles.year}>{result.year}年目</Text>
      </View>

      <Text style={styles.policyTitle}>{result.policyTitle}</Text>

      <View style={styles.decisionRow}>
        <Text style={styles.decisionLabel}>選択</Text>

        <Text style={styles.decisionText}>{result.decision}</Text>
      </View>

      <Text style={styles.resultText}>{result.result}</Text>

      {effects.length > 0 && (
        <View style={styles.effectsArea}>
          <Text style={styles.effectsLabel}>街への変化</Text>

          <View style={styles.effectsList}>
            {effects.map(({ metric, value }) => (
              <EffectChip key={metric} metric={metric} value={value} />
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

type EffectChipProps = {
  metric: CityMetric;
  value: number;
};

function EffectChip({ metric, value }: EffectChipProps) {
  const definition = metricLabels[metric];

  const isPositiveChange = definition.lowerIsBetter ? value < 0 : value > 0;

  const isNegativeChange = definition.lowerIsBetter ? value > 0 : value < 0;

  const valueText =
    value > 0 ? `+${value.toLocaleString()}` : value.toLocaleString();

  return (
    <View
      style={[
        styles.effectChip,
        isPositiveChange && styles.positiveChip,
        isNegativeChange && styles.negativeChip,
      ]}
    >
      <Text style={styles.effectMetric}>{definition.label}</Text>

      <Text
        style={[
          styles.effectValue,
          isPositiveChange && styles.positiveValue,
          isNegativeChange && styles.negativeValue,
        ]}
      >
        {valueText}
        <Text style={styles.effectUnit}> {definition.unit}</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: "#E6EFEA",
    borderLeftWidth: 4,
    borderLeftColor: "#2D755E",
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  resultBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "#2D755E",
  },

  resultBadgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "800",
  },

  year: {
    color: "#64736B",
    fontSize: 10,
    fontWeight: "700",
  },

  policyTitle: {
    marginTop: 10,
    color: "#17372D",
    fontSize: 16,
    fontWeight: "800",
  },

  decisionRow: {
    marginTop: 7,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 7,
  },

  decisionLabel: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    color: "#FFFFFF",
    backgroundColor: "#6B8077",
    fontSize: 8,
    fontWeight: "800",
  },

  decisionText: {
    flex: 1,
    color: "#43594F",
    fontSize: 12,
    fontWeight: "700",
  },

  resultText: {
    marginTop: 9,
    color: "#40534B",
    fontSize: 12,
    lineHeight: 18,
  },

  effectsArea: {
    marginTop: 13,
    paddingTop: 11,
    borderTopWidth: 1,
    borderTopColor: "#C5D5CD",
  },

  effectsLabel: {
    marginBottom: 7,
    color: "#63756D",
    fontSize: 9,
    fontWeight: "800",
  },

  effectsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },

  effectChip: {
    minWidth: 83,
    paddingHorizontal: 8,
    paddingVertical: 7,
    backgroundColor: "#F6F6F1",
    borderWidth: 1,
    borderColor: "#D4D7D1",
  },

  positiveChip: {
    backgroundColor: "#F0F8F3",
    borderColor: "#AFCDBD",
  },

  negativeChip: {
    backgroundColor: "#FFF1ED",
    borderColor: "#E4B9AC",
  },

  effectMetric: {
    color: "#68746E",
    fontSize: 8,
    fontWeight: "700",
  },

  effectValue: {
    marginTop: 2,
    color: "#4D5B55",
    fontSize: 13,
    fontWeight: "800",
  },

  positiveValue: {
    color: "#2D755E",
  },

  negativeValue: {
    color: "#C95D36",
  },

  effectUnit: {
    fontSize: 8,
    fontWeight: "500",
  },
});
