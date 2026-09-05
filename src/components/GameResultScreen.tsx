import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    useWindowDimensions,
    View,
} from "react-native";
import Svg, { Line, Polyline, Text as SvgText } from "react-native-svg";

import { getStageDefinition } from "../data/stages";
import {
    calculateCityScores,
    cityScoreDefinitions,
    getCityRank,
} from "../engine/scoreEngine";

import type { CityScoreKey, GameState, TimelinePoint } from "../types/game";

type GameResultScreenProps = {
  gameState: GameState;
  onRestart: () => void | Promise<void>;
};

type ChartSeries = {
  id: string;
  label: string;
  color: string;
  getValue: (point: TimelinePoint) => number;
};

const scoreSeries: ChartSeries[] = [
  {
    id: "overall",
    label: "総合",
    color: "#142436",
    getValue: (point) => point.scores.overall,
  },
  {
    id: "transport",
    label: "交通",
    color: "#347F9E",
    getValue: (point) => point.scores.transport,
  },
  {
    id: "industry",
    label: "産業",
    color: "#C95D36",
    getValue: (point) => point.scores.industry,
  },
  {
    id: "living",
    label: "生活",
    color: "#D99A37",
    getValue: (point) => point.scores.living,
  },
  {
    id: "environment",
    label: "環境",
    color: "#4C8C68",
    getValue: (point) => point.scores.environment,
  },
  {
    id: "finance",
    label: "財政",
    color: "#76588E",
    getValue: (point) => point.scores.finance,
  },
  {
    id: "trust",
    label: "信頼",
    color: "#2D755E",
    getValue: (point) => point.scores.trust,
  },
];

