import {
    findPolicyById,
    validatePolicyCatalog,
} from "../src/data/policyCatalog";

import {
    createInitialGameState,
    executeNumericDecision,
    executeStrategyDecision,
    getCurrentPolicy,
} from "../src/engine/gameEngine";

import { calculateCityScores, getCityRank } from "../src/engine/scoreEngine";

import type {
    CityScores,
    CityState,
    GameState,
    NumericPolicy,
    StrategyPolicy,
} from "../src/types/game";

const SIMULATION_COUNT = 100;
const MAX_DECISIONS_PER_GAME = 100;

// ==================================================
// テスト用アサーション
// ==================================================

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`テスト失敗：${message}`);
  }
}

// ==================================================
// ランダムな意思決定
// ==================================================

function selectRandomStrategyOption(policy: StrategyPolicy): string {
  const index = Math.floor(Math.random() * policy.options.length);

  return policy.options[index].id;
}

function selectRandomNumericValue(policy: NumericPolicy): number {
  const stepCount = Math.floor((policy.max - policy.min) / policy.step);

  const selectedStep = Math.floor(Math.random() * (stepCount + 1));

  return policy.min + selectedStep * policy.step;
}

// ==================================================
// 街の数値検証
// ==================================================

function validateCityState(city: CityState): void {
  const numericValues = [
    city.year,
    city.population,
    city.budget,
    city.economy,
    city.infrastructure,
    city.happiness,
    city.trust,
    city.congestion,
    city.environment,
  ];

  numericValues.forEach((value) => {
    assert(Number.isFinite(value), `有限でない数値があります：${value}`);
  });

  assert(city.year >= 1 && city.year <= 50, `年度が範囲外です：${city.year}`);

  assert(city.population >= 0, `人口がマイナスです：${city.population}`);

  const boundedValues = [
    city.economy,
    city.infrastructure,
    city.happiness,
    city.trust,
    city.congestion,
    city.environment,
  ];

  boundedValues.forEach((value) => {
    assert(
      value >= 0 && value <= 100,
      `0〜100の範囲外の指標があります：${value}`,
    );
  });
}

// ==================================================
// 1ゲームを50年まで実行
// ==================================================

function simulateOneGame(): GameState {
  let state = createInitialGameState();
  let decisionCount = 0;

  while (!state.isFinished && decisionCount < MAX_DECISIONS_PER_GAME) {
    const policy = getCurrentPolicy(state);

    assert(policy !== null, `${state.city.year}年目で政策が見つかりません。`);

    if (!policy) {
      break;
    }

    if (policy.type === "strategy") {
      const optionId = selectRandomStrategyOption(policy);

      state = executeStrategyDecision(state, optionId);
    } else {
      const value = selectRandomNumericValue(policy);

      state = executeNumericDecision(state, value);
    }

    validateCityState(state.city);

    decisionCount += 1;
  }

  assert(
    state.isFinished,
    `${MAX_DECISIONS_PER_GAME}回以内にゲームが終了しませんでした。`,
  );

  assert(
    state.city.year === 50,
    `終了年度が50年目ではありません：${state.city.year}`,
  );

  assert(
    state.timeline.length === 51,
    `タイムラインが51件ではありません：${state.timeline.length}`,
  );

  const regularPolicyCount = state.history.filter((entry) => {
    const policy = findPolicyById(entry.policyId);

    return policy?.category === "regularPolicy";
  }).length;

  assert(
    regularPolicyCount === 50,
    `通常政策が50件ではありません：${regularPolicyCount}`,
  );

  const requiredStages = [
    "creation",
    "growth",
    "expansion",
    "maturity",
    "reorganization",
  ] as const;

  requiredStages.forEach((stage) => {
    assert(
      state.completedStageStrategies.includes(stage),
      `${stage}の発展段階戦略が実行されていません。`,
    );
  });

  assert(
    state.currentPolicyId === null,
    "ゲーム終了後も現在の政策が残っています。",
  );

  return state;
}

// ==================================================
// 集計用関数
// ==================================================

