import { StrategyPolicy } from "../types/game";

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