export function GameResultScreen({
  gameState,
  onRestart,
}: GameResultScreenProps) {
  const finalScores = calculateCityScores(gameState.city);

  const rank = getCityRank(finalScores.overall);

  const stage = getStageDefinition(gameState.city.stage);

  const scoreEntries = (
    [
      "transport",
      "industry",
      "living",
      "environment",
      "finance",
      "trust",
    ] as CityScoreKey[]
  ).map((key) => ({
    key,
    value: finalScores[key],
  }));

  const strongest = [...scoreEntries].sort((a, b) => b.value - a.value)[0];

  const weakest = [...scoreEntries].sort((a, b) => a.value - b.value)[0];

  const populationValues = gameState.timeline.map((point) => point.population);

  const minimumPopulation = Math.min(...populationValues);

  const maximumPopulation = Math.max(...populationValues);

  const budgetValues = gameState.timeline.map((point) => point.budget);

  const minimumBudget = Math.min(0, ...budgetValues);

  const maximumBudget = Math.max(10, ...budgetValues);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.heroLabel}>50 YEARS COMPLETED</Text>

        <Text style={styles.heroTitle}>あなたの市政が終了しました</Text>

        <Text style={styles.heroDescription}>
          50年間の政策選択から、 街がどのように変化したかを振り返ります。
        </Text>

        <View style={styles.rankArea}>
          <View style={styles.rankCircle}>
            <Text style={styles.rank}>{rank}</Text>
          </View>

          <View>
            <Text style={styles.rankLabel}>最終総合評価</Text>

            <Text style={styles.overallScore}>
              {finalScores.overall}
              <Text style={styles.overallUnit}> pt</Text>
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.summaryGrid}>
        <SummaryCard
          label="最終人口"
          value={gameState.city.population.toLocaleString()}
          unit="人"
        />

        <SummaryCard
          label="最終財政"
          value={gameState.city.budget.toLocaleString()}
          unit="億円"
          danger={gameState.city.budget < 0}
        />

        <SummaryCard label="到達段階" value={stage.name} unit="" />

        <SummaryCard
          label="戦略変更"
          value={gameState.strategySwitchCount}
          unit="回"
        />
      </View>

      <View style={styles.feedbackBox}>
        <Text style={styles.feedbackLabel}>市政フィードバック</Text>

        <Text style={styles.feedbackTitle}>
          強みは
          {cityScoreDefinitions[strongest.key].shortLabel}
          、課題は
          {cityScoreDefinitions[weakest.key].shortLabel}
          です
        </Text>

        <Text style={styles.feedbackText}>
          {cityScoreDefinitions[strongest.key].description}
          {"\n"}
          一方、
          {cityScoreDefinitions[weakest.key].description}
          今後は強みを維持しながら、 最も低い評価を補う政策が必要です。
        </Text>
      </View>

      <ResultSection
        title="街評価の推移"
        description="交通・産業・生活などの評価が、政策選択によってどう変化したかを示します。"
      >
        <TimelineChart
          timeline={gameState.timeline}
          series={scoreSeries}
          minimumValue={0}
          maximumValue={100}
          valueSuffix="pt"
        />
      </ResultSection>

      <ResultSection
        title="人口の推移"
        description="人口増加だけでなく、発展後の流出や再編も確認できます。"
      >
        <TimelineChart
          timeline={gameState.timeline}
          series={[
            {
              id: "population",
              label: "人口",
              color: "#347F9E",
              getValue: (point) => point.population,
            },
          ]}
          minimumValue={Math.max(0, minimumPopulation - 1000)}
          maximumValue={maximumPopulation + 1000}
          valueSuffix="人"
        />
      </ResultSection>

      <ResultSection
        title="財政の推移"
        description="積極投資、税収、借入、維持費による財政変化を振り返ります。"
      >
        <TimelineChart
          timeline={gameState.timeline}
          series={[
            {
              id: "budget",
              label: "財政",
              color: "#76588E",
              getValue: (point) => point.budget,
            },
          ]}
          minimumValue={minimumBudget - 10}
          maximumValue={maximumBudget + 10}
          valueSuffix="億円"
          showZeroLine
        />
      </ResultSection>

      <View style={styles.historySummary}>
        <Text style={styles.historyLabel}>POLICY RECORD</Text>

        <Text style={styles.historyTitle}>実行した判断</Text>

        <Text style={styles.historyCount}>
          {gameState.history.length}
          <Text style={styles.historyUnit}> 件</Text>
        </Text>

        <Text style={styles.historyNote}>
          通常政策に加えて、 発展段階の戦略課題と戦略見直しも含みます。
        </Text>
      </View>

      <Pressable
        onPress={() => {
          void onRestart();
        }}
        style={({ pressed }) => [
          styles.restartButton,
          pressed && styles.restartPressed,
        ]}
      >
        <Text style={styles.restartText}>新しい街で最初から遊ぶ</Text>
      </Pressable>
    </ScrollView>
  );
}

// ==================================================
// サマリーカード
// ==================================================

type SummaryCardProps = {
  label: string;
  value: number | string;
  unit: string;
  danger?: boolean;
};

function SummaryCard({ label, value, unit, danger = false }: SummaryCardProps) {
  return (
    <View style={styles.summaryCard}>
      <Text style={styles.summaryLabel}>{label}</Text>

      <Text
        style={[styles.summaryValue, danger && styles.dangerValue]}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {value}

        {unit.length > 0 && <Text style={styles.summaryUnit}> {unit}</Text>}
      </Text>
    </View>
  );
}

// ==================================================
// 結果セクション
// ==================================================

type ResultSectionProps = {
  title: string;
  description: string;
  children: React.ReactNode;
};

function ResultSection({ title, description, children }: ResultSectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>

      <Text style={styles.sectionDescription}>{description}</Text>

      {children}
    </View>
  );
}

// ==================================================
// 折れ線グラフ
// ==================================================

type TimelineChartProps = {
  timeline: TimelinePoint[];
  series: ChartSeries[];
  minimumValue: number;
  maximumValue: number;
  valueSuffix: string;
  showZeroLine?: boolean;
};

