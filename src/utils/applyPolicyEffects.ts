import { CityMetric, CityState, PolicyEffects } from "../types/game";

/**
 * 政策効果を現在の街へ反映する
 *
 * @param city 現在の街
 * @param effects 政策による増減
 * @param advancesYear 年度を進めるか
 */
export function applyPolicyEffects(
  city: CityState,
  effects: PolicyEffects,
  advancesYear: boolean,
): CityState {
  // 元のデータを直接変更しないようにコピーする
  const updatedCity = { ...city };

  // 効果が設定されている指標を順番に更新する
  Object.keys(effects).forEach((key) => {
    const metric = key as CityMetric;
    const change = effects[metric] ?? 0;

    updatedCity[metric] += change;

    // 評価系の数値は0〜100の範囲に収める
    if (metric !== "population" && metric !== "budget") {
      updatedCity[metric] = Math.max(0, Math.min(100, updatedCity[metric]));
    }
  });

  // 通常政策を実行した場合だけ年度を進める
  if (advancesYear) {
    updatedCity.year += 1;
  }

  return updatedCity;
}
