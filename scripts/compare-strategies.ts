import {
    createInitialGameState,
    executeNumericDecision,
    executeStrategyDecision,
    getCurrentPolicy,
} from "../src/engine/gameEngine";

import { calculateCityScores, getCityRank } from "../src/engine/scoreEngine";

import type {
    CityMetric,
    CityScores,
    CityState,
    GameState,
    NumericPolicy,
    PolicyEffects,
    StrategyPolicy,
} from "../src/types/game";

const SIMULATIONS_PER_PROFILE = 100;
const MAX_DECISIONS_PER_GAME = 100;

type PlayerProfileId =
  | "random"
  | "industry"
  | "living"
  | "environment"
  | "finance"
  | "balanced";

type PlayerProfile = {
  id: PlayerProfileId;
  name: string;
  description: string;
  weights: Record<CityMetric, number>;
};

type SimulationResult = {
  state: GameState;
  scores: CityScores;
};

type ProfileSummary = {
  profile: PlayerProfile;
  averagePopulation: number;
  averageBudget: number;
  averageScores: CityScores;
  averageStrategySwitches: number;
  deficitCount: number;
  rankCounts: Record<"S" | "A" | "B" | "C" | "D", number>;
};

// ==================================================
// 市長タイプ
// ==================================================

const playerProfiles: PlayerProfile[] = [
  {
    id: "random",
    name: "ランダム型",
    description: "戦略と数値を無作為に選択する比較基準",
    weights: {
      population: 1,
      budget: 1,
      economy: 1,
      infrastructure: 1,
      happiness: 1,
      trust: 1,
      congestion: 1,
      environment: 1,
    },
  },

  {
    id: "industry",
    name: "産業優先型",
    description: "人口・経済・都市基盤の成長を優先",
    weights: {
      population: 1.2,
      budget: 0.7,
      economy: 3,
      infrastructure: 2,
      happiness: 0.3,
      trust: 0.5,
      congestion: 0.4,
      environment: 0.2,
    },
  },

  {
    id: "living",
    name: "生活優先型",
    description: "満足度・信頼・交通環境を優先",
    weights: {
      population: 0.4,
      budget: 0.6,
      economy: 0.4,
      infrastructure: 1.2,
      happiness: 3,
      trust: 1.8,
      congestion: 2,
      environment: 1.5,
    },
  },

  {
    id: "environment",
    name: "環境優先型",
    description: "環境保全と混雑抑制を優先",
    weights: {
      population: 0.1,
      budget: 0.5,
      economy: 0.2,
      infrastructure: 0.7,
      happiness: 1,
      trust: 1,
      congestion: 2.2,
      environment: 3.5,
    },
  },

  {
    id: "finance",
    name: "財政優先型",
    description: "財政余力と安定した税収を優先",
    weights: {
      population: 0.4,
      budget: 3.5,
      economy: 1.2,
      infrastructure: 0.4,
      happiness: 0.3,
      trust: 0.7,
      congestion: 0.2,
      environment: 0.2,
    },
  },

  {
    id: "balanced",
    name: "バランス型",
    description: "街の弱い分野を優先的に補う",
    weights: {
      population: 0.5,
      budget: 1,
      economy: 1,
      infrastructure: 1,
      happiness: 1,
      trust: 1,
      congestion: 1,
      environment: 1,
    },
  },
];

// ==================================================
// 効果の評価
// ==================================================

// 人口は数百人単位で変化するため、
// 他の0〜100指標と比較できる単位へ変換する。
// 混雑だけは減少が良い効果なので符号を反転する。
function normalizeEffect(metric: CityMetric, value: number): number {
  if (metric === "population") {
    return value / 100;
  }

  if (metric === "congestion") {
    return -value;
  }

  return value;
}

// バランス型では、現在低い指標ほど
// 改善効果を高く評価する。
function getBalanceUrgency(metric: CityMetric, city: CityState): number {
  if (metric === "population") {
    return 1;
  }

  if (metric === "budget") {
    if (city.budget < 0) {
      return 2.5;
    }

    if (city.budget < 30) {
      return 1.7;
    }

    return 1;
  }

  if (metric === "congestion") {
    return 1 + city.congestion / 100;
  }

  const currentValue = city[metric];

  return 1 + (100 - currentValue) / 100;
}

function calculateEffectUtility(
  effects: PolicyEffects,
  profile: PlayerProfile,
  city: CityState,
): number {
  let utility = 0;

  Object.entries(effects).forEach(([key, value]) => {
    if (value === undefined) {
      return;
    }

    const metric = key as CityMetric;

    const normalizedValue = normalizeEffect(metric, value);

    const profileWeight = profile.weights[metric];

    const urgency =
      profile.id === "balanced" ? getBalanceUrgency(metric, city) : 1;

    utility += normalizedValue * profileWeight * urgency;
  });

  return utility;
}

// 同点の候補が複数ある場合は、
// 毎回同じゲームにならないよう無作為に選ぶ。
function selectOneOfBest<T>(
  candidates: {
    item: T;
    utility: number;
  }[],
): T {
  const highestUtility = Math.max(
    ...candidates.map((candidate) => candidate.utility),
  );

  const bestCandidates = candidates.filter(
    (candidate) => Math.abs(candidate.utility - highestUtility) < 0.0001,
  );

  const selectedIndex = Math.floor(Math.random() * bestCandidates.length);

  return bestCandidates[selectedIndex].item;
}

// ==================================================
// 戦略政策の選択
// ==================================================

