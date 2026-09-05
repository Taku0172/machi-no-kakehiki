import type { CityState, DevelopmentStage } from "../types/game";

// 発展段階ごとの設定
export type StageDefinition = {
  id: DevelopmentStage;
  order: number;
  name: string;
  shortName: string;
  description: string;
  mainChallenge: string;
  accentColor: string;
  nextStage: DevelopmentStage | null;
  advanceConditionText: string | null;
  canAdvance: (city: CityState) => boolean;
};

// 街の発展段階一覧
export const stageDefinitions: StageDefinition[] = [
  {
    id: "creation",
    order: 1,
    name: "創生期",
    shortName: "創生",
    description: "街を動かすための財源と合意をつくる段階",
    mainChallenge: "発展費用を誰が負担するのか",
    accentColor: "#D99A37",
    nextStage: "growth",
    advanceConditionText: "人口9,000人・経済30pt以上、または8年目への到達",
    canAdvance: (city) =>
      (city.population >= 9000 && city.economy >= 30) || city.year >= 8,
  },
  {
    id: "growth",
    order: 2,
    name: "成長期",
    shortName: "成長",
    description: "企業と住民を呼び込み、街の成長を加速させる段階",
    mainChallenge: "成長の利益を誰に、どのように配分するのか",
    accentColor: "#4C8C68",
    nextStage: "expansion",
    advanceConditionText:
      "人口10,800人・経済42pt・都市基盤35pt以上、または18年目への到達",
    canAdvance: (city) =>
      (city.population >= 10800 &&
        city.economy >= 42 &&
        city.infrastructure >= 35) ||
      city.year >= 18,
  },
  {
    id: "expansion",
    order: 3,
    name: "拡大期",
    shortName: "拡大",
    description: "街の規模が広がり、利害関係が複雑になる段階",
    mainChallenge: "混雑や環境負荷を抑えながら成長を続けられるか",
    accentColor: "#347F9E",
    nextStage: "maturity",
    advanceConditionText:
      "人口12,500人・経済60pt・都市基盤55pt以上、または30年目への到達",
    canAdvance: (city) =>
      (city.population >= 12500 &&
        city.economy >= 60 &&
        city.infrastructure >= 55) ||
      city.year >= 30,
  },
  {
    id: "maturity",
    order: 4,
    name: "成熟期",
    shortName: "成熟",
    description: "成長量よりも暮らしの質と持続性が問われる段階",
    mainChallenge: "道路混雑や老朽化にどう対応するのか",
    accentColor: "#76588E",
    nextStage: "reorganization",
    advanceConditionText: "40年目への到達、または32年目以降の財政・人口危機",
    canAdvance: (city) =>
      city.year >= 40 ||
      (city.year >= 32 && (city.budget <= 10 || city.population <= 11000)),
  },
  {
    id: "reorganization",
    order: 5,
    name: "再編期",
    shortName: "再編",
    description: "これまでの街の形を見直し、次の時代へつなぐ段階",
    mainChallenge: "縮小と再投資のどちらを選び、何を残すのか",
    accentColor: "#C95D36",
    nextStage: null,
    advanceConditionText: null,
    canAdvance: () => false,
  },
];

// IDから発展段階の設定を取得する
export function getStageDefinition(stage: DevelopmentStage): StageDefinition {
  const definition = stageDefinitions.find((item) => item.id === stage);

  if (!definition) {
    return stageDefinitions[0];
  }

  return definition;
}

// 現在の街が次の発展段階へ進めるか判定する
export function canAdvanceStage(city: CityState): boolean {
  return getStageDefinition(city.stage).canAdvance(city);
}

// 条件を満たした場合だけ、次の発展段階を返す
export function getNextStage(city: CityState): DevelopmentStage | null {
  const currentStage = getStageDefinition(city.stage);

  if (!currentStage.nextStage) {
    return null;
  }

  if (!currentStage.canAdvance(city)) {
    return null;
  }

  return currentStage.nextStage;
}
