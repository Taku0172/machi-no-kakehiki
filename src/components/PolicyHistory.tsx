import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { HistoryEntry } from "../types/game";

type PolicyHistoryProps = {
  history: HistoryEntry[];
};

const INITIAL_DISPLAY_COUNT = 5;

export function PolicyHistory({ history }: PolicyHistoryProps) {
  const [showAll, setShowAll] = useState(false);

  if (history.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.headingRow}>
          <View>
            <Text style={styles.sectionLabel}>POLICY HISTORY</Text>

            <Text style={styles.heading}>市政の記録</Text>
          </View>
        </View>

        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>
            政策を実行すると、ここに記録されます。
          </Text>
        </View>
      </View>
    );
  }

  // 新しい政策を上に表示する
  const reversedHistory = [...history].reverse();

  const displayedHistory = showAll
    ? reversedHistory
    : reversedHistory.slice(0, INITIAL_DISPLAY_COUNT);

  const hiddenCount = Math.max(0, history.length - INITIAL_DISPLAY_COUNT);

  return (
    <View style={styles.container}>
      <View style={styles.headingRow}>
        <View>
          <Text style={styles.sectionLabel}>POLICY HISTORY</Text>

          <Text style={styles.heading}>市政の記録</Text>
        </View>

        <View style={styles.countBadge}>
          <Text style={styles.countText}>{history.length}件</Text>
        </View>
      </View>

      <View style={styles.historyList}>
        {displayedHistory.map((entry, index) => (
          <HistoryCard
            key={
              `${entry.year}-` +
              `${entry.policyId}-` +
              `${history.length - index}`
            }
            entry={entry}
            isLatest={index === 0}
          />
        ))}
      </View>

      {history.length > INITIAL_DISPLAY_COUNT && (
        <Pressable
          onPress={() => setShowAll((current) => !current)}
          style={({ pressed }) => [
            styles.expandButton,
            pressed && styles.expandButtonPressed,
          ]}
        >
          <Text style={styles.expandButtonText}>
            {showAll
              ? "直近5件だけ表示"
              : `過去の記録をすべて見る（残り${hiddenCount}件）`}
          </Text>

          <Text style={styles.expandIcon}>{showAll ? "↑" : "↓"}</Text>
        </Pressable>
      )}
    </View>
  );
}

type HistoryCardProps = {
  entry: HistoryEntry;
  isLatest: boolean;
};

function HistoryCard({ entry, isLatest }: HistoryCardProps) {
  const policyTypeLabel =
    entry.policyType === "numeric" ? "数値設定" : "戦略選択";

  return (
    <View style={[styles.historyCard, isLatest && styles.latestCard]}>
      <View style={styles.cardTopRow}>
        <View style={styles.yearBadge}>
          <Text style={styles.yearText}>{entry.year}年目</Text>
        </View>

        <Text style={styles.policyType}>{policyTypeLabel}</Text>

        {isLatest && <Text style={styles.latestLabel}>最新</Text>}
      </View>

      <Text style={styles.policyTitle}>{entry.policyTitle}</Text>

      <View style={styles.decisionRow}>
        <Text style={styles.decisionLabel}>選択</Text>

        <Text style={styles.decisionText}>{entry.decision}</Text>
      </View>

      <Text style={styles.resultText}>{entry.result}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 18,
  },

  headingRow: {
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },

  sectionLabel: {
    color: "#76588E",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.3,
  },

  heading: {
    marginTop: 2,
    color: "#142436",
    fontSize: 18,
    fontWeight: "800",
  },

  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    backgroundColor: "#DDD5E5",
  },

  countText: {
    color: "#654D79",
    fontSize: 9,
    fontWeight: "800",
  },

  emptyBox: {
    padding: 15,
    backgroundColor: "#FFFDF7",
    borderLeftWidth: 4,
    borderLeftColor: "#AAA79F",
  },

  emptyText: {
    color: "#6B747B",
    fontSize: 11,
  },

  historyList: {
    gap: 8,
  },

  historyCard: {
    padding: 13,
    backgroundColor: "#FFFDF7",
    borderLeftWidth: 3,
    borderLeftColor: "#B8B4AB",
  },

  latestCard: {
    borderLeftColor: "#76588E",
    backgroundColor: "#FBF8FD",
  },

  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  yearBadge: {
    paddingHorizontal: 7,
    paddingVertical: 4,
    backgroundColor: "#142436",
  },

  yearText: {
    color: "#FFFFFF",
    fontSize: 8,
    fontWeight: "800",
  },

  policyType: {
    marginLeft: 7,
    color: "#6D767D",
    fontSize: 9,
    fontWeight: "700",
  },

  latestLabel: {
    marginLeft: "auto",
    color: "#76588E",
    fontSize: 8,
    fontWeight: "800",
  },

  policyTitle: {
    marginTop: 9,
    color: "#142436",
    fontSize: 14,
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
    backgroundColor: "#76588E",
    fontSize: 7,
    fontWeight: "800",
  },

  decisionText: {
    flex: 1,
    color: "#4F5C65",
    fontSize: 11,
    fontWeight: "700",
  },

  resultText: {
    marginTop: 7,
    color: "#6B747B",
    fontSize: 10,
    lineHeight: 16,
  },

  expandButton: {
    minHeight: 45,
    marginTop: 9,
    paddingHorizontal: 13,
    backgroundColor: "#E4DEE9",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  expandButtonPressed: {
    opacity: 0.7,
  },

  expandButtonText: {
    color: "#604A72",
    fontSize: 10,
    fontWeight: "800",
  },

  expandIcon: {
    color: "#76588E",
    fontSize: 15,
    fontWeight: "800",
  },
});
