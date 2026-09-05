import { calculateCityScores } from "./scoreEngine";

import type {
    CityMetric,
    CityScoreKey,
    CityState,
    DevelopmentModel,
    Policy,
    PolicyCategory,
    StrategyPolicy,
} from "../types/game";

// ==================================================
// 政策選択に渡す情報
// ==================================================

export type PolicySelectionOptions = {
  policies: Policy[];
  city: CityState;
  category: PolicyCategory;

  activeDevelopmentModel?: DevelopmentModel | null;

  completedPolicyIds?: string[];
  recentPolicyIds?: string[];

  // テスト時に乱数を固定できるようにする
  random?: () => number;
};

export type StrategyReviewTriggerOptions = {
  city: CityState;
  lastStrategyReviewYear: number | null;
  availableReviewCount: number;
  random?: () => number;
};

// ==================================================
// 政策の出現条件
// ==================================================

function meetsMinimumMetrics(
  city: CityState,
  minimumMetrics: Partial<Record<CityMetric, number>> = {},
): boolean {
  return Object.entries(minimumMetrics).every(([key, value]) => {
    const metric = key as CityMetric;

    return city[metric] >= (value ?? 0);
  });
}

function meetsMaximumMetrics(
  city: CityState,
  maximumMetrics: Partial<Record<CityMetric, number>> = {},
): boolean {
  return Object.entries(maximumMetrics).every(([key, value]) => {
    const metric = key as CityMetric;

    return city[metric] <= (value ?? 100);
  });
}

// 年度、人口、街の数値条件を確認する
export function meetsPolicyConditions(
  policy: Policy,
  city: CityState,
): boolean {
  const conditions = policy.conditions;

  if (!conditions) {
    return true;
  }

  if (
    conditions.minimumYear !== undefined &&
    city.year < conditions.minimumYear
  ) {
    return false;
  }

  if (
    conditions.maximumYear !== undefined &&
    city.year > conditions.maximumYear
  ) {
    return false;
  }

  if (
    conditions.minimumPopulation !== undefined &&
    city.population < conditions.minimumPopulation
  ) {
    return false;
  }

  if (
    conditions.maximumPopulation !== undefined &&
    city.population > conditions.maximumPopulation
  ) {
    return false;
  }

  if (!meetsMinimumMetrics(city, conditions.minimumMetrics)) {
    return false;
  }

  if (!meetsMaximumMetrics(city, conditions.maximumMetrics)) {
    return false;
  }

  return true;
}

// 現在の発展段階に対応しているか確認する
function matchesDevelopmentStage(policy: Policy, city: CityState): boolean {
  if (!policy.stages || policy.stages.length === 0) {
    return true;
  }

  return policy.stages.includes(city.stage);
}

// 政策カテゴリーを確認する
function matchesCategory(policy: Policy, category: PolicyCategory): boolean {
  const policyCategory = policy.category ?? "regularPolicy";

  return policyCategory === category;
}

// 戦略見直しが現在の成長モデルに対応するか確認する
function matchesDevelopmentModel(
  policy: Policy,
  activeDevelopmentModel: DevelopmentModel | null | undefined,
): boolean {
  if (policy.category !== "strategyReview") {
    return true;
  }

  if (!activeDevelopmentModel) {
    return false;
  }

  const requiredTag = `current-${activeDevelopmentModel}`;

  return policy.tags?.includes(requiredTag) ?? false;
}

// クールダウン期間中か確認する
function isPolicyCoolingDown(
  policy: Policy,
  recentPolicyIds: string[],
): boolean {
  const cooldown = policy.cooldown ?? 5;

  if (cooldown <= 0) {
    return false;
  }

  return recentPolicyIds.slice(-cooldown).includes(policy.id);
}

// 再出題不可の政策が実行済みか確認する
function isCompletedNonRepeatablePolicy(
  policy: Policy,
  completedPolicyIds: string[],
): boolean {
  const repeatable = policy.repeatable ?? true;

  return !repeatable && completedPolicyIds.includes(policy.id);
}

// 条件を満たす政策だけを抽出する
export function getEligiblePolicies({
  policies,
  city,
  category,
  activeDevelopmentModel = null,
  completedPolicyIds = [],
  recentPolicyIds = [],
}: PolicySelectionOptions): Policy[] {
  return policies.filter((policy) => {
    if (!matchesCategory(policy, category)) {
      return false;
    }

    if (!matchesDevelopmentStage(policy, city)) {
      return false;
    }

    if (!matchesDevelopmentModel(policy, activeDevelopmentModel)) {
      return false;
    }

    if (!meetsPolicyConditions(policy, city)) {
      return false;
    }

    if (isCompletedNonRepeatablePolicy(policy, completedPolicyIds)) {
      return false;
    }

    if (isPolicyCoolingDown(policy, recentPolicyIds)) {
      return false;
    }

    return true;
  });
}

// ==================================================
// 街の弱点による出題確率の調整
// ==================================================

function getDomainScoreKey(policy: Policy): CityScoreKey | null {
  switch (policy.domain) {
    case "transport":
      return "transport";

    case "industry":
      return "industry";

    case "living":
      return "living";

    case "environment":
      return "environment";

    case "finance":
      return "finance";

    case "trust":
      return "trust";

    case "infrastructure":
      return "transport";

    default:
      return null;
  }
}

