import type { NumericPolicy, Policy, StrategyPolicy } from "../types/game";

// ==================================================
// 発展段階の開始時に表示する都市戦略
// ==================================================

export const firstPolicy: StrategyPolicy = {
  id: "tax-burden",
  type: "strategy",

  title: "発展費用を誰が負担するか",

  description:
    "道路・上下水道・学校を整えるため、誰を中心に合意を組み立てるか決めます。",

  reason:
    "現在の都市基盤では新しい企業や住民を受け入れられず、共通財源が必要になりました。",

  theory: "公共財ゲーム",

  options: [
    {
      id: "shared",

      label: "三者で薄く広く負担",

      description: "公平感を優先し、長期的な協力関係をつくります。",

      effects: {
        budget: 18,
        infrastructure: 8,
        economy: 3,
        happiness: 4,
        trust: 8,
      },
    },
    {
      id: "business",

      label: "企業先行で成長を急ぐ",

      description: "企業を優遇し、短期間で都市基盤を整えます。",

      effects: {
        budget: 21,
        infrastructure: 10,
        economy: 8,
        population: 260,
        happiness: -3,
        trust: -2,
      },
    },
    {
      id: "land",

      label: "地価上昇分から回収",

      description: "地主の負担を中心にして、住民負担を抑えます。",

      effects: {
        budget: 16,
        infrastructure: 7,
        population: 340,
        economy: -1,
        happiness: 6,
        trust: 1,
      },
    },
  ],
};

// ==================================================
// 通常政策1：数値を選ぶ政策
// ==================================================

export const waterPolicy: NumericPolicy = {
  id: "water-fund",
  type: "numeric",

  title: "上水道延伸の共同負担",

  description:
    "郊外へ水道を延ばすには18億円必要です。市が先にいくら拠出するか決めます。",

  reason: "住宅候補地が広がりましたが、生活基盤が中心部に限られています。",

  theory: "閾値公共財ゲーム",

  valueLabel: "市の先行拠出",
  unit: "億円",

  min: 0,
  max: 18,
  step: 1,
  defaultValue: 8,

  // バーを動かしたときに表示する予測
  getForecast: (value, city) => {
    // 信頼が高い街ほど、住民や企業も協力する
    const contributionFromOthers = Math.max(3, Math.round(city.trust / 7));

    const total = value + contributionFromOthers;

    if (total >= 18) {
      return `他主体は${contributionFromOthers}億円を拠出する見込みです。合計${total}億円となり、事業成立が期待できます。`;
    }

    return `他主体は${contributionFromOthers}億円を拠出する見込みです。合計${total}億円で、必要額まであと${18 - total}億円不足します。`;
  },

  // 政策を実行したときの結果
  calculateResult: (value, city) => {
    const contributionFromOthers = Math.max(3, Math.round(city.trust / 7));

    const total = value + contributionFromOthers;

    const projectSucceeded = total >= 18;

    if (projectSucceeded) {
      return {
        effects: {
          budget: -value,
          infrastructure: 11,
          population: 520,
          trust: 5,
        },

        message: `市が${value}億円、住民と企業が${contributionFromOthers}億円を拠出し、水道延伸が実現しました。`,
      };
    }

    return {
      effects: {
        budget: -value,
        infrastructure: 2,
        population: 40,
        trust: -4,
      },

      message: `合計${total}億円で必要額に届かず、小規模な補修だけで終了しました。`,
    };
  },
};

// ==================================================
// 通常政策2：戦略を選ぶ政策
// ==================================================

export const landPolicy: StrategyPolicy = {
  id: "first-land",
  type: "strategy",

  title: "最初の住宅用地をどう確保するか",

  description:
    "地主が所有する未利用地を住宅地区へ変えるため、土地の取得方法を決めます。",

  reason: "人口を増やすための住宅用地が不足しています。",

  theory: "最後通牒ゲーム",

  options: [
    {
      id: "purchase",

      label: "公共事業として買収する",

      description: "高い確実性と引き換えに、市が大きな費用を負担します。",

      effects: {
        budget: -14,
        population: 650,
        economy: 4,
        trust: 4,
      },
    },
    {
      id: "joint",

      label: "地主と共同開発する",

      description: "将来の利益を分け合い、双方が受け入れる案を作ります。",

      effects: {
        budget: -8,
        population: 480,
        economy: 6,
        trust: 7,
      },
    },
    {
      id: "landTrust",

      label: "土地信託で長期交渉する",

      description: "初期費用を抑えますが、住宅開発の速度は遅くなります。",

      effects: {
        budget: -3,
        population: 220,
        economy: 2,
        trust: 5,
      },
    },
  ],
};

// ==================================================
// 政策を用途別の配列にまとめる
// ==================================================

// 発展段階ごとに一度だけ表示する都市戦略
export const cityStrategies: StrategyPolicy[] = [firstPolicy];

// 毎年実行する通常政策
// 数値政策と戦略政策を同じ配列へ入れられる
export const regularPolicies: Policy[] = [waterPolicy, landPolicy];