function TimelineChart({
  timeline,
  series,
  minimumValue,
  maximumValue,
  valueSuffix,
  showZeroLine = false,
}: TimelineChartProps) {
  const { width: screenWidth } = useWindowDimensions();

  const chartWidth = Math.max(screenWidth - 64, 620);

  const chartHeight = 240;
  const leftPadding = 48;
  const rightPadding = 20;
  const topPadding = 20;
  const bottomPadding = 35;

  const plotWidth = chartWidth - leftPadding - rightPadding;

  const plotHeight = chartHeight - topPadding - bottomPadding;

  const safeMaximum =
    maximumValue === minimumValue ? maximumValue + 1 : maximumValue;

  const maximumYear = Math.max(1, ...timeline.map((point) => point.year));

  function getX(year: number): number {
    return leftPadding + (year / maximumYear) * plotWidth;
  }

  function getY(value: number): number {
    const ratio = (value - minimumValue) / (safeMaximum - minimumValue);

    return topPadding + plotHeight - ratio * plotHeight;
  }

  const horizontalGuides = [0, 0.25, 0.5, 0.75, 1];

  const yearGuides = [0, 10, 20, 30, 40, 50].filter(
    (year) => year <= maximumYear,
  );

  const zeroY = getY(0);

  return (
    <View style={styles.chartContainer}>
      <View style={styles.legend}>
        {series.map((item) => (
          <View key={item.id} style={styles.legendItem}>
            <View
              style={[
                styles.legendColor,
                {
                  backgroundColor: item.color,
                },
              ]}
            />

            <Text style={styles.legendText}>{item.label}</Text>
          </View>
        ))}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator>
        <Svg width={chartWidth} height={chartHeight}>
          {horizontalGuides.map((guide) => {
            const value = minimumValue + (safeMaximum - minimumValue) * guide;

            const y = getY(value);

            return (
              <Line
                key={guide}
                x1={leftPadding}
                y1={y}
                x2={chartWidth - rightPadding}
                y2={y}
                stroke="#D8D4CA"
                strokeWidth={1}
              />
            );
          })}

          {showZeroLine &&
            zeroY >= topPadding &&
            zeroY <= topPadding + plotHeight && (
              <Line
                x1={leftPadding}
                y1={zeroY}
                x2={chartWidth - rightPadding}
                y2={zeroY}
                stroke="#C95D36"
                strokeWidth={1.5}
                strokeDasharray="5 4"
              />
            )}

          {horizontalGuides.map((guide) => {
            const value = minimumValue + (safeMaximum - minimumValue) * guide;

            const y = getY(value);

            return (
              <SvgText
                key={`label-${guide}`}
                x={leftPadding - 7}
                y={y + 4}
                fill="#727A80"
                fontSize={9}
                textAnchor="end"
              >
                {Math.round(value)}
              </SvgText>
            );
          })}

          {yearGuides.map((year) => (
            <SvgText
              key={year}
              x={getX(year)}
              y={chartHeight - 10}
              fill="#727A80"
              fontSize={9}
              textAnchor="middle"
            >
              {year}年
            </SvgText>
          ))}

          {series.map((item) => {
            const points = timeline
              .map((point) => {
                const x = getX(point.year);

                const y = getY(item.getValue(point));

                return `${x},${y}`;
              })
              .join(" ");

            return (
              <Polyline
                key={item.id}
                points={points}
                fill="none"
                stroke={item.color}
                strokeWidth={item.id === "overall" ? 3 : 2}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            );
          })}

          <SvgText x={8} y={13} fill="#727A80" fontSize={8}>
            {valueSuffix}
          </SvgText>
        </Svg>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#E8DFCC",
  },

  content: {
    padding: 16,
    paddingBottom: 50,
  },

  hero: {
    padding: 20,
    backgroundColor: "#0D2538",
    borderTopWidth: 5,
    borderTopColor: "#D99A37",
  },

  heroLabel: {
    color: "#D99A37",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.5,
  },

  heroTitle: {
    marginTop: 8,
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "800",
    lineHeight: 32,
  },

  heroDescription: {
    marginTop: 7,
    color: "#A9C1CF",
    fontSize: 12,
    lineHeight: 19,
  },

  rankArea: {
    marginTop: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
  },

  rankCircle: {
    width: 67,
    height: 67,
    borderRadius: 34,
    backgroundColor: "#FFF8E8",
    borderWidth: 3,
    borderColor: "#D99A37",
    alignItems: "center",
    justifyContent: "center",
  },

  rank: {
    color: "#142436",
    fontSize: 32,
    fontWeight: "900",
  },

  rankLabel: {
    color: "#A9C1CF",
    fontSize: 10,
  },

  overallScore: {
    marginTop: 1,
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "800",
  },

  overallUnit: {
    color: "#A9C1CF",
    fontSize: 11,
    fontWeight: "500",
  },

  summaryGrid: {
    marginTop: 10,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  summaryCard: {
    width: "48.7%",
    padding: 13,
    backgroundColor: "#FFFDF7",
    borderBottomWidth: 3,
    borderBottomColor: "#347F9E",
  },

  summaryLabel: {
    color: "#6A747C",
    fontSize: 10,
  },

  summaryValue: {
    marginTop: 4,
    color: "#142436",
    fontSize: 20,
    fontWeight: "800",
  },

  summaryUnit: {
    color: "#707A81",
    fontSize: 9,
    fontWeight: "500",
  },

  dangerValue: {
    color: "#C95D36",
  },

  feedbackBox: {
    marginTop: 10,
    padding: 16,
    backgroundColor: "#E6EFEA",
    borderLeftWidth: 4,
    borderLeftColor: "#2D755E",
  },

  feedbackLabel: {
    color: "#2D755E",
    fontSize: 9,
    fontWeight: "800",
  },

  feedbackTitle: {
    marginTop: 5,
    color: "#17372D",
    fontSize: 17,
    fontWeight: "800",
  },

  feedbackText: {
    marginTop: 7,
    color: "#4B5D54",
    fontSize: 12,
    lineHeight: 19,
  },

  section: {
    marginTop: 12,
    padding: 15,
    backgroundColor: "#FFFDF7",
  },

  sectionTitle: {
    color: "#142436",
    fontSize: 17,
    fontWeight: "800",
  },

  sectionDescription: {
    marginTop: 5,
    color: "#69747C",
    fontSize: 11,
    lineHeight: 17,
  },

  chartContainer: {
    marginTop: 13,
    paddingTop: 10,
    backgroundColor: "#F5F2EA",
    borderWidth: 1,
    borderColor: "#DDD8CD",
  },

  legend: {
    paddingHorizontal: 12,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9,
  },

  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  legendColor: {
    width: 11,
    height: 3,
  },

  legendText: {
    color: "#5F6971",
    fontSize: 9,
  },

  historySummary: {
    marginTop: 12,
    padding: 17,
    backgroundColor: "#FFFDF7",
    borderTopWidth: 4,
    borderTopColor: "#76588E",
  },

  historyLabel: {
    color: "#76588E",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.2,
  },

  historyTitle: {
    marginTop: 4,
    color: "#142436",
    fontSize: 16,
    fontWeight: "800",
  },

  historyCount: {
    marginTop: 6,
    color: "#142436",
    fontSize: 28,
    fontWeight: "800",
  },

  historyUnit: {
    color: "#6C757C",
    fontSize: 10,
    fontWeight: "500",
  },

  historyNote: {
    marginTop: 5,
    color: "#6C757C",
    fontSize: 10,
    lineHeight: 15,
  },

  restartButton: {
    minHeight: 54,
    marginTop: 16,
    backgroundColor: "#C95D36",
    alignItems: "center",
    justifyContent: "center",
  },

  restartPressed: {
    opacity: 0.75,
  },

  restartText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
});