// 評価が低い分野の政策ほど重みを大きくする
function calculatePolicyWeight(policy: Policy, city: CityState): number {
  const scores = calculateCityScores(city);
  const baseWeight = Math.max(0.1, policy.weight ?? 1);

  const scoreKey = getDomainScoreKey(policy);

  if (!scoreKey) {
    return baseWeight;
  }

  const domainScore = scores[scoreKey];

  if (domainScore < 30) {
    return baseWeight * 2.5;
  }

  if (domainScore < 45) {
    return baseWeight * 2;
  }

  if (domainScore < 60) {
    return baseWeight * 1.4;
  }

  return baseWeight;
}

// ==================================================
// 重み付き抽選
// ==================================================

function selectByWeight(
  policies: Policy[],
  city: CityState,
  random: () => number,
): Policy | null {
  if (policies.length === 0) {
    return null;
  }

  const weightedPolicies = policies.map((policy) => ({
    policy,
    weight: calculatePolicyWeight(policy, city),
  }));

  const totalWeight = weightedPolicies.reduce(
    (sum, item) => sum + item.weight,
    0,
  );

  let randomPosition = random() * totalWeight;

  for (const item of weightedPolicies) {
    randomPosition -= item.weight;

    if (randomPosition <= 0) {
      return item.policy;
    }
  }

  return weightedPolicies[weightedPolicies.length - 1].policy;
}

// ==================================================
// 共通の政策選択
// ==================================================

export function selectNextPolicy(
  options: PolicySelectionOptions,
): Policy | null {
  const random = options.random ?? Math.random;

  // すべての条件を適用して選ぶ
  const eligiblePolicies = getEligiblePolicies(options);

  if (eligiblePolicies.length > 0) {
    return selectByWeight(eligiblePolicies, options.city, random);
  }

  // 候補がなければクールダウンだけ解除する
  const withoutCooldown = getEligiblePolicies({
    ...options,
    recentPolicyIds: [],
  });

  if (withoutCooldown.length > 0) {
    return selectByWeight(withoutCooldown, options.city, random);
  }

  return null;
}

// ==================================================
// 通常政策
// ==================================================

export function selectRegularPolicy(
  policies: Policy[],
  city: CityState,
  completedPolicyIds: string[],
  recentPolicyIds: string[],
  random: () => number = Math.random,
): Policy | null {
  return selectNextPolicy({
    policies,
    city,
    category: "regularPolicy",
    completedPolicyIds,
    recentPolicyIds,
    random,
  });
}

// ==================================================
// 発展段階の戦略課題
// ==================================================

export function selectStageStrategyPolicy(
  policies: Policy[],
  city: CityState,
  completedPolicyIds: string[],
): StrategyPolicy | null {
  const selectedPolicy = selectNextPolicy({
    policies,
    city,
    category: "stageStrategy",
    completedPolicyIds,
    recentPolicyIds: [],
  });

  if (!selectedPolicy || selectedPolicy.type !== "strategy") {
    return null;
  }

  return selectedPolicy;
}

// ==================================================
// 戦略見直しイベント
// ==================================================

// 戦略見直しを出す年度か判定する
export function shouldTriggerStrategyReview({
  city,
  lastStrategyReviewYear,
  availableReviewCount,
  random = Math.random,
}: StrategyReviewTriggerOptions): boolean {
  // 選べる見直しイベントがなければ出さない
  if (availableReviewCount <= 0) {
    return false;
  }

  // 創生期と5年目までは現在戦略を試してもらう
  if (city.stage === "creation" || city.year < 6) {
    return false;
  }

  const yearsSinceLastReview =
    lastStrategyReviewYear === null
      ? city.year
      : city.year - lastStrategyReviewYear;

  // 前回から4年以内は連続して出さない
  if (yearsSinceLastReview < 5) {
    return false;
  }

  // 10年以上見直しがなければ必ず出す
  if (yearsSinceLastReview >= 10) {
    return true;
  }

  const scores = calculateCityScores(city);

  // 総合評価が低いほど、方針転換論が出やすい
  let triggerProbability = 0.12;

  if (scores.overall < 55) {
    triggerProbability += 0.08;
  }

  if (scores.overall < 40) {
    triggerProbability += 0.1;
  }

  // 財政危機では別戦略への誘惑が強くなる
  if (scores.finance < 30) {
    triggerProbability += 0.08;
  }

  return random() < triggerProbability;
}

// 現在モデルに合う戦略見直しを選ぶ
export function selectStrategyReview(
  policies: Policy[],
  city: CityState,
  activeDevelopmentModel: DevelopmentModel,
  completedPolicyIds: string[],
  random: () => number = Math.random,
): StrategyPolicy | null {
  const selectedPolicy = selectNextPolicy({
    policies,
    city,
    category: "strategyReview",
    activeDevelopmentModel,
    completedPolicyIds,
    recentPolicyIds: [],
    random,
  });

  if (!selectedPolicy || selectedPolicy.type !== "strategy") {
    return null;
  }

  return selectedPolicy;
}

// ==================================================
// 戦略変更の判定
// ==================================================

// 選択肢IDから、新しい成長モデルを判定する
// nullの場合は現在モデルを維持する
export function getDevelopmentModelFromOption(
  optionId: string,
): DevelopmentModel | null {
  switch (optionId) {
    case "model-industry":
    case "switch-to-industry":
      return "industry";

    case "model-tourism":
    case "switch-to-tourism":
      return "tourism";

    case "model-living":
    case "switch-to-living":
      return "living";

    default:
      return null;
  }
}