function selectStrategyOption(
  policy: StrategyPolicy,
  profile: PlayerProfile,
  city: CityState,
): string {
  if (profile.id === "random") {
    const index = Math.floor(Math.random() * policy.options.length);

    return policy.options[index].id;
  }

  const candidates = policy.options.map((option) => {
    const result = policy.calculateResult?.(option, city);

    const effects = result?.effects ?? option.effects;

    return {
      item: option.id,
      utility: calculateEffectUtility(effects, profile, city),
    };
  });

  return selectOneOfBest(candidates);
}

// ==================================================
// 数値政策の選択
// ==================================================

function createNumericCandidates(policy: NumericPolicy): number[] {
  const values: number[] = [];

  const stepCount = Math.floor((policy.max - policy.min) / policy.step);

  for (let index = 0; index <= stepCount; index += 1) {
    const value = policy.min + index * policy.step;

    values.push(Math.round(value * 1000) / 1000);
  }

  return values;
}

function selectNumericValue(
  policy: NumericPolicy,
  profile: PlayerProfile,
  city: CityState,
): number {
  const values = createNumericCandidates(policy);

  if (profile.id === "random") {
    const index = Math.floor(Math.random() * values.length);

    return values[index];
  }

  const candidates = values.map((value) => {
    const result = policy.calculateResult(value, city);

    return {
      item: value,
      utility: calculateEffectUtility(result.effects, profile, city),
    };
  });

  return selectOneOfBest(candidates);
}

// ==================================================
// 1ゲームの実行
// ==================================================

function simulateOneGame(profile: PlayerProfile): SimulationResult {
  let state = createInitialGameState();
  let decisionCount = 0;

  while (!state.isFinished && decisionCount < MAX_DECISIONS_PER_GAME) {
    const policy = getCurrentPolicy(state);

    if (!policy) {
      throw new Error(
        `${profile.name}の${state.city.year}年目で政策が見つかりません。`,
      );
    }

    if (policy.type === "strategy") {
      const optionId = selectStrategyOption(policy, profile, state.city);

      state = executeStrategyDecision(state, optionId);
    } else {
      const value = selectNumericValue(policy, profile, state.city);

      state = executeNumericDecision(state, value);
    }

    decisionCount += 1;
  }

  if (!state.isFinished) {
    throw new Error(
      `${profile.name}が${MAX_DECISIONS_PER_GAME}回以内に終了しませんでした。`,
    );
  }

  return {
    state,
    scores: calculateCityScores(state.city),
  };
}

// ==================================================
// 集計
// ==================================================

function average(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function summarizeProfile(
  profile: PlayerProfile,
  results: SimulationResult[],
): ProfileSummary {
  const rankCounts = {
    S: 0,
    A: 0,
    B: 0,
    C: 0,
    D: 0,
  };

  results.forEach((result) => {
    const rank = getCityRank(result.scores.overall);

    rankCounts[rank] += 1;
  });

  const averageScores: CityScores = {
    overall: average(results.map((result) => result.scores.overall)),

    transport: average(results.map((result) => result.scores.transport)),

    industry: average(results.map((result) => result.scores.industry)),

    living: average(results.map((result) => result.scores.living)),

    environment: average(results.map((result) => result.scores.environment)),

    finance: average(results.map((result) => result.scores.finance)),

    trust: average(results.map((result) => result.scores.trust)),
  };

  return {
    profile,

    averagePopulation: average(
      results.map((result) => result.state.city.population),
    ),

    averageBudget: average(results.map((result) => result.state.city.budget)),

    averageScores,

    averageStrategySwitches: average(
      results.map((result) => result.state.strategySwitchCount),
    ),

    deficitCount: results.filter((result) => result.state.city.budget < 0)
      .length,

    rankCounts,
  };
}

// ==================================================
// 全タイプを比較
// ==================================================

const summaries: ProfileSummary[] = [];

console.log("==============================");
console.log("市長タイプ別シミュレーション");
console.log("==============================");
console.log(`各タイプ：${SIMULATIONS_PER_PROFILE}回`);
console.log("");

playerProfiles.forEach((profile) => {
  const results: SimulationResult[] = [];

  for (
    let simulation = 0;
    simulation < SIMULATIONS_PER_PROFILE;
    simulation += 1
  ) {
    results.push(simulateOneGame(profile));
  }

  summaries.push(summarizeProfile(profile, results));

  console.log(`${profile.name}：完了`);
});

// ==================================================
// 比較結果
// ==================================================

console.log("");
console.log("==============================");
console.log("戦略別比較結果");
console.log("==============================");

summaries.forEach((summary) => {
  const scores = summary.averageScores;

  console.log("");
  console.log(`【${summary.profile.name}】`);

  console.log(summary.profile.description);

  console.log(`総合：${scores.overall.toFixed(1)}pt`);

  console.log(
    `人口：${Math.round(summary.averagePopulation).toLocaleString()}人`,
  );

  console.log(`財政残高：${summary.averageBudget.toFixed(1)}億円`);

  console.log(
    `交通：${scores.transport.toFixed(1)} / ` +
      `産業：${scores.industry.toFixed(1)} / ` +
      `生活：${scores.living.toFixed(1)}`,
  );

  console.log(
    `環境：${scores.environment.toFixed(1)} / ` +
      `財政：${scores.finance.toFixed(1)} / ` +
      `信頼：${scores.trust.toFixed(1)}`,
  );

  console.log(`赤字終了：${summary.deficitCount}/${SIMULATIONS_PER_PROFILE}回`);

  console.log(
    `ランク S:${summary.rankCounts.S} ` +
      `A:${summary.rankCounts.A} ` +
      `B:${summary.rankCounts.B} ` +
      `C:${summary.rankCounts.C} ` +
      `D:${summary.rankCounts.D}`,
  );

  console.log(`平均戦略変更：${summary.averageStrategySwitches.toFixed(1)}回`);
});
