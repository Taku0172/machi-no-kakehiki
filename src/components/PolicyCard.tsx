import { Pressable, StyleSheet, Text, View } from "react-native";

import { StrategyPolicy } from "../types/game";

// PolicyCardが受け取るデータ
type PolicyCardProps = {
  policy: StrategyPolicy;
  selectedOptionId: string | null;
  onSelectOption: (optionId: string) => void;
  onExecute: () => void;
};

export function PolicyCard({
  policy,
  selectedOptionId,
  onSelectOption,
  onExecute,
}: PolicyCardProps) {
  return (
    <View style={styles.card}>
      {/* 政策課題の種類 */}
      <View style={styles.meta}>
        <Text style={styles.category}>都市戦略</Text>
        <Text style={styles.theory}>{policy.theory}</Text>
      </View>

      {/* 政策課題の内容 */}
      <Text style={styles.title}>{policy.title}</Text>
      <Text style={styles.description}>{policy.description}</Text>

      <View style={styles.reasonBox}>
        <Text style={styles.reasonLabel}>発生理由</Text>
        <Text style={styles.reason}>{policy.reason}</Text>
      </View>

      <Text style={styles.choiceLabel}>戦略を選択</Text>

      {/* policy.optionsの数だけ選択肢を表示 */}
      {policy.options.map((option) => {
        const isSelected = selectedOptionId === option.id;

        return (
          <Pressable
            key={option.id}
            style={[styles.option, isSelected && styles.selectedOption]}
            onPress={() => onSelectOption(option.id)}
          >
            <Text
              style={[styles.optionTitle, isSelected && styles.selectedText]}
            >
              {option.label}
            </Text>

            <Text style={styles.optionDescription}>{option.description}</Text>
          </Pressable>
        );
      })}

      {/* 戦略未選択の場合は押せない */}
      <Pressable
        disabled={selectedOptionId === null}
        style={[
          styles.executeButton,
          selectedOptionId === null && styles.disabledButton,
        ]}
        onPress={onExecute}
      >
        <Text style={styles.executeButtonText}>この戦略を実行</Text>
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

  choiceLabel: {
    marginTop: 20,
    marginBottom: 8,
    color: "#142436",
    fontSize: 15,
    fontWeight: "bold",
  },

  option: {
    marginBottom: 8,
    padding: 14,
    backgroundColor: "#F5F1E7",
    borderWidth: 1,
    borderColor: "#D1CEC6",
    borderLeftWidth: 5,
    borderLeftColor: "#C8C5BC",
  },

  selectedOption: {
    backgroundColor: "#E5EEF1",
    borderColor: "#347F9E",
    borderLeftColor: "#347F9E",
  },

  optionTitle: {
    color: "#142436",
    fontSize: 15,
    fontWeight: "bold",
  },

  selectedText: {
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
    padding: 16,
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
});
