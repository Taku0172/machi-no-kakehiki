import Slider from "@react-native-community/slider";

import { Pressable, StyleSheet, Text, View } from "react-native";

import { CityState, NumericPolicy } from "../types/game";

type NumericPolicyCardProps = {
  policy: NumericPolicy;
  city: CityState;
  value: number;
  onChangeValue: (value: number) => void;
  onExecute: () => void;
};

export function NumericPolicyCard({
  policy,
  city,
  value,
  onChangeValue,
  onExecute,
}: NumericPolicyCardProps) {
  // マイナスボタンの処理
  function decreaseValue() {
    const nextValue = Math.max(policy.min, value - policy.step);

    onChangeValue(nextValue);
  }

  // プラスボタンの処理
  function increaseValue() {
    const nextValue = Math.min(policy.max, value + policy.step);

    onChangeValue(nextValue);
  }

  return (
    <View style={styles.card}>
      {/* 政策の種類とゲーム理論 */}
      <View style={styles.meta}>
        <Text style={styles.category}>数値政策</Text>
        <Text style={styles.theory}>{policy.theory}</Text>
      </View>

      <Text style={styles.title}>{policy.title}</Text>

      <Text style={styles.description}>{policy.description}</Text>

      <View style={styles.reasonBox}>
        <Text style={styles.reasonLabel}>発生理由</Text>
        <Text style={styles.reason}>{policy.reason}</Text>
      </View>

      {/* 選択中の数値 */}
      <Text style={styles.valueLabel}>{policy.valueLabel}</Text>

      <View style={styles.valueControl}>
        <Pressable style={styles.changeButton} onPress={decreaseValue}>
          <Text style={styles.changeButtonText}>−</Text>
        </Pressable>

        <View style={styles.currentValue}>
          <Text style={styles.value}>
            {value}
            <Text style={styles.unit}> {policy.unit}</Text>
          </Text>
        </View>

        <Pressable style={styles.changeButton} onPress={increaseValue}>
          <Text style={styles.changeButtonText}>＋</Text>
        </Pressable>
      </View>

      {/* 指で動かす整数バー */}
      <Slider
        minimumValue={policy.min}
        maximumValue={policy.max}
        step={policy.step}
        value={value}
        onValueChange={onChangeValue}
        minimumTrackTintColor="#D99A37"
        maximumTrackTintColor="#D1CEC6"
        thumbTintColor="#0D2538"
      />

      <View style={styles.limits}>
        <Text style={styles.limitText}>
          {policy.min}
          {policy.unit}
        </Text>

        <Text style={styles.limitText}>
          {policy.max}
          {policy.unit}
        </Text>
      </View>

      {/* 現在の選択に対する予測 */}
      <View style={styles.forecastBox}>
        <Text style={styles.forecastLabel}>政策室の予測</Text>

        <Text style={styles.forecast}>{policy.getForecast(value, city)}</Text>
      </View>

      <Pressable style={styles.executeButton} onPress={onExecute}>
        <Text style={styles.executeButtonText}>この政策を実行</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 18,
    padding: 18,
    backgroundColor: "#FFFDF7",
    borderTopWidth: 5,
    borderTopColor: "#C95D36",
  },

  meta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  category: {
    color: "#65717D",
    fontSize: 13,
    fontWeight: "bold",
  },

  theory: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    color: "#FFFFFF",
    backgroundColor: "#C95D36",
    fontSize: 12,
    fontWeight: "bold",
    borderRadius: 4,
  },

  title: {
    marginTop: 16,
    color: "#142436",
    fontSize: 24,
    fontWeight: "bold",
  },

  description: {
    marginTop: 8,
    color: "#425262",
    fontSize: 15,
    lineHeight: 24,
  },

  reasonBox: {
    marginTop: 14,
    padding: 12,
    backgroundColor: "#EDF1EE",
    borderLeftWidth: 4,
    borderLeftColor: "#2D755E",
  },

  reasonLabel: {
    color: "#2D755E",
    fontSize: 12,
    fontWeight: "bold",
  },

  reason: {
    marginTop: 3,
    color: "#142436",
    fontSize: 14,
    lineHeight: 22,
  },

  valueLabel: {
    marginTop: 20,
    marginBottom: 10,
    color: "#142436",
    fontSize: 15,
    fontWeight: "bold",
  },

  valueControl: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  changeButton: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0D2538",
    borderRadius: 6,
  },

  changeButtonText: {
    color: "#FFFFFF",
    fontSize: 24,
  },

  currentValue: {
    flex: 1,
    alignItems: "center",
  },

  value: {
    color: "#142436",
    fontSize: 30,
    fontWeight: "bold",
  },

  unit: {
    color: "#65717D",
    fontSize: 13,
    fontWeight: "normal",
  },

  limits: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  limitText: {
    color: "#65717D",
    fontSize: 12,
  },

  forecastBox: {
    marginTop: 14,
    padding: 12,
    backgroundColor: "#E7EEF0",
    borderLeftWidth: 4,
    borderLeftColor: "#347F9E",
  },

  forecastLabel: {
    color: "#347F9E",
    fontSize: 12,
    fontWeight: "bold",
  },

  forecast: {
    marginTop: 3,
    color: "#142436",
    fontSize: 14,
    lineHeight: 22,
  },

  executeButton: {
    marginTop: 14,
    padding: 16,
    backgroundColor: "#0D2538",
    borderRadius: 6,
  },

  executeButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "bold",
    textAlign: "center",
  },
});
