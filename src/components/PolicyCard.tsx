import { Pressable, StyleSheet, Text, View } from "react-native";

import type { StrategyPolicy } from "../types/game";

// PolicyCardが受け取るデータ
type PolicyCardProps = {
  // 「都市戦略」「政策戦略」などの表示
  category?: string;

  // 表示する政策データ
  policy: StrategyPolicy;

  // 現在選択されている選択肢
  selectedOptionId: string | null;

  // 選択肢を押したときの処理
  onSelectOption: (optionId: string) => void;

  // 政策を実行するときの処理
  onExecute: () => void;
};

export function PolicyCard({
  category = "都市戦略",
  policy,
  selectedOptionId,
  onSelectOption,
  onExecute,
}: PolicyCardProps) {
  return (
    <View style={styles.card}>
      {/* 政策の種類とゲーム理論 */}
      <View style={styles.meta}>
        <Text style={styles.category}>{category}</Text>

        <Text style={styles.theory}>{policy.theory}</Text>
      </View>

      {/* 政策課題の内容 */}
      <Text style={styles.title}>{policy.title}</Text>

      <Text style={styles.description}>{policy.description}</Text>

      {/* 政策が発生した理由 */}
      <View style={styles.reasonBox}>
        <Text style={styles.reasonLabel}>発生理由</Text>

        <Text style={styles.reason}>{policy.reason}</Text>
      </View>

      <Text style={styles.choiceLabel}>戦略を選択</Text>

      {/* 選択肢を繰り返し表示する */}
      {policy.options.map((option, index) => {
        const isSelected = selectedOptionId === option.id;

        return (
          <Pressable
            key={option.id}
            style={[styles.option, isSelected && styles.selectedOption]}
            onPress={() => onSelectOption(option.id)}
          >
            <View style={styles.optionNumber}>
              <Text
                style={[
                  styles.optionNumberText,
                  isSelected && styles.selectedNumberText,
                ]}
              >
                {String(index + 1).padStart(2, "0")}
              </Text>
            </View>

            <View style={styles.optionContent}>
              <Text
                style={[styles.optionTitle, isSelected && styles.selectedTitle]}
              >
                {option.label}
              </Text>

              <Text style={styles.optionDescription}>{option.description}</Text>
            </View>
          </Pressable>
        );
      })}

      {/* 選択肢を選ぶまでは押せない */}
      <Pressable
        disabled={selectedOptionId === null}
        style={[
          styles.executeButton,
          selectedOptionId === null && styles.disabledButton,
        ]}
        onPress={onExecute}
      >
        <Text style={styles.executeButtonText}>この戦略を実行</Text>

        <Text style={styles.executeButtonDescription}>
          選択した方針を街へ反映する
        </Text>
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
    gap: 10,
  },

  category: {
    flex: 1,
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
    lineHeight: 34,
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

  choiceLabel: {
    marginTop: 20,
    marginBottom: 8,
    color: "#142436",
    fontSize: 15,
    fontWeight: "bold",
  },

  option: {
    marginBottom: 8,
    padding: 12,
    backgroundColor: "#F5F1E7",
    borderWidth: 1,
    borderColor: "#D1CEC6",
    borderLeftWidth: 5,
    borderLeftColor: "#C8C5BC",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  selectedOption: {
    backgroundColor: "#E5EEF1",
    borderColor: "#347F9E",
    borderLeftColor: "#347F9E",
  },

  optionNumber: {
    width: 30,
    alignItems: "center",
  },

  optionNumberText: {
    color: "#C95D36",
    fontSize: 12,
    fontWeight: "bold",
  },

  selectedNumberText: {
    color: "#347F9E",
  },

  optionContent: {
    flex: 1,
  },

  optionTitle: {
    color: "#142436",
    fontSize: 15,
    fontWeight: "bold",
  },

  selectedTitle: {
    color: "#205F7A",
  },

  optionDescription: {
    marginTop: 3,
    color: "#65717D",
    fontSize: 13,
    lineHeight: 20,
  },

  executeButton: {
    marginTop: 12,
    padding: 15,
    backgroundColor: "#0D2538",
    borderRadius: 6,
  },

  disabledButton: {
    opacity: 0.4,
  },

  executeButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "bold",
    textAlign: "center",
  },

  executeButtonDescription: {
    marginTop: 2,
    color: "#B9CCD6",
    fontSize: 11,
    textAlign: "center",
  },
});
