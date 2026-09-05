import { StatusBar } from "expo-status-bar";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

type AnalyticsConsentScreenProps = {
  onAccept: () => void;
  onDecline: () => void;
};

export function AnalyticsConsentScreen({
  onAccept,
  onDecline,
}: AnalyticsConsentScreenProps) {
  return (
    <View style={styles.screen}>
      <StatusBar style="light" />

      <View style={styles.header}>
        <Text style={styles.appName}>まちのかけひき</Text>
        <Text style={styles.headerLabel}>プレイデータについて</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Text style={styles.eyebrow}>DATA COLLECTION</Text>

          <Text style={styles.title}>ゲーム改善への協力をお願いします</Text>

          <Text style={styles.description}>
            「まちのかけひき」では、政策課題の調整やゲームバランスの改善を目的として、プレイデータを収集します。
          </Text>

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>収集するデータ</Text>

            <DataRow text="選択した政策や戦略" />
            <DataRow text="スライダーで決定した数値" />
            <DataRow text="政策実行前後の街の状態" />
            <DataRow text="戦略を変更した時期と回数" />
            <DataRow text="ゲームの進行年度と最終結果" />
          </View>

          <View style={styles.privacyBox}>
            <Text style={styles.privacyTitle}>
              個人を特定する情報は収集しません
            </Text>

            <Text style={styles.privacyText}>
              氏名、メールアドレス、位置情報、連絡先などは送信しません。収集したデータは、ゲーム内容の分析と改善に使用します。
            </Text>
          </View>

          <Text style={styles.choiceDescription}>
            協力しない場合でも、ゲームの内容や機能に違いはありません。設定はあとから変更できるようにする予定です。
          </Text>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="データ収集に協力してゲームを始める"
            onPress={onAccept}
            style={({ pressed }) => [
              styles.acceptButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.acceptButtonText}>協力してゲームを始める</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="データを送信せずにゲームを始める"
            onPress={onDecline}
            style={({ pressed }) => [
              styles.declineButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.declineButtonText}>送信せずに始める</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

type DataRowProps = {
  text: string;
};

function DataRow({ text }: DataRowProps) {
  return (
    <View style={styles.dataRow}>
      <View style={styles.dataMarker} />
      <Text style={styles.dataText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#E8DFCC",
  },

  header: {
    paddingTop: 58,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: "#0D2538",
  },

  appName: {
    color: "#FFFFFF",
    fontSize: 21,
    fontWeight: "bold",
  },

  headerLabel: {
    marginTop: 4,
    color: "#A9C1CF",
    fontSize: 12,
  },

  content: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 16,
    paddingBottom: 40,
  },

  card: {
    padding: 22,
    backgroundColor: "#FFFDF7",
    borderTopWidth: 5,
    borderTopColor: "#D99A37",
  },

  eyebrow: {
    color: "#C95D36",
    fontSize: 11,
    fontWeight: "bold",
    letterSpacing: 2,
  },

  title: {
    marginTop: 10,
    color: "#142436",
    fontSize: 25,
    fontWeight: "bold",
    lineHeight: 35,
  },

  description: {
    marginTop: 14,
    color: "#536170",
    fontSize: 15,
    lineHeight: 24,
  },

  infoBox: {
    marginTop: 20,
    padding: 16,
    backgroundColor: "#F1ECE1",
  },

  infoTitle: {
    marginBottom: 10,
    color: "#142436",
    fontSize: 15,
    fontWeight: "bold",
  },

  dataRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },

  dataMarker: {
    width: 7,
    height: 7,
    marginRight: 10,
    backgroundColor: "#347F9E",
    borderRadius: 4,
  },

  dataText: {
    flex: 1,
    color: "#536170",
    fontSize: 14,
    lineHeight: 20,
  },

  privacyBox: {
    marginTop: 16,
    padding: 16,
    backgroundColor: "#E4EEE9",
    borderLeftWidth: 4,
    borderLeftColor: "#2D755E",
  },

  privacyTitle: {
    color: "#2D755E",
    fontSize: 14,
    fontWeight: "bold",
  },

  privacyText: {
    marginTop: 7,
    color: "#496057",
    fontSize: 13,
    lineHeight: 21,
  },

  choiceDescription: {
    marginTop: 16,
    color: "#65717D",
    fontSize: 12,
    lineHeight: 19,
  },

  acceptButton: {
    marginTop: 22,
    minHeight: 54,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
    backgroundColor: "#C95D36",
  },

  acceptButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },

  declineButton: {
    marginTop: 10,
    minHeight: 50,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
    backgroundColor: "#E9E5DC",
    borderWidth: 1,
    borderColor: "#C9C3B8",
  },

  declineButtonText: {
    color: "#536170",
    fontSize: 15,
    fontWeight: "bold",
  },

  buttonPressed: {
    opacity: 0.75,
  },
});
