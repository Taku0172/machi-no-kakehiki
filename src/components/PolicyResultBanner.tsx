import { StyleSheet, Text, View } from "react-native";

import type { CityMetric, DevelopmentModel, HistoryEntry } from "../types/game";

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

const developmentModelLabels: Record<
  DevelopmentModel,
  {
    name: string;
    revenueName: string;
  }
> = {
  industry: {
    name: "産業都市型",
    revenueName: "法人税・産業収入",
  },

  tourism: {
    name: "観光交流型",
    revenueName: "観光・交流収入",
  },

  living: {
    name: "生活都市型",
    revenueName: "定住・住民税収入",
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
          <Text style={styles.effectsLabel}>政策による直接変化</Text>

          <View style={styles.effectsList}>
            {effects.map(({ metric, value }) => (
              <EffectChip key={metric} metric={metric} value={value} />
            ))}
          </View>
        </View>
      )}

      {result.annualFinance && (
        <AnnualFinanceArea finance={result.annualFinance} />
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

type AnnualFinanceAreaProps = {
  finance: NonNullable<HistoryEntry["annualFinance"]>;
};

function AnnualFinanceArea({ finance }: AnnualFinanceAreaProps) {
  const modelDefinition = developmentModelLabels[finance.developmentModel];

  const isSurplus = finance.balance >= 0;

  return (
    <View style={styles.financeArea}>
      <View style={styles.financeHeader}>
        <View>
          <Text style={styles.financeLabel}>年間財政</Text>

          <Text style={styles.financeModel}>{modelDefinition.name}</Text>
        </View>

        <View
          style={[
            styles.balanceBadge,

            isSurplus ? styles.surplusBadge : styles.deficitBadge,
          ]}
        >
          <Text
            style={[
              styles.balanceBadgeText,

              isSurplus ? styles.surplusText : styles.deficitText,
            ]}
          >
            {isSurplus ? "黒字" : "赤字"}
          </Text>
        </View>
      </View>

      <View style={styles.revenueBreakdown}>
        <FinanceBreakdownRow
          label="基礎収入"
          value={finance.baseRevenue}
          valueType="income"
        />

        <FinanceBreakdownRow
          label={modelDefinition.revenueName}
          value={finance.modelRevenue}
          valueType="income"
        />
      </View>

      <View style={styles.financeGrid}>
        <FinanceValueCard
          label="税収合計"
          value={finance.taxRevenue}
          valueType="income"
        />

        <FinanceValueCard
          label="維持費"
          value={finance.maintenanceCost}
          valueType="expense"
        />

        {finance.debtServiceCost > 0 && (
          <FinanceValueCard
            label="赤字負担"
            value={finance.debtServiceCost}
            valueType="expense"
          />
        )}

        <FinanceValueCard
          label="年間収支"
          value={finance.balance}
          valueType={isSurplus ? "surplus" : "deficit"}
          emphasized
        />
      </View>

      <Text style={styles.financeNote}>
        発展モデルと街の状態によって、毎年の収入と維持費が変化します。
      </Text>
    </View>
  );
}

type FinanceValueType = "income" | "expense" | "surplus" | "deficit";

type FinanceValueCardProps = {
  label: string;
  value: number;
  valueType: FinanceValueType;
  emphasized?: boolean;
};

function FinanceValueCard({
  label,
  value,
  valueType,
  emphasized = false,
}: FinanceValueCardProps) {
  const displayValue =
    valueType === "expense"
      ? `-${Math.abs(value).toFixed(1)}`
      : value > 0
        ? `+${value.toFixed(1)}`
        : value.toFixed(1);

  return (
    <View
      style={[styles.financeCard, emphasized && styles.emphasizedFinanceCard]}
    >
      <Text style={styles.financeCardLabel}>{label}</Text>

      <Text
        style={[
          styles.financeCardValue,

          valueType === "income" && styles.incomeValue,

          valueType === "expense" && styles.expenseValue,

          valueType === "surplus" && styles.surplusValue,

          valueType === "deficit" && styles.deficitValue,
        ]}
      >
        {displayValue}

        <Text style={styles.financeUnit}> 億円</Text>
      </Text>
    </View>
  );
}

type FinanceBreakdownRowProps = {
  label: string;
  value: number;
  valueType: "income" | "expense";
};

function FinanceBreakdownRow({
  label,
  value,
  valueType,
}: FinanceBreakdownRowProps) {
  const prefix = valueType === "income" ? "+" : "-";

  return (
    <View style={styles.breakdownRow}>
      <Text style={styles.breakdownLabel}>{label}</Text>

      <Text style={styles.breakdownValue}>
        {prefix}
        {Math.abs(value).toFixed(1)}
        億円
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

  financeArea: {
    marginTop: 15,
    paddingTop: 13,
    borderTopWidth: 1,
    borderTopColor: "#B9CEC4",
  },

  financeHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  financeLabel: {
    color: "#17372D",
    fontSize: 12,
    fontWeight: "800",
  },

  financeModel: {
    marginTop: 2,
    color: "#62736B",
    fontSize: 9,
    fontWeight: "700",
  },

  balanceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
  },

  surplusBadge: {
    backgroundColor: "#EDF7F1",
    borderColor: "#9FC6AE",
  },

  deficitBadge: {
    backgroundColor: "#FFF0EC",
    borderColor: "#E1AE9F",
  },

  balanceBadgeText: {
    fontSize: 9,
    fontWeight: "800",
  },

  surplusText: {
    color: "#2D755E",
  },

  deficitText: {
    color: "#C95D36",
  },

  revenueBreakdown: {
    marginTop: 10,
    padding: 9,
    backgroundColor: "#DCE8E2",
  },

  breakdownRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  breakdownLabel: {
    color: "#5B6D64",
    fontSize: 9,
  },

  breakdownValue: {
    color: "#2D755E",
    fontSize: 10,
    fontWeight: "800",
  },

  financeGrid: {
    marginTop: 8,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },

  financeCard: {
    width: "48%",
    paddingHorizontal: 9,
    paddingVertical: 8,
    backgroundColor: "#F7F7F2",
    borderWidth: 1,
    borderColor: "#D2D9D5",
  },

  emphasizedFinanceCard: {
    borderWidth: 2,
    borderColor: "#9BB9AA",
  },

  financeCardLabel: {
    color: "#68746E",
    fontSize: 8,
    fontWeight: "700",
  },

  financeCardValue: {
    marginTop: 3,
    color: "#43524B",
    fontSize: 14,
    fontWeight: "800",
  },

  incomeValue: {
    color: "#347F9E",
  },

  expenseValue: {
    color: "#76588E",
  },

  surplusValue: {
    color: "#2D755E",
  },

  deficitValue: {
    color: "#C95D36",
  },

  financeUnit: {
    fontSize: 8,
    fontWeight: "500",
  },

  financeNote: {
    marginTop: 8,
    color: "#728078",
    fontSize: 8,
    lineHeight: 13,
  },
});
