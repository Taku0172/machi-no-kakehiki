import type {
    DevelopmentStage,
    Policy,
    PolicyCategory,
    PolicyDomain,
} from "../types/game";

// 政策カタログの検査結果
export type PolicyCatalogValidation = {
  isValid: boolean;
  policyCount: number;
  duplicateIds: string[];
  missingTitles: string[];
  warnings: string[];
};

// 複数の政策配列を1つのカタログへまとめる
export function createPolicyCatalog(...policyGroups: Policy[][]): Policy[] {
  return policyGroups.flat();
}

// 政策IDから政策を取得する
export function findPolicyById(
  policies: Policy[],
  policyId: string,
): Policy | null {
  return policies.find((policy) => policy.id === policyId) ?? null;
}

// 政策カテゴリーで絞り込む
export function getPoliciesByCategory(
  policies: Policy[],
  category: PolicyCategory,
): Policy[] {
  return policies.filter((policy) => {
    // category未設定の既存政策は通常政策として扱う
    const policyCategory = policy.category ?? "regularPolicy";

    return policyCategory === category;
  });
}

// 発展段階で政策を絞り込む
export function getPoliciesByStage(
  policies: Policy[],
  stage: DevelopmentStage,
): Policy[] {
  return policies.filter((policy) => {
    // stages未設定の政策は全段階で出現可能
    if (!policy.stages || policy.stages.length === 0) {
      return true;
    }

    return policy.stages.includes(stage);
  });
}

// 政策分野で絞り込む
export function getPoliciesByDomain(
  policies: Policy[],
  domain: PolicyDomain,
): Policy[] {
  return policies.filter((policy) => policy.domain === domain);
}

// 同じIDを持つ政策を検出する
function findDuplicateIds(policies: Policy[]): string[] {
  const seenIds = new Set<string>();
  const duplicateIds = new Set<string>();

  policies.forEach((policy) => {
    if (seenIds.has(policy.id)) {
      duplicateIds.add(policy.id);
    }

    seenIds.add(policy.id);
  });

  return Array.from(duplicateIds);
}

// タイトルが空になっている政策を検出する
function findPoliciesWithoutTitles(policies: Policy[]): string[] {
  return policies
    .filter((policy) => policy.title.trim().length === 0)
    .map((policy) => policy.id);
}

// カタログ全体を検査する
export function validatePolicyCatalog(
  policies: Policy[],
): PolicyCatalogValidation {
  const duplicateIds = findDuplicateIds(policies);
  const missingTitles = findPoliciesWithoutTitles(policies);
  const warnings: string[] = [];

  if (policies.length < 100) {
    warnings.push(
      `政策数は現在${policies.length}件です。完成目標は100件以上です。`,
    );
  }

  const stageStrategyCount = getPoliciesByCategory(
    policies,
    "stageStrategy",
  ).length;

  const regularPolicyCount = getPoliciesByCategory(
    policies,
    "regularPolicy",
  ).length;

  const strategyReviewCount = getPoliciesByCategory(
    policies,
    "strategyReview",
  ).length;

  if (stageStrategyCount < 5) {
    warnings.push("発展段階ごとの戦略課題が5件未満です。");
  }

  if (regularPolicyCount < 80) {
    warnings.push("通常の政策課題が80件未満です。");
  }

  if (strategyReviewCount < 10) {
    warnings.push("戦略見直しイベントが10件未満です。");
  }

  return {
    isValid: duplicateIds.length === 0 && missingTitles.length === 0,
    policyCount: policies.length,
    duplicateIds,
    missingTitles,
    warnings,
  };
}

// 開発中にカタログの内訳を確認する
export function getPolicyCatalogSummary(policies: Policy[]): {
  total: number;
  stageStrategies: number;
  regularPolicies: number;
  strategyReviews: number;
  numericPolicies: number;
  choicePolicies: number;
} {
  return {
    total: policies.length,

    stageStrategies: getPoliciesByCategory(policies, "stageStrategy").length,

    regularPolicies: getPoliciesByCategory(policies, "regularPolicy").length,

    strategyReviews: getPoliciesByCategory(policies, "strategyReview").length,

    numericPolicies: policies.filter((policy) => policy.type === "numeric")
      .length,

    choicePolicies: policies.filter((policy) => policy.type === "strategy")
      .length,
  };
}
