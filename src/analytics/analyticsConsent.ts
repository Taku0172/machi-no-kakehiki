import AsyncStorage from "@react-native-async-storage/async-storage";

// 同意文の内容を変更した場合は、この数字を増やす。
// バージョンが変わると、ユーザーへ同意画面を再表示できる。
const CURRENT_CONSENT_VERSION = 2;

const ANALYTICS_CONSENT_STORAGE_KEY = "@machi_no_kakehiki/analytics_consent";

export type AnalyticsConsentChoice = "accepted" | "declined";

type StoredAnalyticsConsent = {
  choice: AnalyticsConsentChoice;
  version: number;
  updatedAt: string;
};

/**
 * 端末に保存されている分析データ収集への同意状態を取得する。
 *
 * 保存されていない場合や、同意文のバージョンが古い場合はnullを返す。
 */
export async function loadAnalyticsConsent(): Promise<AnalyticsConsentChoice | null> {
  try {
    const storedValue = await AsyncStorage.getItem(
      ANALYTICS_CONSENT_STORAGE_KEY,
    );

    if (!storedValue) {
      return null;
    }

    const parsedValue = JSON.parse(
      storedValue,
    ) as Partial<StoredAnalyticsConsent>;

    const choice = parsedValue.choice;
    const version = parsedValue.version;

    const isValidChoice = choice === "accepted" || choice === "declined";

    const isCurrentVersion = version === CURRENT_CONSENT_VERSION;

    if (!isValidChoice || !isCurrentVersion) {
      return null;
    }

    return choice;
  } catch (error) {
    console.warn("分析データ収集への同意状態を読み込めませんでした。", error);

    return null;
  }
}

/**
 * 分析データ収集への同意または拒否を端末に保存する。
 */
export async function saveAnalyticsConsent(
  choice: AnalyticsConsentChoice,
): Promise<void> {
  const consent: StoredAnalyticsConsent = {
    choice,
    version: CURRENT_CONSENT_VERSION,
    updatedAt: new Date().toISOString(),
  };

  try {
    await AsyncStorage.setItem(
      ANALYTICS_CONSENT_STORAGE_KEY,
      JSON.stringify(consent),
    );
  } catch (error) {
    console.warn("分析データ収集への同意状態を保存できませんでした。", error);

    throw error;
  }
}

/**
 * 開発中の確認や、設定画面から選択をやり直す場合に使用する。
 */
export async function clearAnalyticsConsent(): Promise<void> {
  try {
    await AsyncStorage.removeItem(ANALYTICS_CONSENT_STORAGE_KEY);
  } catch (error) {
    console.warn("分析データ収集への同意状態を削除できませんでした。", error);

    throw error;
  }
}

/**
 * 同意している場合だけtrueを返す。
 */
export async function hasAcceptedAnalytics(): Promise<boolean> {
  const choice = await loadAnalyticsConsent();

  return choice === "accepted";
}
