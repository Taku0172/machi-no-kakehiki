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
