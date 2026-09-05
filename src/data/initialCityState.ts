import type { CityState } from "../types/game";

// ゲーム開始時点の街の状態
export const initialCityState: CityState = {
  // 50年間の市政を1年目から開始する
  year: 1,

  // 最初は創生期
  stage: "creation",

  // 街の基本規模
  population: 8000,
  budget: 50,

  // 街の評価指標
  economy: 25,
  infrastructure: 20,
  happiness: 55,
  trust: 50,
  congestion: 15,
  environment: 65,
};

// 「最初からやり直す」で安全に使えるように、
// 初期状態のコピーを作って返す
export function createInitialCityState(): CityState {
  return {
    ...initialCityState,
  };
}
