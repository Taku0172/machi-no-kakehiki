// 街の発展段階
export type DevelopmentStage =
  | "creation"
  | "growth"
  | "expansion"
  | "maturity"
  | "reorganization";

// ゲーム中に変化する街の状態
export type CityState = {
  // 現在の年度
  year: number;

  // 現在の発展段階
  stage: DevelopmentStage;

  // 街の基本指標
  population: number;
  budget: number;
  economy: number;
  infrastructure: number;
  happiness: number;
  trust: number;
  congestion: number;
  environment: number;
};

// 政策によって変化できる街の指標
export type CityMetric = Exclude<keyof CityState, "year" | "stage">;

// 戦略を選んだときの効果
export type PolicyEffects = Partial<Record<CityMetric, number>>;

// プレイヤーが選べる戦略
export type PolicyOption = {
  id: string;
  label: string;
  description: string;
  effects: PolicyEffects;
};

// 戦略選択型の政策課題
export type StrategyPolicy = {
  id: string;
  type: "strategy";
  title: string;
  description: string;
  reason: string;
  theory: string;
  options: PolicyOption[];
};
