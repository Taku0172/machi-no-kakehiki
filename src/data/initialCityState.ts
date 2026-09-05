// 街データの型を読み込む
import { CityState } from "../types/game";

// ゲーム開始時の街の状態
export const initialCityState: CityState = {
  year: 1,
  stage: "creation",

  population: 8400,
  budget: 55,
  economy: 22,
  infrastructure: 18,
  happiness: 52,
  trust: 50,
  congestion: 5,
  environment: 58,
};
