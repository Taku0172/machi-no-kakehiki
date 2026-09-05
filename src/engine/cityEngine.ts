import { getNextStage } from "../data/stages";
import type {
    CityMetric,
    CityState,
    DevelopmentStage,
    PolicyEffects,
} from "../types/game";

// ゲームは50年目の政策を実行すると終了する
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

// 発展条件を満たしていれば、次の段階へ進める
// 一度の政策で進むのは一段階だけ
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

// 通常の政策課題を実行した結果
export type RegularPolicyExecutionResult = {
  city: CityState;
  previousStage: DevelopmentStage;
  stageChanged: boolean;
  gameFinished: boolean;
};

// 通常の政策を実行する
// 通常政策では政策効果を反映し、年度を1年進める
export function executeRegularPolicy(
  city: CityState,
  effects: PolicyEffects,
): RegularPolicyExecutionResult {
  const previousStage = city.stage;

  // まず政策効果を反映する
  const cityAfterEffects = applyCityEffects(city, effects);

  // 50年目の政策を実行した場合は年度を増やさない
  const gameFinished = city.year >= GAME_DURATION_YEARS;

  const cityAfterYearAdvance: CityState = {
    ...cityAfterEffects,
    year: gameFinished ? GAME_DURATION_YEARS : city.year + 1,
  };

  // 政策実行後の数値と年度から発展段階を判定する
  const updatedCity = updateDevelopmentStage(cityAfterYearAdvance);

  return {
    city: updatedCity,
    previousStage,
    stageChanged: previousStage !== updatedCity.stage,
    gameFinished,
  };
}

// 発展段階の戦略課題や戦略見直しを実行する
// 効果は反映するが、年度は進めない
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
