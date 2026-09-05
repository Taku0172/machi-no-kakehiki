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
// 元のcityは変更せず、新しいオブジェクトを返す
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

// 人口・都市基盤・混雑から年間維持費を計算する
function calculateMaintenanceCost(city: CityState): number {
  const basicCost = 1;
  const populationCost = city.population / 10000;
  const infrastructureCost = city.infrastructure * 0.03;
  const congestionCost = city.congestion * 0.01;

  return basicCost + populationCost + infrastructureCost + congestionCost;
}

// 財政赤字がある場合の利払い・資金調達負担
function calculateDebtServiceCost(city: CityState): number {
  if (city.budget >= 0) {
    return 0;
  }

  return Math.min(3, Math.abs(city.budget) * 0.01);
}

// 1年間の税収・維持費を計算する
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

// 財政状態によって発生する社会的な影響
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

// 通常政策を実施した年度の税収・維持費と
// 財政悪化による社会的影響を反映する
export function applyAnnualCityDynamics(city: CityState): {
  city: CityState;
  finance: AnnualFinanceReport;
} {
  const finance = calculateAnnualFinance(city);

  const cityAfterFinance = normalizeCityState({
    ...city,
    budget: city.budget + finance.balance,
  });

  const fiscalStressEffects = getFiscalStressEffects(cityAfterFinance.budget);

  const cityAfterFiscalStress = applyCityEffects(
    cityAfterFinance,
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

// 発展条件を満たしていれば次の段階へ進める
// 一度の政策で進めるのは一段階だけ
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

// 通常政策では、政策効果と年間財政を反映し、
// その後に年度を1年進める
export function executeRegularPolicy(
  city: CityState,
  effects: PolicyEffects,
): RegularPolicyExecutionResult {
  const previousStage = city.stage;

  // 政策そのものの効果
  const cityAfterPolicy = applyCityEffects(city, effects);

  // その年度の税収・維持費・財政ストレス
  const annualDynamics = applyAnnualCityDynamics(cityAfterPolicy);

  // 50年目の政策を実施した場合は
  // それ以上年度を増やさない
  const gameFinished = city.year >= GAME_DURATION_YEARS;

  const cityAfterYearAdvance: CityState = {
    ...annualDynamics.city,

    year: gameFinished ? GAME_DURATION_YEARS : city.year + 1,
  };

  // 政策実行後の数値と年度から
  // 次の発展段階へ進めるか判定する
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
