import type {
    CityMetric,
    CityScoreKey,
    CityState,
    Policy,
    PolicyCategory,
} from "../types/game";
import { calculateCityScores } from "./scoreEngine";

type PolicySelectionOptions = {
  policies: Policy[];
  city: CityState;
  category: PolicyCategory;
  completedPolicyIds?: string[];
  recentPolicyIds?: string[];
};

// 最低値として指定された条件を満たしているか確認する
function meetsMinimumMetrics(
  city: CityState,
  minimumMetrics: Partial<Record<CityMetric, number>> = {},
): boolean {
  return Object.entries(minimumMetrics).every(([key, value]) => {
    const metric = key as CityMetric;

    return city[metric] >= (value ?? 0);
  });
}

// 最高値として指定された条件を超えていないか確認する
function meetsMaximumMetrics(
  city: CityState,
  maximumMetrics: Partial<Record<CityMetric, number>> = {},
): boolean {
  return Object.entries(maximumMetrics).every(([key, value]) => {
    const metric = key as CityMetric;

    return city[metric] <= (value ?? 100);
  });
}

// 現在の街が政策の出現条件を満たしているか確認する
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

// 政策が現在の発展段階に対応しているか確認する
function matchesDevelopmentStage(policy: Policy, city: CityState): boolean {
  if (!policy.stages || policy.stages.length === 0) {
    return true;
  }

  return policy.stages.includes(city.stage);
}

// 政策カテゴリーが一致しているか確認する
// categoryがない既存政策は通常政策として扱う
function matchesCategory(policy: Policy, category: PolicyCategory): boolean {
  const policyCategory = policy.category ?? "regularPolicy";

  return policyCategory === category;
}

// 直近に出題され、クールダウン期間中か確認する
function isPolicyCoolingDown(
  policy: Policy,
  recentPolicyIds: string[],
): boolean {
  const cooldown = policy.cooldown ?? 5;

  if (cooldown <= 0) {
    return false;
  }

  const recentRange = recentPolicyIds.slice(-cooldown);

  return recentRange.includes(policy.id);
}

// 再出題不可の政策が既に実行済みか確認する
function isCompletedNonRepeatablePolicy(
  policy: Policy,
  completedPolicyIds: string[],
): boolean {
  const repeatable = policy.repeatable ?? true;

  return !repeatable && completedPolicyIds.includes(policy.id);
}

// 条件をすべて満たす政策だけを抽出する
export function getEligiblePolicies({
  policies,
  city,
  category,
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

// 政策分野と街評価の対応関係
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

    // 都市基盤の弱さは交通評価に反映される
    case "infrastructure":
      return "transport";

    default:
      return null;
  }
}

// 街の弱点に関係する政策ほど出やすくする
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

// 重みに基づいて政策候補から1つ選ぶ
function selectByWeight(policies: Policy[], city: CityState): Policy | null {
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

  let randomPosition = Math.random() * totalWeight;

  for (const item of weightedPolicies) {
    randomPosition -= item.weight;

    if (randomPosition <= 0) {
      return item.policy;
    }
  }

  return weightedPolicies[weightedPolicies.length - 1].policy;
}

// 現在の状況に合う次の政策を選択する
export function selectNextPolicy(
  options: PolicySelectionOptions,
): Policy | null {
  // 発展段階、出現条件、実行履歴、クールダウンを考慮
  const eligiblePolicies = getEligiblePolicies(options);

  if (eligiblePolicies.length > 0) {
    return selectByWeight(eligiblePolicies, options.city);
  }

  // 候補がなくなった場合はクールダウンだけ解除する
  const policiesWithoutCooldown = getEligiblePolicies({
    ...options,
    recentPolicyIds: [],
  });

  if (policiesWithoutCooldown.length > 0) {
    return selectByWeight(policiesWithoutCooldown, options.city);
  }

  // それでもなければ、同カテゴリー・同段階から選ぶ
  const stageFallbackPolicies = options.policies.filter(
    (policy) =>
      matchesCategory(policy, options.category) &&
      matchesDevelopmentStage(policy, options.city),
  );

  if (stageFallbackPolicies.length > 0) {
    return selectByWeight(stageFallbackPolicies, options.city);
  }

  // 最後に同じカテゴリーの全政策から選ぶ
  const categoryFallbackPolicies = options.policies.filter((policy) =>
    matchesCategory(policy, options.category),
  );

  return selectByWeight(categoryFallbackPolicies, options.city);
}
