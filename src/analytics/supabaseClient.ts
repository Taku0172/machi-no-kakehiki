import { createClient } from "@supabase/supabase-js";

// ExpoではEXPO_PUBLIC_から始まる環境変数を
// アプリ内で参照できる
const supabaseUrlFromEnvironment = process.env.EXPO_PUBLIC_SUPABASE_URL;

const supabaseKeyFromEnvironment =
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

// createClientへ渡す値は必ずstringにする
const supabaseUrl = supabaseUrlFromEnvironment ?? "";

const supabasePublishableKey = supabaseKeyFromEnvironment ?? "";

// URLと公開用キーが両方設定されているか
export const isAnalyticsConfigured =
  supabaseUrl.length > 0 && supabasePublishableKey.length > 0;

// 設定がない場合はnullにする
// データ収集未設定でもゲーム本体は動作する
export const supabase = isAnalyticsConfigured
  ? createClient(supabaseUrl, supabasePublishableKey, {
      auth: {
        // 匿名プレイログのみなので、
        // ユーザーログイン状態は保存しない
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },

      global: {
        headers: {
          "x-application-name": "machi-no-kakehiki",
        },
      },
    })
  : null;

// 接続設定の状態を取得する
export function getAnalyticsConfiguration(): {
  configured: boolean;
  hasUrl: boolean;
  hasPublishableKey: boolean;
} {
  return {
    configured: isAnalyticsConfigured,

    hasUrl: supabaseUrl.length > 0,

    hasPublishableKey: supabasePublishableKey.length > 0,
  };
}
