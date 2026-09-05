import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

type GameIntroScreenProps = {
  hasExistingProgress: boolean;
  currentYear: number;
  onStart: () => void;
};

const ruleCards = [
  {
    number: "01",
    title: "50年間の市政",
    description:
      "あなたは市長として、毎年一つの通常政策を実行します。50年目の政策を終えると市政結果が発表されます。",
    color: "#D99A37",
  },
  {
    number: "02",
    title: "数字と戦略を使い分ける",
    description:
      "予算や税率を数値で決める政策と、複数の方針から戦略を選ぶ政策が登場します。",
    color: "#347F9E",
  },
  {
    number: "03",
    title: "街の成長で課題が変わる",
    description:
      "創生期から再編期まで、発展段階に応じて住宅、産業、混雑、老朽化などの課題が変化します。",
    color: "#4C8C68",
  },
  {
    number: "04",
    title: "戦略を見直す誘惑",
    description:
      "他都市の成功を見て、現在の成長戦略から乗り換える機会も訪れます。流行に乗るか、今の道を貫くかは自由です。",
    color: "#76588E",
  },
];

export function GameIntroScreen({
  hasExistingProgress,
  currentYear,
  onStart,
}: GameIntroScreenProps) {
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>CITY POLICY × GAME THEORY</Text>

        <Text style={styles.appName}>まちのかけひき</Text>

        <Text style={styles.catchCopy}>
          正解のない政策を選び、
          {"\n"}
          あなただけの街をつくる。
        </Text>

        <Text style={styles.introduction}>
          企業、住民、地主、近隣都市。 それぞれの利益と行動を予測しながら、
          50年間の市政を運営する政策選択型ゲームです。
        </Text>
      </View>

      {hasExistingProgress && (
        <View style={styles.continueBox}>
          <View>
            <Text style={styles.continueLabel}>保存された市政</Text>

            <Text style={styles.continueValue}>
              {currentYear}年目から再開できます
            </Text>
          </View>

          <View style={styles.savedBadge}>
            <Text style={styles.savedBadgeText}>AUTO SAVE</Text>
          </View>
        </View>
      )}

      <View style={styles.ruleSection}>
        <Text style={styles.sectionLabel}>HOW TO PLAY</Text>

        <Text style={styles.sectionTitle}>このゲームで行うこと</Text>

        <View style={styles.ruleList}>
          {ruleCards.map((rule) => (
            <View
              key={rule.number}
              style={[
                styles.ruleCard,
                {
                  borderLeftColor: rule.color,
                },
              ]}
            >
              <View style={styles.ruleHeader}>
                <Text
                  style={[
                    styles.ruleNumber,
                    {
                      color: rule.color,
                    },
                  ]}
                >
                  {rule.number}
                </Text>

                <Text style={styles.ruleTitle}>{rule.title}</Text>
              </View>

              <Text style={styles.ruleDescription}>{rule.description}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.yearRuleBox}>
        <Text style={styles.yearRuleLabel}>年度進行のルール</Text>

        <View style={styles.yearRuleRow}>
          <View style={styles.yearAdvanceBadge}>
            <Text style={styles.yearAdvanceBadgeText}>翌年度へ進む</Text>
          </View>

          <Text style={styles.yearRuleText}>通常の政策課題</Text>
        </View>

        <View style={styles.yearRuleRow}>
          <View style={styles.sameYearBadge}>
            <Text style={styles.sameYearBadgeText}>同じ年度</Text>
          </View>

          <Text style={styles.yearRuleText}>
            発展段階の戦略課題・戦略見直し
          </Text>
        </View>

        <Text style={styles.yearRuleNote}>
          戦略課題や戦略見直しを選んだ後は、 同じ年度の通常政策も実行します。
        </Text>
      </View>

      <View style={styles.scoreGuide}>
        <Text style={styles.scoreGuideLabel}>街の評価</Text>

        <Text style={styles.scoreGuideText}>
          交通・産業・生活・環境・財政・信頼の 6項目を確認しながら進めます。
          混雑だけは数値が低いほど良好です。
        </Text>
      </View>

      <View style={styles.messageBox}>
        <Text style={styles.messageTitle}>一つの正解はありません</Text>

        <Text style={styles.messageText}>
          経済を伸ばせば混雑や環境負荷が増え、
          生活を守れば財政が苦しくなるかもしれません。
          誰が利益を得て、誰が費用を負担するのかを考えて選んでください。
        </Text>
      </View>

      <Pressable
        onPress={onStart}
        style={({ pressed }) => [
          styles.startButton,
          pressed && styles.startButtonPressed,
        ]}
      >
        <Text style={styles.startButtonText}>
          {hasExistingProgress ? "市政を再開する" : "市政を始める"}
        </Text>

        <Text style={styles.startButtonArrow}>→</Text>
      </Pressable>

      <Text style={styles.autoSaveNote}>
        ゲームの進行は端末に自動保存されます
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#E8DFCC",
  },

  content: {
    padding: 16,
    paddingBottom: 42,
  },

  hero: {
    paddingHorizontal: 20,
    paddingVertical: 25,
    backgroundColor: "#0D2538",
    borderTopWidth: 5,
    borderTopColor: "#D99A37",
  },

  eyebrow: {
    color: "#D99A37",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.5,
  },

  appName: {
    marginTop: 11,
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "900",
    letterSpacing: 0.5,
  },

  catchCopy: {
    marginTop: 13,
    color: "#FFFFFF",
    fontSize: 21,
    fontWeight: "800",
    lineHeight: 31,
  },

  introduction: {
    marginTop: 14,
    color: "#A9C1CF",
    fontSize: 12,
    lineHeight: 20,
  },

  continueBox: {
    marginTop: 10,
    padding: 14,
    backgroundColor: "#E6EFEA",
    borderLeftWidth: 4,
    borderLeftColor: "#2D755E",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  continueLabel: {
    color: "#607168",
    fontSize: 9,
    fontWeight: "700",
  },

  continueValue: {
    marginTop: 3,
    color: "#17372D",
    fontSize: 14,
    fontWeight: "800",
  },

  savedBadge: {
    paddingHorizontal: 7,
    paddingVertical: 4,
    backgroundColor: "#2D755E",
  },

  savedBadgeText: {
    color: "#FFFFFF",
    fontSize: 7,
    fontWeight: "800",
    letterSpacing: 0.6,
  },

  ruleSection: {
    marginTop: 19,
  },

  sectionLabel: {
    color: "#C95D36",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.4,
  },

  sectionTitle: {
    marginTop: 3,
    color: "#142436",
    fontSize: 20,
    fontWeight: "800",
  },

  ruleList: {
    marginTop: 11,
    gap: 8,
  },

  ruleCard: {
    padding: 14,
    backgroundColor: "#FFFDF7",
    borderLeftWidth: 4,
  },

  ruleHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  ruleNumber: {
    fontSize: 11,
    fontWeight: "900",
  },

  ruleTitle: {
    flex: 1,
    color: "#142436",
    fontSize: 14,
    fontWeight: "800",
  },

  ruleDescription: {
    marginTop: 7,
    marginLeft: 29,
    color: "#5E6972",
    fontSize: 11,
    lineHeight: 18,
  },

  yearRuleBox: {
    marginTop: 12,
    padding: 15,
    backgroundColor: "#FFFDF7",
    borderTopWidth: 4,
    borderTopColor: "#347F9E",
  },

  yearRuleLabel: {
    marginBottom: 10,
    color: "#142436",
    fontSize: 14,
    fontWeight: "800",
  },

  yearRuleRow: {
    marginTop: 7,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  yearAdvanceBadge: {
    width: 78,
    paddingVertical: 5,
    backgroundColor: "#C95D36",
    alignItems: "center",
  },

  yearAdvanceBadgeText: {
    color: "#FFFFFF",
    fontSize: 8,
    fontWeight: "800",
  },

  sameYearBadge: {
    width: 78,
    paddingVertical: 5,
    backgroundColor: "#76588E",
    alignItems: "center",
  },

  sameYearBadgeText: {
    color: "#FFFFFF",
    fontSize: 8,
    fontWeight: "800",
  },

  yearRuleText: {
    flex: 1,
    color: "#3E4D58",
    fontSize: 11,
    fontWeight: "700",
  },

  yearRuleNote: {
    marginTop: 11,
    color: "#707980",
    fontSize: 10,
    lineHeight: 16,
  },

  scoreGuide: {
    marginTop: 10,
    padding: 14,
    backgroundColor: "#E8F0F2",
    borderLeftWidth: 4,
    borderLeftColor: "#347F9E",
  },

  scoreGuideLabel: {
    color: "#347F9E",
    fontSize: 10,
    fontWeight: "800",
  },

  scoreGuideText: {
    marginTop: 5,
    color: "#43545F",
    fontSize: 11,
    lineHeight: 18,
  },

  messageBox: {
    marginTop: 10,
    padding: 15,
    backgroundColor: "#FFF4E8",
    borderLeftWidth: 4,
    borderLeftColor: "#D99A37",
  },

  messageTitle: {
    color: "#76511E",
    fontSize: 14,
    fontWeight: "800",
  },

  messageText: {
    marginTop: 6,
    color: "#6E5D46",
    fontSize: 11,
    lineHeight: 18,
  },

  startButton: {
    minHeight: 57,
    marginTop: 17,
    paddingHorizontal: 18,
    backgroundColor: "#C95D36",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  startButtonPressed: {
    opacity: 0.75,
  },

  startButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },

  startButtonArrow: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "500",
  },

  autoSaveNote: {
    marginTop: 9,
    color: "#77776F",
    fontSize: 9,
    textAlign: "center",
  },
});
