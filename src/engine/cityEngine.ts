import { getNextStage } from "../data/stages";

import type {
    CityMetric,
    CityState,
    DevelopmentStage,
    PolicyEffects,
} from "../types/game";

// ゲームは50年目の通常政策を実行すると終了する
export const GAME_DURATION_YEARS = 50;

// 0〜100で管理する評価指標
const boundedMetrics: CityMetric[] = [
  "economy",
  "infrastructure",
  "happiness",
  "trust",
  "congestion",
  "environment",
];

// 数値を指定範囲に収める
function clamp(value: number, minimum: number, maximum: number): number {
  return Math.max(minimum, Math.min(maximum, value));
}

// 街の各数値を有効な範囲に整える
export function normalizeCityState(city: CityState): CityState {
  const normalizedCity = {
    ...city,

    year: clamp(Math.round(city.year), 1, GAME_DURATION_YEARS),

    population: Math.max(0, Math.round(city.population)),

    // 財政赤字はゲーム上の状態として残す
    budget: Math.round(city.budget),
  };

  boundedMetrics.forEach((metric) => {
    normalizedCity[metric] = clamp(Math.round(normalizedCity[metric]), 0, 100);
  });

  return normalizedCity;
}

// 政策効果を街へ反映する
export function applyCityEffects(
  city: CityState,
  effects: PolicyEffects,
): CityState {
  const updatedCity: CityState = {
    ...city,
  };

  Object.entries(effects).forEach(([key, value]) => {
    if (value === undefined) {
      return;
    }

    const metric = key as CityMetric;

    updatedCity[metric] += value;
  });

  return normalizeCityState(updatedCity);
}

// ==================================================
// 年間財政
// ==================================================

export type AnnualFinanceReport = {
  taxRevenue: number;
  maintenanceCost: number;
  debtServiceCost: number;
  balance: number;
};

// 人口と経済から税収を計算する
function calculateTaxRevenue(city: CityState): number {
  const basicRevenue = 2;

  const populationRevenue = city.population / 4000;

  const economyRevenue = city.economy * 0.05;

  return basicRevenue + populationRevenue + economyRevenue;
}

// 人口・都市基盤・混雑から維持費を計算する
function calculateMaintenanceCost(city: CityState): number {
  const basicCost = 1;

  const populationCost = city.population / 10000;

  const infrastructureCost = city.infrastructure * 0.03;

  const congestionCost = city.congestion * 0.01;

  return basicCost + populationCost + infrastructureCost + congestionCost;
}

// 赤字自治体に発生する利払い・資金調達負担
function calculateDebtServiceCost(city: CityState): number {
  if (city.budget >= 0) {
    return 0;
  }

  return Math.min(3, Math.abs(city.budget) * 0.01);
}

// 1年間の税収と支出を計算する
export function calculateAnnualFinance(city: CityState): AnnualFinanceReport {
  const taxRevenue = calculateTaxRevenue(city);

  const maintenanceCost = calculateMaintenanceCost(city);

  const debtServiceCost = calculateDebtServiceCost(city);

  const balance = Math.round(taxRevenue - maintenanceCost - debtServiceCost);

  return {
    taxRevenue: Math.round(taxRevenue * 10) / 10,

    maintenanceCost: Math.round(maintenanceCost * 10) / 10,

    debtServiceCost: Math.round(debtServiceCost * 10) / 10,

    balance,
  };
}

// ==================================================
// 都市発展による年間負荷
// ==================================================

// 成長した街では、何もしなくても問題が発生する。
// 高い指標ほど維持が難しくなり、政策による対処が必要になる。
export function getAnnualDevelopmentEffects(city: CityState): PolicyEffects {
  const effects: PolicyEffects = {};

  // 高成長を維持するには、継続的な産業政策が必要
  if (city.economy >= 85) {
    effects.economy = -2;
  } else if (city.economy >= 60) {
    effects.economy = -1;
  }

  // 道路・公共施設・上下水道などは毎年老朽化する
  if (city.infrastructure >= 85) {
    effects.infrastructure = -2;
  } else if (city.infrastructure >= 55) {
    effects.infrastructure = -1;
  }

  // 高い満足度を維持するほど住民の期待も高くなる
  if (city.happiness >= 80) {
    effects.happiness = -2;
  } else if (city.happiness >= 65) {
    effects.happiness = -1;
  }

  // 市政への信頼も、成果がなければ徐々に薄れる
  if (city.trust >= 80) {
    effects.trust = -2;
  } else if (city.trust >= 65) {
    effects.trust = -1;
  }

  // 人口と産業が増えるほど交通需要が増える
  let congestionChange = 0;

  if (city.population >= 9500) {
    congestionChange += 1;
  }

  if (city.economy >= 65) {
    congestionChange += 1;
  }

  // 十分な都市基盤があれば混雑増加を一部吸収できる
  if (city.infrastructure >= 75) {
    congestionChange -= 1;
  }

  if (congestionChange !== 0) {
    effects.congestion = congestionChange;
  }

  // 産業発展と人口集中は環境へ負荷を与える
  let environmentChange = 0;

  if (city.economy >= 60) {
    environmentChange -= 1;
  }

  if (city.population >= 11500) {
    environmentChange -= 1;
  }

  // 環境が大きく悪化した場合は、
  // 自然回復と社会的な対策圧力が働く
  if (city.environment <= 35) {
    environmentChange += 1;
  }

  if (environmentChange !== 0) {
    effects.environment = environmentChange;
  }

  return effects;
}

