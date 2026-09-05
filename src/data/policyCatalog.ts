import { creationPolicies } from "./policies/creationPolicies";
import { expansionPolicies } from "./policies/expansionPolicies";
import { growthPolicies } from "./policies/growthPolicies";
import { maturityPolicies } from "./policies/maturityPolicies";
import { reorganizationPolicies } from "./policies/reorganizationPolicies";
import { stageStrategyPolicies } from "./policies/stageStrategyPolicies";
import { strategyReviewPolicies } from "./policies/strategyReviewPolicies";

import type {
    DevelopmentModel,
    DevelopmentStage,
    Policy,
    PolicyCategory,
    PolicyDomain,
    StrategyPolicy,
} from "../types/game";

// ==================================================
// 政策グループ
// ==================================================

// 通常政策80件
export const regularPolicyCatalog: Policy[] = [
  ...creationPolicies,
  ...growthPolicies,
  ...expansionPolicies,
  ...maturityPolicies,
  ...reorganizationPolicies,
];

// 発展段階の戦略課題5件
export const stageStrategyPolicyCatalog: StrategyPolicy[] = [
  ...stageStrategyPolicies,
];

// 戦略見直し・FOMOイベント15件
export const strategyReviewPolicyCatalog: StrategyPolicy[] = [
  ...strategyReviewPolicies,
];

// ゲーム内で使用する政策100件
export const allPolicies: Policy[] = [
  ...regularPolicyCatalog,
  ...stageStrategyPolicyCatalog,
  ...strategyReviewPolicyCatalog,
];

// ==================================================
// 政策の検索
// ==================================================

// 政策IDから政策を取得する
export function findPolicyById(policyId: string): Policy | null {
  return allPolicies.find((policy) => policy.id === policyId) ?? null;
}

// 指定した政策一覧からID検索する
export function findPolicyInCatalog(
  policies: Policy[],
  policyId: string,
): Policy | null {
  return policies.find((policy) => policy.id === policyId) ?? null;
}

// 政策カテゴリーで絞り込む
export function getPoliciesByCategory(category: PolicyCategory): Policy[] {
  return allPolicies.filter((policy) => {
    const policyCategory = policy.category ?? "regularPolicy";

    return policyCategory === category;
  });
}

// 発展段階で通常政策を絞り込む
export function getRegularPoliciesByStage(stage: DevelopmentStage): Policy[] {
  return regularPolicyCatalog.filter((policy) => {
    if (!policy.stages || policy.stages.length === 0) {
      return true;
    }

    return policy.stages.includes(stage);
  });
}

// 政策分野で絞り込む
export function getPoliciesByDomain(domain: PolicyDomain): Policy[] {
  return allPolicies.filter((policy) => policy.domain === domain);
}

// 発展段階に対応する戦略課題を取得する
export function getStageStrategyPolicy(
  stage: DevelopmentStage,
): StrategyPolicy | null {
  return (
    stageStrategyPolicyCatalog.find((policy) =>
      policy.stages?.includes(stage),
    ) ?? null
  );
}

// 現在の成長モデルに対応する見直しイベントを取得する
export function getStrategyReviewsForModel(
  model: DevelopmentModel,
): StrategyPolicy[] {
  const requiredTag = `current-${model}`;

  return strategyReviewPolicyCatalog.filter((policy) =>
    policy.tags?.includes(requiredTag),
  );
}

// ==================================================
// カタログ検査
// ==================================================

export type PolicyCatalogValidation = {
  isValid: boolean;
  policyCount: number;
  duplicateIds: string[];
  missingTitles: string[];
  warnings: string[];
};

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

// タイトルが空の政策を検出する
function findPoliciesWithoutTitles(policies: Policy[]): string[] {
  return policies
    .filter((policy) => policy.title.trim().length === 0)
    .map((policy) => policy.id);
}

// カタログ全体を検査する
export function validatePolicyCatalog(
  policies: Policy[] = allPolicies,
): PolicyCatalogValidation {
  const duplicateIds = findDuplicateIds(policies);
  const missingTitles = findPoliciesWithoutTitles(policies);
  const warnings: string[] = [];

  const regularCount = policies.filter(
    (policy) => (policy.category ?? "regularPolicy") === "regularPolicy",
  ).length;

  const stageStrategyCount = policies.filter(
    (policy) => policy.category === "stageStrategy",
  ).length;

  const strategyReviewCount = policies.filter(
    (policy) => policy.category === "strategyReview",
  ).length;

  if (policies.length < 100) {
    warnings.push(
      `政策数は${policies.length}件です。目標の100件に達していません。`,
    );
  }

  if (regularCount < 80) {
    warnings.push(`通常政策は${regularCount}件です。80件必要です。`);
  }

  if (stageStrategyCount < 5) {
    warnings.push(
      `発展段階の戦略課題は${stageStrategyCount}件です。5件必要です。`,
    );
  }

  if (strategyReviewCount < 15) {
    warnings.push(
      `戦略見直しイベントは${strategyReviewCount}件です。15件必要です。`,
    );
  }

  return {
    isValid:
      policies.length >= 100 &&
      duplicateIds.length === 0 &&
      missingTitles.length === 0,
    policyCount: policies.length,
    duplicateIds,
    missingTitles,
    warnings,
  };
}

// ==================================================
// 開発用の集計
// ==================================================

export function getPolicyCatalogSummary(): {
  total: number;
  regularPolicies: number;
  stageStrategies: number;
  strategyReviews: number;
  numericPolicies: number;
  choicePolicies: number;
} {
  return {
    total: allPolicies.length,

    regularPolicies: regularPolicyCatalog.length,

    stageStrategies: stageStrategyPolicyCatalog.length,

    strategyReviews: strategyReviewPolicyCatalog.length,

    numericPolicies: allPolicies.filter((policy) => policy.type === "numeric")
      .length,

    choicePolicies: allPolicies.filter((policy) => policy.type === "strategy")
      .length,
  };
}
