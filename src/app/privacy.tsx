import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import type { ReactNode } from "react";
import {
    Linking,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

const CONTACT_URL = "https://github.com/Taku0172/machi-no-kakehiki/issues";

const SUPABASE_PRIVACY_URL = "https://supabase.com/privacy";

export default function PrivacyPolicyScreen() {
  function returnToGame() {
    router.replace("/");
  }

  function openContactPage() {
    void Linking.openURL(CONTACT_URL);
  }

  function openSupabasePrivacyPolicy() {
    void Linking.openURL(SUPABASE_PRIVACY_URL);
  }

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="light" />

      <View style={styles.header}>
        <View style={styles.headerTextArea}>
          <Text style={styles.appName}>まちのかけひき</Text>
          <Text style={styles.headerLabel}>PRIVACY POLICY</Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="ゲーム画面へ戻る"
          onPress={returnToGame}
          style={({ pressed }) => [
            styles.closeButton,
            pressed && styles.buttonPressed,
          ]}
        >
          <Text style={styles.closeButtonText}>戻る</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.policyCard}>
          <Text style={styles.eyebrow}>DATA & PRIVACY</Text>
          <Text style={styles.title}>プライバシーポリシー</Text>
          <Text style={styles.effectiveDate}>制定日：2026年9月5日</Text>

          <Text style={styles.introduction}>
            「まちのかけひき」の運営者は、本アプリにおける利用者情報の取り扱いについて、以下のとおりプライバシーポリシーを定めます。
          </Text>

          <PolicySection title="1．基本方針">
            <PolicyParagraph>
              本アプリは、利用者のプライバシーを尊重し、ゲームの提供、品質改善および不具合調査に必要な範囲でのみデータを取り扱います。
            </PolicyParagraph>

            <PolicyParagraph>
              氏名、住所、電話番号、メールアドレス、正確な位置情報など、利用者を直接特定する情報は収集しません。
            </PolicyParagraph>
          </PolicySection>

          <PolicySection title="2．収集するデータ">
            <PolicyParagraph>
              利用者がプレイデータの送信に同意した場合、次の情報を収集します。
            </PolicyParagraph>

            <PolicyListItem text="表示された政策課題" />
            <PolicyListItem text="選択した戦略と選択肢" />
            <PolicyListItem text="設定した政策数値" />
            <PolicyListItem text="政策実行前後の街の状態" />
            <PolicyListItem text="ゲーム内の年度、発展段階および進行状況" />
            <PolicyListItem text="発展モデルと戦略変更の状況" />
            <PolicyListItem text="ゲーム終了時の評価結果" />
            <PolicyListItem text="OSの種類、言語設定、アプリのバージョン" />
            <PolicyListItem text="データを送信した日時" />
            <PolicyListItem text="無作為に生成した匿名セッションID" />

            <PolicyParagraph>
              匿名セッションIDは、1回のゲーム内でデータの順序を整理するために使用します。広告識別子や端末固有の識別子は使用しません。
            </PolicyParagraph>
          </PolicySection>

          <PolicySection title="3．データの収集方法">
            <PolicyParagraph>
              初回利用時に、プレイデータの送信に協力するか確認します。「協力して始める」を選択した場合に限り、ゲーム開始時や政策実行時などにデータを送信します。
            </PolicyParagraph>

            <PolicyParagraph>
              「送信せずに始める」を選択した場合、プレイデータは送信されません。どちらを選択しても、ゲームの内容や利用できる機能に違いはありません。
            </PolicyParagraph>
          </PolicySection>

          <PolicySection title="4．利用目的">
            <PolicyParagraph>
              収集したデータは、次の目的で利用します。
            </PolicyParagraph>

            <PolicyListItem text="政策課題や選択傾向の分析" />
            <PolicyListItem text="ゲームバランスの調整" />
            <PolicyListItem text="画面や進行方法の改善" />
            <PolicyListItem text="不具合の調査および品質改善" />
            <PolicyListItem text="新しい政策課題や機能の企画" />

            <PolicyParagraph>
              学術研究など、ゲーム改善以外の目的で利用する場合は、必要に応じて別途説明し、追加の同意を取得します。
            </PolicyParagraph>
          </PolicySection>

          <PolicySection title="5．外部サービス">
            <PolicyParagraph>
              本アプリは、プレイデータの保存および管理にSupabaseを利用します。送信されたデータは、Supabaseが提供するサーバーに保存されます。
            </PolicyParagraph>

            <Pressable
              accessibilityRole="link"
              accessibilityLabel="Supabaseのプライバシーポリシーを開く"
              onPress={openSupabasePrivacyPolicy}
              style={({ pressed }) => [
                styles.linkButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.linkButtonText}>
                Supabaseのプライバシーポリシー
              </Text>
            </Pressable>

            <PolicyParagraph>
              外部サービスの運営者が技術的なログを処理する場合があります。その取り扱いには、当該サービスのプライバシーポリシーが適用されます。
            </PolicyParagraph>
          </PolicySection>

          <PolicySection title="6．第三者提供と広告利用">
            <PolicyParagraph>
              法令に基づく場合を除き、収集したプレイデータを広告事業者やデータ販売事業者へ販売または提供しません。
            </PolicyParagraph>

            <PolicyParagraph>
              本アプリは、他社のアプリやウェブサイトを横断して利用者を追跡する目的でデータを利用しません。また、ターゲティング広告には利用しません。
            </PolicyParagraph>
          </PolicySection>

          <PolicySection title="7．保存期間">
            <PolicyParagraph>
              収集したデータは、利用目的の達成に必要な期間保存し、必要がなくなった場合は削除または個人を識別できない集計データへ変換します。
            </PolicyParagraph>

            <PolicyParagraph>
              氏名やアカウントとプレイデータを結び付けていないため、送信後の匿名データから特定の利用者のデータだけを識別できない場合があります。
            </PolicyParagraph>
          </PolicySection>

          <PolicySection title="8．同意の変更">
            <PolicyParagraph>
              利用者は、ゲーム画面の「プレイデータの設定」から、今後のデータ送信をいつでも停止できます。
            </PolicyParagraph>

            <PolicyParagraph>
              送信を停止しても、ゲームの内容や利用できる機能に違いはありません。再度オンにした場合は、新しい匿名セッションとしてデータ送信を開始します。
            </PolicyParagraph>
          </PolicySection>

          <PolicySection title="9．安全管理">
            <PolicyParagraph>
              収集したデータへの不正アクセス、漏えい、改ざん、消失などを防止するため、アクセス制限などの合理的な安全管理措置を講じます。
            </PolicyParagraph>
          </PolicySection>

          <PolicySection title="10．ポリシーの変更">
            <PolicyParagraph>
              アプリの機能、利用する外部サービスまたは法令などの変更に応じて、本ポリシーを改定することがあります。重要な変更がある場合は、アプリ内など適切な方法でお知らせします。
            </PolicyParagraph>
          </PolicySection>

          <PolicySection title="11．お問い合わせ">
            <PolicyParagraph>
              本ポリシーやデータの取り扱いに関するお問い合わせは、以下のGitHub
              Issuesからご連絡ください。
            </PolicyParagraph>

            <PolicyParagraph>
              GitHub
              Issuesは公開される場合があります。氏名、住所、メールアドレスなどの個人情報を書き込まないでください。
            </PolicyParagraph>

            <Pressable
              accessibilityRole="link"
              accessibilityLabel="GitHubのお問い合わせページを開く"
              onPress={openContactPage}
              style={({ pressed }) => [
                styles.contactButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.contactButtonText}>
                お問い合わせページを開く
              </Text>
            </Pressable>

            <Text style={styles.urlText}>{CONTACT_URL}</Text>
          </PolicySection>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="ゲーム画面へ戻る"
            onPress={returnToGame}
            style={({ pressed }) => [
              styles.returnButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.returnButtonText}>ゲームに戻る</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

type PolicySectionProps = {
  title: string;
  children: ReactNode;
};

function PolicySection({ title, children }: PolicySectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

type PolicyParagraphProps = {
  children: ReactNode;
};

function PolicyParagraph({ children }: PolicyParagraphProps) {
  return <Text style={styles.paragraph}>{children}</Text>;
}

type PolicyListItemProps = {
  text: string;
};

function PolicyListItem({ text }: PolicyListItemProps) {
  return (
    <View style={styles.listItem}>
      <View style={styles.listMarker} />
      <Text style={styles.listText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#E8DFCC",
  },

  header: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: "#0D2538",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerTextArea: {
    flex: 1,
  },

  appName: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },

  headerLabel: {
    marginTop: 2,
    color: "#D99A37",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.5,
  },

  closeButton: {
    minWidth: 62,
    minHeight: 38,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#557084",
  },

  closeButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },

  content: {
    padding: 14,
    paddingBottom: 40,
  },

  policyCard: {
    padding: 20,
    backgroundColor: "#FFFDF7",
    borderTopWidth: 5,
    borderTopColor: "#D99A37",
  },

  eyebrow: {
    color: "#C95D36",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 2,
  },

  title: {
    marginTop: 8,
    color: "#142436",
    fontSize: 27,
    fontWeight: "800",
  },

  effectiveDate: {
    marginTop: 7,
    color: "#77818A",
    fontSize: 11,
  },

  introduction: {
    marginTop: 18,
    color: "#536170",
    fontSize: 14,
    lineHeight: 23,
  },

  section: {
    marginTop: 25,
    paddingTop: 18,
    borderTopWidth: 1,
    borderTopColor: "#DED8CC",
  },

  sectionTitle: {
    marginBottom: 9,
    color: "#142436",
    fontSize: 17,
    fontWeight: "800",
  },

  paragraph: {
    marginTop: 8,
    color: "#536170",
    fontSize: 13,
    lineHeight: 22,
  },

  listItem: {
    marginTop: 9,
    flexDirection: "row",
    alignItems: "flex-start",
  },

  listMarker: {
    width: 7,
    height: 7,
    marginTop: 6,
    marginRight: 10,
    borderRadius: 4,
    backgroundColor: "#347F9E",
  },

  listText: {
    flex: 1,
    color: "#536170",
    fontSize: 13,
    lineHeight: 20,
  },

  linkButton: {
    minHeight: 45,
    marginTop: 14,
    marginBottom: 4,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
    backgroundColor: "#E8F0F3",
    borderWidth: 1,
    borderColor: "#AFC6D0",
  },

  linkButtonText: {
    color: "#245E78",
    fontSize: 13,
    fontWeight: "700",
  },

  contactButton: {
    minHeight: 48,
    marginTop: 15,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
    backgroundColor: "#347F9E",
  },

  contactButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },

  urlText: {
    marginTop: 9,
    color: "#77818A",
    fontSize: 10,
    lineHeight: 16,
    textAlign: "center",
  },

  returnButton: {
    minHeight: 52,
    marginTop: 28,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    backgroundColor: "#C95D36",
  },

  returnButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },

  buttonPressed: {
    opacity: 0.72,
  },
});