// ==================================================
// 財政悪化による影響
// ==================================================

function getFiscalStressEffects(budget: number): PolicyEffects {
  if (budget <= -100) {
    return {
      population: -100,
      economy: -3,
      infrastructure: -2,
      happiness: -5,
      trust: -6,
    };
  }

  if (budget <= -50) {
    return {
      population: -50,
      economy: -2,
      infrastructure: -1,
      happiness: -3,
      trust: -4,
    };
  }

  if (budget < 0) {
    return {
      happiness: -1,
      trust: -2,
    };
  }

  return {};
}

// ==================================================
// 年間変化の反映
// ==================================================

export function applyAnnualCityDynamics(city: CityState): {
  city: CityState;
  finance: AnnualFinanceReport;
} {
  // その年度の財政収支
  const finance = calculateAnnualFinance(city);

  const cityAfterFinance = normalizeCityState({
    ...city,
    budget: city.budget + finance.balance,
  });

  // 都市発展に伴う老朽化・混雑・環境負荷
  const developmentEffects = getAnnualDevelopmentEffects(cityAfterFinance);

  const cityAfterDevelopment = applyCityEffects(
    cityAfterFinance,
    developmentEffects,
  );

  // 財政赤字による社会的影響
  const fiscalStressEffects = getFiscalStressEffects(
    cityAfterDevelopment.budget,
  );

  const cityAfterFiscalStress = applyCityEffects(
    cityAfterDevelopment,
    fiscalStressEffects,
  );

  return {
    city: cityAfterFiscalStress,
    finance,
  };
}

// ==================================================
// 発展段階
// ==================================================

export function updateDevelopmentStage(city: CityState): CityState {
  const nextStage = getNextStage(city);

  if (!nextStage) {
    return city;
  }

  return {
    ...city,
    stage: nextStage,
  };
}

// ==================================================
// 通常政策
// ==================================================

export type RegularPolicyExecutionResult = {
  city: CityState;
  previousStage: DevelopmentStage;
  stageChanged: boolean;
  gameFinished: boolean;
  annualFinance: AnnualFinanceReport;
};

// 通常政策では、政策効果と年間変化を反映し、
// その後に年度を1年進める
export function executeRegularPolicy(
  city: CityState,
  effects: PolicyEffects,
): RegularPolicyExecutionResult {
  const previousStage = city.stage;

  // プレイヤーが選んだ政策の直接効果
  const cityAfterPolicy = applyCityEffects(city, effects);

  // 税収、維持費、老朽化、混雑などの年間変化
  const annualDynamics = applyAnnualCityDynamics(cityAfterPolicy);

  const gameFinished = city.year >= GAME_DURATION_YEARS;

  const cityAfterYearAdvance: CityState = {
    ...annualDynamics.city,

    year: gameFinished ? GAME_DURATION_YEARS : city.year + 1,
  };

  const updatedCity = updateDevelopmentStage(cityAfterYearAdvance);

  return {
    city: updatedCity,
    previousStage,
    stageChanged: previousStage !== updatedCity.stage,
    gameFinished,
    annualFinance: annualDynamics.finance,
  };
}

// 発展段階戦略と戦略見直しでは、
// 効果だけを反映して年度は進めない
export function executeAdditionalDecision(
  city: CityState,
  effects: PolicyEffects,
): CityState {
  return applyCityEffects(city, effects);
}

// 現在が最終年度か判定する
export function isFinalYear(city: CityState): boolean {
  return city.year >= GAME_DURATION_YEARS;
}
