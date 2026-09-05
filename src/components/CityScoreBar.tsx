import { ScrollView, StyleSheet, Text, View } from "react-native";

import { cityScoreDefinitions } from "../engine/scoreEngine";

import type { CityScoreKey, CityScores } from "../types/game";

type CityScoreBarProps = {
  scores: CityScores;
  previousScores?: CityScores | null;
};

// 表示する評価項目の順番
const scoreKeys: CityScoreKey[] = [
  "overall",
  "transport",
  "industry",
  "living",
  "environment",
  "finance",
  "trust",
];

export function CityScoreBar({
  scores,
  previousScores = null,
}: CityScoreBarProps) {
  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>街の評価</Text>

        <Text style={styles.scrollHint}>左右にスクロール</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {scoreKeys.map((scoreKey) => {
          const definition = cityScoreDefinitions[scoreKey];

          const score = scores[scoreKey];

          const previousScore = previousScores?.[scoreKey];

          const change =
            previousScore === undefined ? null : score - previousScore;

          return (
            <ScoreCard
              key={scoreKey}
              scoreKey={scoreKey}
              label={definition.shortLabel}
              score={score}
              change={change}
              color={definition.color}
            />
          );
        })}
      </ScrollView>
    </View>
  );
}

type ScoreCardProps = {
  scoreKey: CityScoreKey;
  label: string;
  score: number;
  change: number | null;
  color: string;
};

function ScoreCard({ scoreKey, label, score, change, color }: ScoreCardProps) {
  const safeScore = Math.max(0, Math.min(100, score));

  const isOverall = scoreKey === "overall";

  const changeText =
    change === null
      ? null
      : change > 0
        ? `+${change}`
        : change === 0
          ? "—"
          : `${change}`;

  const changeStyle =
    change !== null && change > 0
      ? styles.changePositive
      : change !== null && change < 0
        ? styles.changeNegative
        : styles.changeNeutral;

  return (
    <View
      style={[styles.scoreCard, isOverall && styles.overallCard]}
      accessibilityLabel={`${label}評価${score}ポイント`}
    >
      <View style={styles.scoreHeader}>
        <Text style={[styles.scoreLabel, isOverall && styles.overallLabel]}>
          {label}
        </Text>

        {changeText && (
          <Text style={[styles.change, changeStyle]}>{changeText}</Text>
        )}
      </View>

      <View style={styles.valueRow}>
        <Text style={[styles.scoreValue, isOverall && styles.overallValue]}>
          {score}
        </Text>

        <Text style={[styles.unit, isOverall && styles.overallUnit]}>pt</Text>
      </View>

      <View style={[styles.track, isOverall && styles.overallTrack]}>
        <View
          style={[
            styles.fill,
            {
              width: `${safeScore}%` as `${number}%`,
              backgroundColor: isOverall ? "#D99A37" : color,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 11,
    paddingBottom: 12,
    backgroundColor: "#0D2538",
    borderTopWidth: 1,
    borderTopColor: "#294256",
  },

  titleRow: {
    paddingHorizontal: 16,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  title: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },

  scrollHint: {
    color: "#8FA9B9",
    fontSize: 10,
  },

  scrollContent: {
    paddingHorizontal: 12,
    gap: 8,
  },

  scoreCard: {
    width: 104,
    minHeight: 84,
    paddingHorizontal: 11,
    paddingVertical: 10,
    backgroundColor: "#193247",
    borderWidth: 1,
    borderColor: "#29465B",
  },

  overallCard: {
    width: 112,
    backgroundColor: "#FFF9EC",
    borderColor: "#D99A37",
  },

  scoreHeader: {
    minHeight: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  scoreLabel: {
    color: "#A9C1CF",
    fontSize: 12,
    fontWeight: "600",
  },

  overallLabel: {
    color: "#76511E",
  },

  change: {
    fontSize: 11,
    fontWeight: "700",
  },

  changePositive: {
    color: "#5DB88C",
  },

  changeNegative: {
    color: "#E27A62",
  },

  changeNeutral: {
    color: "#8FA9B9",
  },

  valueRow: {
    marginTop: 2,
    flexDirection: "row",
    alignItems: "baseline",
  },

  scoreValue: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "800",
  },

  overallValue: {
    color: "#142436",
  },

  unit: {
    marginLeft: 3,
    color: "#8FA9B9",
    fontSize: 10,
  },

  overallUnit: {
    color: "#756B5B",
  },

  track: {
    height: 5,
    marginTop: 7,
    overflow: "hidden",
    backgroundColor: "#40576A",
  },

  overallTrack: {
    backgroundColor: "#DED5C2",
  },

  fill: {
    height: "100%",
  },
});
