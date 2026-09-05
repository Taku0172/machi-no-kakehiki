import { getNextStage } from "../data/stages";

import type {
    CityMetric,
    CityState,
    DevelopmentModel,
    DevelopmentStage,
    PolicyEffects,
} from "../types/game";

export const GAME_DURATION_YEARS = 50;

const boundedMetrics: CityMetric[] = [
  "economy",
  "infrastructure",
  "happiness",
  "trust",
  "congestion",
  "environment",
];

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.max(minimum, Math.min(maximum, value));
}

export function normalizeCityState(city: CityState): CityState {
  const normalizedCity = {
    ...city,

    year: clamp(Math.round(city.year), 1, GAME_DURATION_YEARS),

    population: Math.max(0, Math.round(city.population)),

    budget: Math.round(city.budget),
  };

  boundedMetrics.forEach((metric) => {
    normalizedCity[metric] = clamp(Math.round(normalizedCity[metric]), 0, 100);
  });

  return normalizedCity;
}

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
  developmentModel: DevelopmentModel;
  baseRevenue: number;
  modelRevenue: number;
  taxRevenue: number;
  maintenanceCost: number;
  debtServiceCost: number;
  balance: number;
};

// 地方交付・固定資産・共通住民税などの基礎収入
function calculateBaseRevenue(city: CityState): number {
  const basicGrant = 2;

  const commonPopulationRevenue = city.population / 6500;

  return basicGrant + commonPopulationRevenue;
}

// 発展モデル固有の収入
function calculateModelRevenue(
  city: CityState,
  developmentModel: DevelopmentModel,
): number {
  if (developmentModel === "industry") {
    // 法人税、雇用、工業用地による収入
    const corporateRevenue = city.economy * 0.055;

    const industrialInfrastructureRevenue = city.infrastructure * 0.01;

    return corporateRevenue + industrialInfrastructureRevenue;
  }

  if (developmentModel === "tourism") {
    // 観光消費、宿泊、地域ブランドによる収入
    const environmentalTourismRevenue = city.environment * 0.04;

    const visitorSatisfactionRevenue = city.happiness * 0.03;

    const tourismInfrastructureRevenue = city.infrastructure * 0.005;

    return (
      environmentalTourismRevenue +
      visitorSatisfactionRevenue +
      tourismInfrastructureRevenue
    );
  }

  // 生活都市型
  // 定住人口、満足度、行政への信頼による収入
  const settlementRevenue = city.population / 11000;

  const residentSatisfactionRevenue = city.happiness * 0.025;

  const trustRevenue = city.trust * 0.025;

  const livingInfrastructureRevenue = city.infrastructure * 0.008;

  return (
    settlementRevenue +
    residentSatisfactionRevenue +
    trustRevenue +
    livingInfrastructureRevenue
  );
}

function calculateMaintenanceCost(city: CityState): number {
  const basicCost = 1;

  const populationCost = city.population / 10000;

  const infrastructureCost = city.infrastructure * 0.03;

  const congestionCost = city.congestion * 0.01;

  return basicCost + populationCost + infrastructureCost + congestionCost;
}

function calculateDebtServiceCost(city: CityState): number {
  if (city.budget >= 0) {
    return 0;
  }

  return Math.min(3, Math.abs(city.budget) * 0.01);
}

export function calculateAnnualFinance(
  city: CityState,
  developmentModel: DevelopmentModel = "industry",
): AnnualFinanceReport {
  const baseRevenue = calculateBaseRevenue(city);

  const modelRevenue = calculateModelRevenue(city, developmentModel);

  const taxRevenue = baseRevenue + modelRevenue;

  const maintenanceCost = calculateMaintenanceCost(city);

  const debtServiceCost = calculateDebtServiceCost(city);

  const balance = Math.round(taxRevenue - maintenanceCost - debtServiceCost);

  return {
    developmentModel,

    baseRevenue: Math.round(baseRevenue * 10) / 10,

    modelRevenue: Math.round(modelRevenue * 10) / 10,

    taxRevenue: Math.round(taxRevenue * 10) / 10,

    maintenanceCost: Math.round(maintenanceCost * 10) / 10,

    debtServiceCost: Math.round(debtServiceCost * 10) / 10,

    balance,
  };
}

// ==================================================
// 都市発展による年間負荷
// ==================================================

export function getAnnualDevelopmentEffects(city: CityState): PolicyEffects {
  const effects: PolicyEffects = {};

  // 成長率の維持には継続的な産業政策が必要
  if (city.economy >= 85) {
    effects.economy = -2;
  } else if (city.economy >= 60) {
    effects.economy = -1;
  }

  // 都市基盤は毎年少しずつ老朽化する
  if (city.infrastructure >= 85) {
    effects.infrastructure = -2;
  } else if (city.infrastructure >= 55) {
    effects.infrastructure = -1;
  }

  // 高い満足度ほど住民の期待も上がる
  if (city.happiness >= 80) {
    effects.happiness = -2;
  } else if (city.happiness >= 65) {
    effects.happiness = -1;
  }

  // 市政への信頼も成果がなければ薄れる
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

  if (city.infrastructure >= 75) {
    congestionChange -= 1;
  }

  if (congestionChange !== 0) {
    effects.congestion = congestionChange;
  }

  // 産業発展と人口集中は環境負荷を生む
  let environmentChange = 0;

  if (city.economy >= 60) {
    environmentChange -= 1;
  }

  if (city.population >= 11500) {
    environmentChange -= 1;
  }

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
// 年間変化
// ==================================================

export function applyAnnualCityDynamics(
  city: CityState,
  developmentModel: DevelopmentModel = "industry",
): {
  city: CityState;
  finance: AnnualFinanceReport;
} {
  const finance = calculateAnnualFinance(city, developmentModel);

  const cityAfterFinance = normalizeCityState({
    ...city,

    budget: city.budget + finance.balance,
  });

  const developmentEffects = getAnnualDevelopmentEffects(cityAfterFinance);

  const cityAfterDevelopment = applyCityEffects(
    cityAfterFinance,
    developmentEffects,
  );

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

export function executeRegularPolicy(
  city: CityState,
  effects: PolicyEffects,
  developmentModel: DevelopmentModel = "industry",
): RegularPolicyExecutionResult {
  const previousStage = city.stage;

  const cityAfterPolicy = applyCityEffects(city, effects);

  const annualDynamics = applyAnnualCityDynamics(
    cityAfterPolicy,
    developmentModel,
  );

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

// 発展段階戦略と戦略見直しでは年度を進めない
export function executeAdditionalDecision(
  city: CityState,
  effects: PolicyEffects,
): CityState {
  return applyCityEffects(city, effects);
}

export function isFinalYear(city: CityState): boolean {
  return city.year >= GAME_DURATION_YEARS;
}