function calculateAverage(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function calculatePercentile(values: number[], percentile: number): number {
  if (values.length === 0) {
    return 0;
  }

  const sortedValues = [...values].sort((a, b) => a - b);

  const position = (sortedValues.length - 1) * percentile;

  const lowerIndex = Math.floor(position);

  const upperIndex = Math.ceil(position);

  const lowerValue = sortedValues[lowerIndex];

  const upperValue = sortedValues[upperIndex];

  if (lowerIndex === upperIndex) {
    return lowerValue;
  }

  const weight = position - lowerIndex;

  return lowerValue + (upperValue - lowerValue) * weight;
}

function getMinimum(values: number[]): number {
  return Math.min(...values);
}

function getMaximum(values: number[]): number {
  return Math.max(...values);
}

type SimulationSummary = {
  population: number;
  budget: number;
  scores: CityScores;
  historyCount: number;
  strategyDecisionCount: number;
  numericDecisionCount: number;
  strategySwitchCount: number;
};

// ==================================================
// 政策カタログ検証
// ==================================================

const catalogValidation = validatePolicyCatalog();

assert(
  catalogValidation.isValid,
  [
    "政策カタログが不正です。",
    ...catalogValidation.duplicateIds,
    ...catalogValidation.missingTitles,
    ...catalogValidation.warnings,
  ].join("\n"),
);

console.log(`政策カタログ：${catalogValidation.policyCount}件`);

// ==================================================
// 100回シミュレーション
// ==================================================

const finalStates: GameState[] = [];
const summaries: SimulationSummary[] = [];
const encounteredPolicyIds = new Set<string>();

for (let simulation = 1; simulation <= SIMULATION_COUNT; simulation += 1) {
  const finalState = simulateOneGame();

  finalStates.push(finalState);

  finalState.history.forEach((entry) => {
    encounteredPolicyIds.add(entry.policyId);
  });

  const strategyDecisionCount = finalState.history.filter(
    (entry) => entry.policyType === "strategy",
  ).length;

  const numericDecisionCount = finalState.history.filter(
    (entry) => entry.policyType === "numeric",
  ).length;

  summaries.push({
    population: finalState.city.population,

    budget: finalState.city.budget,

    scores: calculateCityScores(finalState.city),

    historyCount: finalState.history.length,

    strategyDecisionCount,

    numericDecisionCount,

    strategySwitchCount: finalState.strategySwitchCount,
  });

  if (simulation % 10 === 0) {
    console.log(`${simulation}/${SIMULATION_COUNT}回完了`);
  }
}

// ==================================================
// 基本集計
// ==================================================

const populations = summaries.map((summary) => summary.population);

const budgets = summaries.map((summary) => summary.budget);

const overallScores = summaries.map((summary) => summary.scores.overall);

const historyCounts = summaries.map((summary) => summary.historyCount);

const strategyDecisionCounts = summaries.map(
  (summary) => summary.strategyDecisionCount,
);

const numericDecisionCounts = summaries.map(
  (summary) => summary.numericDecisionCount,
);

const strategySwitchCounts = summaries.map(
  (summary) => summary.strategySwitchCount,
);

// ==================================================
// 分野別平均
// ==================================================

const averageTransport = calculateAverage(
  summaries.map((summary) => summary.scores.transport),
);

const averageIndustry = calculateAverage(
  summaries.map((summary) => summary.scores.industry),
);

const averageLiving = calculateAverage(
  summaries.map((summary) => summary.scores.living),
);

const averageEnvironment = calculateAverage(
  summaries.map((summary) => summary.scores.environment),
);

const averageFinance = calculateAverage(
  summaries.map((summary) => summary.scores.finance),
);

const averageTrust = calculateAverage(
  summaries.map((summary) => summary.scores.trust),
);

// ==================================================
// ランク分布
// ==================================================

const rankCounts = {
  S: 0,
  A: 0,
  B: 0,
  C: 0,
  D: 0,
};

summaries.forEach((summary) => {
  const rank = getCityRank(summary.scores.overall);

  rankCounts[rank] += 1;
});

const deficitGameCount = budgets.filter((budget) => budget < 0).length;

const severeDeficitGameCount = budgets.filter((budget) => budget <= -50).length;

// ==================================================
// 結果表示
// ==================================================

console.log("");
console.log("==============================");
console.log("自動プレイテスト成功");
console.log("==============================");

console.log(`実行回数：${SIMULATION_COUNT}回`);

console.log(
  `遭遇した政策：${encounteredPolicyIds.size}/${catalogValidation.policyCount}件`,
);

console.log("");
console.log("【最終人口】");

console.log(
  `平均：${Math.round(calculateAverage(populations)).toLocaleString()}人`,
);

console.log(`最小：${getMinimum(populations).toLocaleString()}人`);

console.log(`最大：${getMaximum(populations).toLocaleString()}人`);

console.log("");
console.log("【最終財政】");

console.log(`平均：${calculateAverage(budgets).toFixed(1)}億円`);

console.log(`最小：${getMinimum(budgets).toFixed(1)}億円`);

console.log(`最大：${getMaximum(budgets).toFixed(1)}億円`);

console.log(`赤字終了：${deficitGameCount}/${SIMULATION_COUNT}回`);

console.log(
  `50億円以上の赤字：${severeDeficitGameCount}/${SIMULATION_COUNT}回`,
);

console.log("");
console.log("【総合評価】");

console.log(`平均：${calculateAverage(overallScores).toFixed(1)}pt`);

console.log(`最小：${getMinimum(overallScores).toFixed(1)}pt`);

console.log(
  `10パーセンタイル：${calculatePercentile(overallScores, 0.1).toFixed(1)}pt`,
);

console.log(`中央値：${calculatePercentile(overallScores, 0.5).toFixed(1)}pt`);

console.log(
  `90パーセンタイル：${calculatePercentile(overallScores, 0.9).toFixed(1)}pt`,
);

console.log(`最大：${getMaximum(overallScores).toFixed(1)}pt`);

console.log("");
console.log("【ランク分布】");

console.log(`S：${rankCounts.S}回`);
console.log(`A：${rankCounts.A}回`);
console.log(`B：${rankCounts.B}回`);
console.log(`C：${rankCounts.C}回`);
console.log(`D：${rankCounts.D}回`);

console.log("");
console.log("【分野別平均】");

console.log(`交通：${averageTransport.toFixed(1)}pt`);

console.log(`産業：${averageIndustry.toFixed(1)}pt`);

console.log(`生活：${averageLiving.toFixed(1)}pt`);

console.log(`環境：${averageEnvironment.toFixed(1)}pt`);

console.log(`財政：${averageFinance.toFixed(1)}pt`);

console.log(`信頼：${averageTrust.toFixed(1)}pt`);

console.log("");
console.log("【意思決定】");

console.log(`平均総数：${calculateAverage(historyCounts).toFixed(1)}件`);

console.log(
  `平均戦略選択：${calculateAverage(strategyDecisionCounts).toFixed(1)}件`,
);

console.log(
  `平均数値選択：${calculateAverage(numericDecisionCounts).toFixed(1)}件`,
);

console.log(
  `平均戦略変更：${calculateAverage(strategySwitchCounts).toFixed(1)}回`,
);
