import type { CityScoreKey, CityScores, CityState } from "../types/game";

// 評価項目の表示設定
export const cityScoreDefinitions: Record<
  CityScoreKey,
  {
    label: string;
    shortLabel: string;
    color: string;
    description: string;
  }
> = {
  overall: {
    label: "総合評価",
    shortLabel: "総合",
    color: "#142436",
    description: "6種類の街評価を総合したポイントです。",
  },

  transport: {
    label: "交通評価",
    shortLabel: "交通",
    color: "#347F9E",
    description: "都市基盤の充実度と道路混雑から計算されます。",
  },

  industry: {
    label: "産業評価",
    shortLabel: "産業",
    color: "#C95D36",
    description: "経済力と都市基盤から計算されます。",
  },

  living: {
    label: "生活評価",
    shortLabel: "生活",
    color: "#D99A37",
    description: "満足度、環境、混雑状況から計算されます。",
  },

  environment: {
    label: "環境評価",
    shortLabel: "環境",
    color: "#4C8C68",
    description: "街の自然環境と生活環境を表します。",
  },

  finance: {
    label: "財政評価",
    shortLabel: "財政",
    color: "#76588E",
    description: "自治体が政策へ使える財政余力を表します。",
  },

  trust: {
    label: "信頼評価",
    shortLabel: "信頼",
    color: "#2D755E",
    description: "住民や企業から市政への信頼を表します。",
  },
};

// 数値を0〜100に収める
function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

// 総合評価を計算する
export function calculateOverallScore(
  scores: Omit<CityScores, "overall">,
): number {
  const total =
    scores.transport +
    scores.industry +
    scores.living +
    scores.environment +
    scores.finance +
    scores.trust;

  return Math.round(total / 6);
}

// 街の基本数値から評価ポイントを計算する
export function calculateCityScores(city: CityState): CityScores {
  // 混雑は低い方が良いため、100から差し引く
  const congestionComfort = 100 - city.congestion;

  const baseScores: Omit<CityScores, "overall"> = {
    transport: clampScore(
      city.infrastructure * 0.65 + congestionComfort * 0.35,
    ),

    industry: clampScore(city.economy * 0.7 + city.infrastructure * 0.3),

    living: clampScore(
      city.happiness * 0.6 + city.environment * 0.25 + congestionComfort * 0.15,
    ),

    environment: clampScore(city.environment),

    // 財政はマイナスになり得るが、評価表示は0〜100
    finance: clampScore(city.budget),

    trust: clampScore(city.trust),
  };

  return {
    overall: calculateOverallScore(baseScores),
    ...baseScores,
  };
}

// 総合評価をランクへ変換する
export function getCityRank(overallScore: number): "S" | "A" | "B" | "C" | "D" {
  if (overallScore >= 85) {
    return "S";
  }

  if (overallScore >= 70) {
    return "A";
  }

  if (overallScore >= 55) {
    return "B";
  }

  if (overallScore >= 40) {
    return "C";
  }

  return "D";
}

// 前回から評価がどれだけ変化したか計算する
export function calculateScoreChanges(
  currentScores: CityScores,
  previousScores: CityScores,
): CityScores {
  return {
    overall: currentScores.overall - previousScores.overall,
    transport: currentScores.transport - previousScores.transport,
    industry: currentScores.industry - previousScores.industry,
    living: currentScores.living - previousScores.living,
    environment: currentScores.environment - previousScores.environment,
    finance: currentScores.finance - previousScores.finance,
    trust: currentScores.trust - previousScores.trust,
  };
}

// 評価値に応じた短いコメントを返す
export function getScoreComment(score: number): string {
  if (score >= 85) {
    return "非常に良好";
  }

  if (score >= 70) {
    return "良好";
  }

  if (score >= 55) {
    return "安定";
  }

  if (score >= 40) {
    return "要注意";
  }

  return "危機的";
}
