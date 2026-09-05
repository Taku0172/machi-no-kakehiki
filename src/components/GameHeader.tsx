import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { getStageDefinition } from "../data/stages";

import type { CityState, DevelopmentModel } from "../types/game";

type GameHeaderProps = {
  city: CityState;
  developmentModel: DevelopmentModel;
  isSaving?: boolean;
};

// 成長モデルの表示名
const developmentModelNames: Record<DevelopmentModel, string> = {
  industry: "産業誘致型",
  tourism: "観光交流型",
  living: "生活都市型",
};

export function GameHeader({
  city,
  developmentModel,
  isSaving = false,
}: GameHeaderProps) {
  const stage = getStageDefinition(city.stage);

  return (
    <View style={styles.header}>
      <View style={styles.topRow}>
        <View style={styles.titleArea}>
          <Text style={styles.appName}>まちのかけひき</Text>

          <Text style={styles.subtitle}>政策選択型まちづくりゲーム</Text>
        </View>

        <View style={styles.yearArea}>
          <View style={styles.savingArea}>
            {isSaving && (
              <>
                <ActivityIndicator size="small" color="#A9C1CF" />

                <Text style={styles.savingText}>保存中</Text>
              </>
            )}
          </View>

          <Text style={styles.yearLabel}>市政</Text>

          <Text style={styles.year}>{city.year}年目</Text>
        </View>
      </View>

      <View style={styles.statusRow}>
        <View
          style={[
            styles.stageBadge,
            {
              borderColor: stage.accentColor,
            },
          ]}
        >
          <View
            style={[
              styles.stageDot,
              {
                backgroundColor: stage.accentColor,
              },
            ]}
          />

          <View>
            <Text style={styles.badgeLabel}>発展段階</Text>

            <Text style={styles.badgeValue}>{stage.name}</Text>
          </View>
        </View>

        <View style={styles.modelBadge}>
          <View>
            <Text style={styles.badgeLabel}>現在の戦略</Text>

            <Text style={styles.modelValue}>
              {developmentModelNames[developmentModel]}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 13,
    backgroundColor: "#0D2538",
  },

  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },

  titleArea: {
    flex: 1,
    paddingRight: 14,
  },

  appName: {
    color: "#FFFFFF",
    fontSize: 21,
    fontWeight: "800",
    letterSpacing: 0.4,
  },

  subtitle: {
    marginTop: 3,
    color: "#A9C1CF",
    fontSize: 11,
  },

  yearArea: {
    minWidth: 76,
    alignItems: "flex-end",
  },

  savingArea: {
    minHeight: 17,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  savingText: {
    color: "#A9C1CF",
    fontSize: 9,
  },

  yearLabel: {
    marginTop: 2,
    color: "#8FA9B9",
    fontSize: 10,
  },

  year: {
    marginTop: 1,
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "800",
  },

  statusRow: {
    marginTop: 13,
    flexDirection: "row",
    gap: 8,
  },

  stageBadge: {
    flex: 1,
    minHeight: 55,
    paddingHorizontal: 11,
    paddingVertical: 9,
    backgroundColor: "#193247",
    borderLeftWidth: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },

  stageDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  modelBadge: {
    flex: 1,
    minHeight: 55,
    paddingHorizontal: 12,
    paddingVertical: 9,
    backgroundColor: "#193247",
    borderLeftWidth: 4,
    borderLeftColor: "#C95D36",
    justifyContent: "center",
  },

  badgeLabel: {
    color: "#8FA9B9",
    fontSize: 9,
    fontWeight: "600",
  },

  badgeValue: {
    marginTop: 2,
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },

  modelValue: {
    marginTop: 2,
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
});
