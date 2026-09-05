import { useEffect, useRef } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { getStageDefinition, stageDefinitions } from "../data/stages";

import type { DevelopmentStage } from "../types/game";

type StageProgressProps = {
  currentStage: DevelopmentStage;
};

const CARD_WIDTH = 112;
const CARD_GAP = 8;

export function StageProgress({ currentStage }: StageProgressProps) {
  const scrollRef = useRef<ScrollView>(null);

  const currentDefinition = getStageDefinition(currentStage);

  useEffect(() => {
    const currentIndex = stageDefinitions.findIndex(
      (stage) => stage.id === currentStage,
    );

    if (currentIndex < 0) {
      return;
    }

    const scrollPosition = Math.max(
      0,
      currentIndex * (CARD_WIDTH + CARD_GAP) - 16,
    );

    const timer = setTimeout(() => {
      scrollRef.current?.scrollTo({
        x: scrollPosition,
        animated: true,
      });
    }, 150);

    return () => {
      clearTimeout(timer);
    };
  }, [currentStage]);

  return (
    <View style={styles.container}>
      <View style={styles.headingRow}>
        <View>
          <Text style={styles.sectionLabel}>CITY STAGE</Text>

          <Text style={styles.heading}>街の発展段階</Text>
        </View>

        <Text style={styles.scrollHint}>左右にスクロール</Text>
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {stageDefinitions.map((stage) => {
          const isCurrent = stage.id === currentStage;

          const isCompleted = stage.order < currentDefinition.order;

          return (
            <View
              key={stage.id}
              style={[
                styles.stageCard,
                isCompleted && styles.completedCard,
                isCurrent && {
                  backgroundColor: "#FFFDF7",
                  borderTopColor: stage.accentColor,
                },
              ]}
            >
              <View style={styles.numberRow}>
                <Text
                  style={[
                    styles.stageNumber,
                    isCurrent && {
                      color: stage.accentColor,
                    },
                  ]}
                >
                  {String(stage.order).padStart(2, "0")}
                </Text>

                {isCompleted && <Text style={styles.completedMark}>完了</Text>}

                {isCurrent && (
                  <Text
                    style={[
                      styles.currentMark,
                      {
                        color: stage.accentColor,
                      },
                    ]}
                  >
                    現在
                  </Text>
                )}
              </View>

              <Text style={[styles.stageName, isCurrent && styles.currentName]}>
                {stage.name}
              </Text>

              <Text style={styles.stageDescription} numberOfLines={2}>
                {stage.description}
              </Text>
            </View>
          );
        })}
      </ScrollView>

      <View
        style={[
          styles.challengeBox,
          {
            borderLeftColor: currentDefinition.accentColor,
          },
        ]}
      >
        <Text style={styles.challengeLabel}>現在の主要課題</Text>

        <Text style={styles.challengeText}>
          {currentDefinition.mainChallenge}
        </Text>

        {currentDefinition.advanceConditionText && (
          <Text style={styles.conditionText}>
            次段階の目安：
            {currentDefinition.advanceConditionText}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    backgroundColor: "#E8DFCC",
  },

  headingRow: {
    paddingHorizontal: 14,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },

  sectionLabel: {
    color: "#C95D36",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.6,
  },

  heading: {
    marginTop: 2,
    color: "#142436",
    fontSize: 18,
    fontWeight: "800",
  },

  scrollHint: {
    color: "#7A746A",
    fontSize: 9,
  },

  scrollContent: {
    paddingHorizontal: 14,
    gap: CARD_GAP,
  },

  stageCard: {
    width: CARD_WIDTH,
    minHeight: 115,
    padding: 11,
    backgroundColor: "#D6D1C5",
    borderTopWidth: 4,
    borderTopColor: "#AAA79F",
    opacity: 0.65,
  },

  completedCard: {
    backgroundColor: "#DDE5E0",
    borderTopColor: "#2D755E",
    opacity: 0.82,
  },

  numberRow: {
    minHeight: 17,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  stageNumber: {
    color: "#777E83",
    fontSize: 11,
    fontWeight: "800",
  },

  completedMark: {
    color: "#2D755E",
    fontSize: 8,
    fontWeight: "800",
  },

  currentMark: {
    fontSize: 8,
    fontWeight: "800",
  },

  stageName: {
    marginTop: 5,
    color: "#58626A",
    fontSize: 16,
    fontWeight: "800",
  },

  currentName: {
    color: "#142436",
  },

  stageDescription: {
    marginTop: 7,
    color: "#717A81",
    fontSize: 9,
    lineHeight: 13,
  },

  challengeBox: {
    marginHorizontal: 14,
    marginTop: 12,
    paddingHorizontal: 13,
    paddingVertical: 11,
    backgroundColor: "#FFFDF7",
    borderLeftWidth: 4,
  },

  challengeLabel: {
    color: "#757D84",
    fontSize: 9,
    fontWeight: "700",
  },

  challengeText: {
    marginTop: 3,
    color: "#142436",
    fontSize: 14,
    fontWeight: "800",
  },

  conditionText: {
    marginTop: 5,
    color: "#737B82",
    fontSize: 9,
    lineHeight: 13,
  },
});
