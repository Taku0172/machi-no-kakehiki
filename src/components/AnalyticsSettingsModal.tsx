import {
    Modal,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    View,
} from "react-native";

import type { AnalyticsConsentChoice } from "../analytics/analyticsConsent";

type AnalyticsSettingsModalProps = {
  visible: boolean;
  consent: AnalyticsConsentChoice;
  isUpdating?: boolean;
  onChangeConsent: (choice: AnalyticsConsentChoice) => void;
  onClose: () => void;
};

export function AnalyticsSettingsModal({
  visible,
  consent,
  isUpdating = false,
  onChangeConsent,
  onClose,
}: AnalyticsSettingsModalProps) {
  const isEnabled = consent === "accepted";

  function handleValueChange(nextValue: boolean) {
    const nextChoice: AnalyticsConsentChoice = nextValue
      ? "accepted"
      : "declined";

    onChangeConsent(nextChoice);
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.screen}>
        <View style={styles.header}>
          <View>
            <Text style={styles.appName}>まちのかけひき</Text>

            <Text style={styles.headerLabel}>データ設定</Text>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="データ設定を閉じる"
            onPress={onClose}
            style={({ pressed }) => [
              styles.closeButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.closeButtonText}>閉じる</Text>
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <Text style={styles.eyebrow}>ANALYTICS</Text>

            <Text style={styles.title}>プレイデータの送信</Text>

            <Text style={styles.description}>
              政策の選ばれ方や街の変化を分析し、政策課題とゲームバランスの改善に活用します。
            </Text>

            <View style={styles.settingRow}>
              <View style={styles.settingTextArea}>
                <Text style={styles.settingTitle}>改善用データを送信する</Text>

                <Text style={styles.settingStatus}>
                  現在：
                  {isEnabled ? "送信する" : "送信しない"}
                </Text>
              </View>

              <Switch
                accessibilityLabel="プレイデータの送信設定"
                value={isEnabled}
                disabled={isUpdating}
                onValueChange={handleValueChange}
                trackColor={{
                  false: "#B9B5AC",
                  true: "#6AA68F",
                }}
                thumbColor={isEnabled ? "#2D755E" : "#F5F2EA"}
              />
            </View>

            {isUpdating && (
              <Text style={styles.updatingText}>設定を保存しています...</Text>
            )}

            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>送信される内容</Text>

              <InfoRow text="表示された政策課題" />
              <InfoRow text="選択した戦略" />
              <InfoRow text="設定した数値" />
              <InfoRow text="政策実行前後の街の状態" />
              <InfoRow text="発展段階とゲームの最終結果" />
              <InfoRow text="OSの種類と言語設定" />
            </View>

            <View style={styles.privacyBox}>
              <Text style={styles.privacyTitle}>送信しない情報</Text>

              <Text style={styles.privacyText}>
                氏名、メールアドレス、住所、正確な位置情報、連絡先など、個人を直接特定する情報は送信しません。
              </Text>
            </View>

            <View style={styles.noticeBox}>
              <Text style={styles.noticeTitle}>設定をオフにした場合</Text>

              <Text style={styles.noticeText}>
                設定変更後のプレイデータは送信されません。ゲーム内容や利用できる機能に違いはありません。
              </Text>

              <Text style={styles.noticeText}>
                すでに送信されたデータは匿名で保存されているため、利用者を特定して個別に削除することはできません。
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

type InfoRowProps = {
  text: string;
};

function InfoRow({ text }: InfoRowProps) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoMarker} />
      <Text style={styles.infoText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#E8DFCC",
  },

  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#0D2538",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  appName: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },

  headerLabel: {
    marginTop: 2,
    color: "#A9C1CF",
    fontSize: 11,
  },

  closeButton: {
    minWidth: 68,
    minHeight: 40,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#557084",
  },

  closeButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },

  content: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: 40,
  },

  card: {
    padding: 20,
    backgroundColor: "#FFFDF7",
    borderTopWidth: 5,
    borderTopColor: "#D99A37",
  },

  eyebrow: {
    color: "#C95D36",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 2,
  },

  title: {
    marginTop: 8,
    color: "#142436",
    fontSize: 24,
    fontWeight: "800",
  },

  description: {
    marginTop: 12,
    color: "#536170",
    fontSize: 14,
    lineHeight: 22,
  },

  settingRow: {
    marginTop: 20,
    padding: 16,
    backgroundColor: "#F1ECE1",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },

  settingTextArea: {
    flex: 1,
  },

  settingTitle: {
    color: "#142436",
    fontSize: 15,
    fontWeight: "800",
  },

  settingStatus: {
    marginTop: 5,
    color: "#65717D",
    fontSize: 12,
  },

  updatingText: {
    marginTop: 8,
    color: "#2D755E",
    fontSize: 11,
    textAlign: "right",
  },

  infoBox: {
    marginTop: 18,
    padding: 16,
    backgroundColor: "#EEF3F5",
  },

  infoTitle: {
    marginBottom: 8,
    color: "#245E78",
    fontSize: 14,
    fontWeight: "800",
  },

  infoRow: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
  },

  infoMarker: {
    width: 7,
    height: 7,
    marginRight: 10,
    borderRadius: 4,
    backgroundColor: "#347F9E",
  },

  infoText: {
    flex: 1,
    color: "#536170",
    fontSize: 13,
    lineHeight: 19,
  },

  privacyBox: {
    marginTop: 14,
    padding: 16,
    backgroundColor: "#E4EEE9",
    borderLeftWidth: 4,
    borderLeftColor: "#2D755E",
  },

  privacyTitle: {
    color: "#2D755E",
    fontSize: 14,
    fontWeight: "800",
  },

  privacyText: {
    marginTop: 7,
    color: "#496057",
    fontSize: 13,
    lineHeight: 20,
  },

  noticeBox: {
    marginTop: 14,
    padding: 16,
    backgroundColor: "#F5EEE8",
    borderLeftWidth: 4,
    borderLeftColor: "#C95D36",
  },

  noticeTitle: {
    color: "#A84628",
    fontSize: 14,
    fontWeight: "800",
  },

  noticeText: {
    marginTop: 7,
    color: "#695B55",
    fontSize: 12,
    lineHeight: 19,
  },

  buttonPressed: {
    opacity: 0.7,
  },
});
