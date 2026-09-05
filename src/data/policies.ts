import { NumericPolicy, StrategyPolicy } from "../types/game";

// 最初に表示する都市戦略
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

// 最初の通常政策
export const waterPolicy: NumericPolicy = {
  id: "water-fund",
  type: "numeric",

  title: "上水道延伸の共同負担",

  description:
    "郊外へ水道を延ばすには18億円必要です。市の先行拠出額を決めます。",

  reason: "住宅候補地は広がりましたが、生活基盤が中心部に限られています。",

  theory: "閾値公共財ゲーム",

  valueLabel: "市の先行拠出",
  unit: "億円",
  min: 0,
  max: 18,
  step: 1,
  defaultValue: 8,

  getForecast: (value, city) => {
    // 信頼が高いほど、住民や企業も多く負担する
    const otherContribution = Math.max(3, Math.round(city.trust / 7));

    const total = value + otherContribution;

    return `他主体の予想拠出は${otherContribution}億円です。合計は${total}億円になる見込みです。`;
  },

  calculateResult: (value, city) => {
    // 信頼度から他主体の拠出額を計算
    const otherContribution = Math.max(3, Math.round(city.trust / 7));

    // 合計18億円以上なら水道延伸に成功
    const isSuccessful = value + otherContribution >= 18;

    if (isSuccessful) {
      return {
        effects: {
          budget: -value,
          infrastructure: 11,
          population: 520,
          trust: 5,
        },
        message: `住民と企業が${otherContribution}億円を拠出し、水道延伸が実現しました。`,
      };
    }

    return {
      effects: {
        budget: -value,
        infrastructure: 2,
        population: 40,
        trust: -4,
      },
      message: `他主体の拠出は${otherContribution}億円でした。必要額に届かず、小規模な補修だけで終わりました。`,
    };
  },
};
