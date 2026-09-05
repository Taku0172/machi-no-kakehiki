import Slider from "@react-native-community/slider";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { CityState, GamePhase, Policy } from "../types/game";

type CurrentPolicySectionProps = {
  policy: Policy;
  city: CityState;
  phase: GamePhase;

  onExecuteStrategy: (optionId: string) => void;

  onExecuteNumeric: (value: number) => void;
};

export function CurrentPolicySection({
  policy,
  city,
  phase,
  onExecuteStrategy,
  onExecuteNumeric,
}: CurrentPolicySectionProps) {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);

  const [numericValue, setNumericValue] = useState(
    policy.type === "numeric" ? policy.defaultValue : 0,
  );

  // 政策が切り替わったら選択状態を初期化する
  useEffect(() => {
    setSelectedOptionId(null);

    if (policy.type === "numeric") {
      setNumericValue(policy.defaultValue);
    }
  }, [policy.id]);

  const categoryLabel = getCategoryLabel(phase, policy.type);

  const advancesYear = phase === "regularPolicy";

  return (
    <View style={styles.container}>
      <View style={styles.categoryRow}>
        <View
          style={[
            styles.categoryBadge,
            phase === "stageStrategy" && styles.stageBadge,
            phase === "strategyReview" && styles.reviewBadge,
          ]}
        >
          <Text style={styles.categoryText}>{categoryLabel}</Text>
        </View>

        <Text style={styles.yearRule}>
          {advancesYear
            ? "実行すると翌年度へ進みます"
            : "この選択では年度は進みません"}
        </Text>
      </View>

      <Text style={styles.title}>{policy.title}</Text>

      <Text style={styles.description}>{policy.description}</Text>

      <View style={styles.contextBox}>
        <Text style={styles.contextLabel}>なぜ判断が必要？</Text>

        <Text style={styles.contextText}>{policy.reason}</Text>
      </View>

      {policy.type === "strategy" ? (
        <View style={styles.decisionArea}>
          <Text style={styles.decisionLabel}>戦略を選択</Text>

          <View style={styles.optionList}>
            {policy.options.map((option) => {
              const isSelected = option.id === selectedOptionId;

              return (
                <Pressable
                  key={option.id}
                  onPress={() => setSelectedOptionId(option.id)}
                  style={({ pressed }) => [
                    styles.optionCard,
                    isSelected && styles.selectedOption,
                    pressed && styles.pressedOption,
                  ]}
                  accessibilityRole="radio"
                  accessibilityState={{
                    selected: isSelected,
                  }}
                >
                  <View style={styles.optionHeader}>
                    <View
                      style={[
                        styles.radioOuter,
                        isSelected && styles.selectedRadioOuter,
                      ]}
                    >
                      {isSelected && <View style={styles.radioInner} />}
                    </View>

                    <Text
                      style={[
                        styles.optionLabel,
                        isSelected && styles.selectedOptionLabel,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </View>

                  <Text style={styles.optionDescription}>
                    {option.description}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Pressable
            disabled={!selectedOptionId}
            onPress={() => {
              if (selectedOptionId) {
                onExecuteStrategy(selectedOptionId);
              }
            }}
            style={({ pressed }) => [
              styles.executeButton,
              !selectedOptionId && styles.disabledButton,
              pressed && selectedOptionId && styles.pressedButton,
            ]}
          >
            <Text
              style={[
                styles.executeButtonText,
                !selectedOptionId && styles.disabledButtonText,
              ]}
            >
              この戦略を実行する
            </Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.decisionArea}>
          <Text style={styles.decisionLabel}>数値を設定</Text>

          <View style={styles.numericPanel}>
            <Text style={styles.valueLabel}>{policy.valueLabel}</Text>

            <View style={styles.valueRow}>
              <Text style={styles.value}>{numericValue.toLocaleString()}</Text>

              <Text style={styles.unit}>{policy.unit}</Text>
            </View>

            <Slider
              style={styles.slider}
              minimumValue={policy.min}
              maximumValue={policy.max}
              step={policy.step}
              value={numericValue}
              onValueChange={setNumericValue}
              minimumTrackTintColor="#C95D36"
              maximumTrackTintColor="#D5D0C5"
              thumbTintColor="#C95D36"
              accessibilityLabel={policy.valueLabel}
            />

            <View style={styles.rangeRow}>
              <Text style={styles.rangeText}>
                {policy.min.toLocaleString()}
                {policy.unit}
              </Text>

              <Text style={styles.rangeText}>
                {policy.max.toLocaleString()}
                {policy.unit}
              </Text>
            </View>

            <View style={styles.adjustmentRow}>
              <AdjustmentButton
                label={`−${policy.step}`}
                disabled={numericValue <= policy.min}
                onPress={() =>
                  setNumericValue(
                    Math.max(policy.min, numericValue - policy.step),
                  )
                }
              />

              <Pressable
                onPress={() => setNumericValue(policy.defaultValue)}
                style={({ pressed }) => [
                  styles.defaultButton,
                  pressed && styles.adjustmentPressed,
                ]}
              >
                <Text style={styles.defaultButtonText}>標準値</Text>
              </Pressable>

              <AdjustmentButton
                label={`＋${policy.step}`}
                disabled={numericValue >= policy.max}
                onPress={() =>
                  setNumericValue(
                    Math.min(policy.max, numericValue + policy.step),
                  )
                }
              />
            </View>
          </View>

          <View style={styles.forecastBox}>
            <Text style={styles.forecastLabel}>政策担当者の予測</Text>

            <Text style={styles.forecastText}>
              {policy.getForecast(numericValue, city)}
            </Text>
          </View>

          <Pressable
            onPress={() => onExecuteNumeric(numericValue)}
            style={({ pressed }) => [
              styles.executeButton,
              pressed && styles.pressedButton,
            ]}
          >
            <Text style={styles.executeButtonText}>この数値で実行する</Text>
          </Pressable>
        </View>
      )}

      <View style={styles.theoryRow}>
        <Text style={styles.theoryLabel}>GAME THEORY</Text>

        <Text style={styles.theoryText}>{policy.theory}</Text>
      </View>
    </View>
  );
}

function getCategoryLabel(
  phase: GamePhase,
  policyType: Policy["type"],
): string {
  if (phase === "stageStrategy") {
    return "発展段階の戦略課題";
  }

  if (phase === "strategyReview") {
    return "戦略見直し";
  }

  if (policyType === "numeric") {
    return "政策課題・数値設定";
  }

  return "政策課題・戦略選択";
}

type AdjustmentButtonProps = {
  label: string;
  disabled: boolean;
  onPress: () => void;
};

function AdjustmentButton({ label, disabled, onPress }: AdjustmentButtonProps) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.adjustmentButton,
        disabled && styles.adjustmentDisabled,
        pressed && !disabled && styles.adjustmentPressed,
      ]}
    >
      <Text
        style={[
          styles.adjustmentButtonText,
          disabled && styles.adjustmentDisabledText,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 17,
    backgroundColor: "#FFFDF7",
    borderTopWidth: 5,
    borderTopColor: "#C95D36",
  },

  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },

  categoryBadge: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    backgroundColor: "#C95D36",
  },

  stageBadge: {
    backgroundColor: "#D99A37",
  },

  reviewBadge: {
    backgroundColor: "#76588E",
  },

  categoryText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
  },

  yearRule: {
    flex: 1,
    color: "#777E84",
    fontSize: 9,
    textAlign: "right",
  },

  title: {
    marginTop: 14,
    color: "#142436",
    fontSize: 23,
    fontWeight: "800",
    lineHeight: 30,
  },

  description: {
    marginTop: 8,
    color: "#4D5A65",
    fontSize: 14,
    lineHeight: 22,
  },

  contextBox: {
    marginTop: 13,
    padding: 12,
    backgroundColor: "#F1EEE5",
    borderLeftWidth: 3,
    borderLeftColor: "#8E969D",
  },

  contextLabel: {
    color: "#68737C",
    fontSize: 9,
    fontWeight: "800",
  },

  contextText: {
    marginTop: 4,
    color: "#4D5963",
    fontSize: 12,
    lineHeight: 18,
  },

  decisionArea: {
    marginTop: 19,
  },

  decisionLabel: {
    marginBottom: 9,
    color: "#142436",
    fontSize: 14,
    fontWeight: "800",
  },

  optionList: {
    gap: 8,
  },

  optionCard: {
    padding: 13,
    backgroundColor: "#F5F2EA",
    borderWidth: 1,
    borderColor: "#DDD8CD",
  },

  selectedOption: {
    backgroundColor: "#FFF4E8",
    borderColor: "#C95D36",
    borderWidth: 2,
  },

  pressedOption: {
    opacity: 0.75,
  },

  optionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },

  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: "#9AA0A5",
    alignItems: "center",
    justifyContent: "center",
  },

  selectedRadioOuter: {
    borderColor: "#C95D36",
  },

  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#C95D36",
  },

  optionLabel: {
    flex: 1,
    color: "#263746",
    fontSize: 14,
    fontWeight: "700",
  },

  selectedOptionLabel: {
    color: "#A84628",
  },

  optionDescription: {
    marginTop: 7,
    marginLeft: 27,
    color: "#68737C",
    fontSize: 11,
    lineHeight: 17,
  },

  numericPanel: {
    padding: 15,
    backgroundColor: "#F5F2EA",
    borderWidth: 1,
    borderColor: "#DDD8CD",
  },

  valueLabel: {
    color: "#65717D",
    fontSize: 11,
    fontWeight: "700",
    textAlign: "center",
  },

  valueRow: {
    marginTop: 3,
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "center",
  },

  value: {
    color: "#142436",
    fontSize: 34,
    fontWeight: "800",
  },

  unit: {
    marginLeft: 5,
    color: "#65717D",
    fontSize: 13,
  },

  slider: {
    width: "100%",
    height: 42,
    marginTop: 5,
  },

  rangeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  rangeText: {
    color: "#7B838A",
    fontSize: 9,
  },

  adjustmentRow: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },

  adjustmentButton: {
    minWidth: 68,
    paddingHorizontal: 11,
    paddingVertical: 9,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#C9C5BB",
    alignItems: "center",
  },

  adjustmentButtonText: {
    color: "#263746",
    fontSize: 12,
    fontWeight: "800",
  },

  adjustmentDisabled: {
    opacity: 0.35,
  },

  adjustmentDisabledText: {
    color: "#888888",
  },

  adjustmentPressed: {
    opacity: 0.6,
  },

  defaultButton: {
    minWidth: 68,
    paddingHorizontal: 11,
    paddingVertical: 9,
    backgroundColor: "#E3DDD0",
    alignItems: "center",
  },

  defaultButtonText: {
    color: "#52606A",
    fontSize: 11,
    fontWeight: "700",
  },

  forecastBox: {
    marginTop: 10,
    padding: 12,
    backgroundColor: "#E8F0F2",
    borderLeftWidth: 3,
    borderLeftColor: "#347F9E",
  },

  forecastLabel: {
    color: "#347F9E",
    fontSize: 9,
    fontWeight: "800",
  },

  forecastText: {
    marginTop: 4,
    color: "#41525E",
    fontSize: 12,
    lineHeight: 18,
  },

  executeButton: {
    marginTop: 14,
    minHeight: 50,
    paddingHorizontal: 15,
    paddingVertical: 14,
    backgroundColor: "#C95D36",
    alignItems: "center",
    justifyContent: "center",
  },

  disabledButton: {
    backgroundColor: "#CAC6BC",
  },

  pressedButton: {
    opacity: 0.75,
  },

  executeButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },

  disabledButtonText: {
    color: "#7D7D78",
  },

  theoryRow: {
    marginTop: 18,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#DDD8CD",
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },

  theoryLabel: {
    paddingHorizontal: 7,
    paddingVertical: 4,
    color: "#FFFFFF",
    backgroundColor: "#142436",
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 0.8,
  },

  theoryText: {
    flex: 1,
    color: "#59656E",
    fontSize: 11,
    fontWeight: "600",
  },
});
