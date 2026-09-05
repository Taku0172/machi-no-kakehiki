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
import { calculateCityScores } from "../src/engine/scoreEngine";

import type {
    CityState,
    GameState,
    NumericPolicy,
    StrategyPolicy,
} from "../src/types/game";

const SIMULATION_COUNT = 100;
const MAX_DECISIONS_PER_GAME = 100;

// ==================================================
// 簡易アサーション
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
// 街の数値検査
// ==================================================

function validateCityState(city: CityState): void {
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

  // 初期値1件＋通常政策50年分
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

  assert(
    state.completedStageStrategies.includes("creation"),
    "創生期の戦略課題が実行されていません。",
  );

  assert(
    state.completedStageStrategies.includes("growth"),
    "成長期の戦略課題が実行されていません。",
  );

  assert(
    state.completedStageStrategies.includes("expansion"),
    "拡大期の戦略課題が実行されていません。",
  );

  assert(
    state.completedStageStrategies.includes("maturity"),
    "成熟期の戦略課題が実行されていません。",
  );

  assert(
    state.completedStageStrategies.includes("reorganization"),
    "再編期の戦略課題が実行されていません。",
  );

  assert(state.currentPolicyId === null, "終了後も現在の政策が残っています。");

  return state;
}

// ==================================================
// 政策カタログ検査
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

for (let simulation = 1; simulation <= SIMULATION_COUNT; simulation += 1) {
  const finalState = simulateOneGame();

  finalStates.push(finalState);

  if (simulation % 10 === 0) {
    console.log(`${simulation}/${SIMULATION_COUNT}回完了`);
  }
}

// ==================================================
// 結果集計
// ==================================================

const averagePopulation =
  finalStates.reduce((sum, state) => sum + state.city.population, 0) /
  finalStates.length;

const averageBudget =
  finalStates.reduce((sum, state) => sum + state.city.budget, 0) /
  finalStates.length;

const averageOverallScore =
  finalStates.reduce(
    (sum, state) => sum + calculateCityScores(state.city).overall,
    0,
  ) / finalStates.length;

const averageHistoryCount =
  finalStates.reduce((sum, state) => sum + state.history.length, 0) /
  finalStates.length;

const averageStrategySwitchCount =
  finalStates.reduce((sum, state) => sum + state.strategySwitchCount, 0) /
  finalStates.length;

console.log("");
console.log("==============================");
console.log("自動プレイテスト成功");
console.log("==============================");
console.log(`実行回数：${SIMULATION_COUNT}回`);
console.log(
  `平均最終人口：${Math.round(averagePopulation).toLocaleString()}人`,
);
console.log(`平均最終財政：${averageBudget.toFixed(1)}億円`);
console.log(`平均総合評価：${averageOverallScore.toFixed(1)}pt`);
console.log(`平均意思決定数：${averageHistoryCount.toFixed(1)}件`);
console.log(`平均戦略変更数：${averageStrategySwitchCount.toFixed(1)}回`);
