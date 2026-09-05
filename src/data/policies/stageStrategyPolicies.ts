import type { StrategyPolicy } from "../../types/game";

// ==================================================
// 創生期：街の最初の成長モデル
// ==================================================

const creationStrategy: StrategyPolicy = {
  id: "stage-strategy-creation",
  type: "strategy",
  category: "stageStrategy",
  domain: "industry",
  stages: ["creation"],

  title: "この街は何で発展するのか",
  description:
    "限られた資源をどこへ集中し、街の最初の成長モデルをつくるか決めます。",
  reason:
    "すべての分野へ均等に投資すると特色が生まれず、企業や住民へ明確な期待を示せません。",
  theory: "コーディネーションゲーム・経路依存",

  weight: 1,
  cooldown: 50,
  repeatable: false,

  actors: ["住民", "企業", "観光事業者", "市"],
  tags: ["成長モデル", "初期戦略", "経路依存"],

  options: [
    {
      id: "model-industry",
      label: "産業誘致型で進む",
      description: "工場や企業を呼び込み、雇用と税収を成長の中心にします。",
      effects: {
        budget: -6,
        economy: 8,
        infrastructure: 4,
        population: 250,
        environment: -3,
        congestion: 2,
      },
      resultMessage: "産業と雇用を中心に発展する方針を打ち出しました。",
    },
    {
      id: "model-tourism",
      label: "観光交流型で進む",
      description:
        "自然、文化、イベントを活用し、市外から人と消費を呼び込みます。",
      effects: {
        budget: -5,
        economy: 5,
        happiness: 4,
        environment: 2,
        congestion: 3,
        trust: 2,
      },
      resultMessage: "観光と交流を中心に発展する方針を打ち出しました。",
    },
    {
      id: "model-living",
      label: "生活都市型で進む",
      description: "住宅、教育、医療を整え、住民から選ばれる街を目指します。",
      effects: {
        budget: -7,
        population: 400,
        happiness: 7,
        trust: 4,
        infrastructure: 3,
        economy: 2,
      },
      resultMessage: "暮らしやすさを中心に発展する方針を打ち出しました。",
    },
  ],
};

// ==================================================
// 成長期：成長利益の配分
// ==================================================

const growthStrategy: StrategyPolicy = {
  id: "stage-strategy-growth",
  type: "strategy",
  category: "stageStrategy",
  domain: "finance",
  stages: ["growth"],

  title: "成長で得た利益をどこへ回すか",
  description:
    "人口と税収が増え始めました。成長の利益を次の投資、住民への還元、将来への備えのどこへ使うか決めます。",
  reason: "現在の住民、将来の住民、成長企業では望ましい利益配分が異なります。",
  theory: "分配ゲーム・異時点間選択",

  weight: 1,
  cooldown: 50,
  repeatable: false,

  actors: ["現在の住民", "将来の住民", "企業", "市"],
  tags: ["利益配分", "再投資", "財政"],

  options: [
    {
      id: "growth-reinvestment",
      label: "成長分野へ再投資する",
      description: "企業誘致とインフラ整備を続け、さらに大きな成長を狙います。",
      effects: {
        budget: -8,
        economy: 8,
        infrastructure: 6,
        population: 250,
        congestion: 4,
        environment: -3,
      },
      resultMessage: "成長を次の成長へつなげる積極投資を選びました。",
    },
    {
      id: "growth-redistribution",
      label: "住民サービスへ還元する",
      description: "教育、福祉、交通へ配分し、成長の利益を広く共有します。",
      effects: {
        budget: -7,
        happiness: 8,
        trust: 7,
        infrastructure: 2,
        economy: 1,
      },
      resultMessage: "成長の利益を住民へ広く還元する方針を選びました。",
    },
    {
      id: "growth-reserve",
      label: "将来のために蓄える",
      description: "景気後退や災害に備え、成長による税収を基金へ積み立てます。",
      effects: {
        budget: 12,
        trust: 3,
        economy: -2,
        happiness: -1,
      },
      resultMessage: "現在の投資を抑え、将来の危機に備える方針を選びました。",
    },
  ],
};

// ==================================================
// 拡大期：都市空間の基本方針
// ==================================================

const expansionStrategy: StrategyPolicy = {
  id: "stage-strategy-expansion",
  type: "strategy",
  category: "stageStrategy",
  domain: "transport",
  stages: ["expansion"],

  title: "拡大した街をどうつなぐか",
  description:
    "市街地が広がり、移動距離と道路混雑が増えています。今後の都市構造を決めます。",
  reason:
    "道路、公共交通、拠点集約のどれを選ぶかによって、将来の交通行動が固定されます。",
  theory: "混雑ゲーム・ネットワーク外部性",

  weight: 1,
  cooldown: 50,
  repeatable: false,

  actors: ["自動車利用者", "公共交通利用者", "郊外住民", "市"],
  tags: ["交通戦略", "都市構造", "混雑"],

  options: [
    {
      id: "expansion-car-city",
      label: "道路中心の広域都市",
      description: "道路と駐車場を増やし、自動車で移動しやすい街をつくります。",
      effects: {
        budget: -8,
        infrastructure: 8,
        economy: 5,
        population: 300,
        congestion: 5,
        environment: -6,
      },
      resultMessage: "自動車による広域的な発展を選びました。",
    },
    {
      id: "expansion-transit-city",
      label: "公共交通中心の都市",
      description: "鉄道、バス、徒歩を中心に都市交通を組み直します。",
      effects: {
        budget: -10,
        infrastructure: 7,
        congestion: -8,
        environment: 6,
        happiness: 4,
        economy: 2,
      },
      resultMessage: "公共交通を軸に街をつなぐ方針を選びました。",
    },
    {
      id: "expansion-multiple-centers",
      label: "複数拠点へ機能を分散する",
      description:
        "職場、商業、公共施設を複数地区に置き、中心部への集中を減らします。",
      effects: {
        budget: -7,
        infrastructure: 5,
        congestion: -5,
        happiness: 4,
        trust: 3,
        economy: 3,
      },
      resultMessage: "複数の地域拠点を育てる都市構造を選びました。",
    },
  ],
};

// ==================================================
// 成熟期：街の価値基準
// ==================================================

const maturityStrategy: StrategyPolicy = {
  id: "stage-strategy-maturity",
  type: "strategy",
  category: "stageStrategy",
  domain: "living",
  stages: ["maturity"],

  title: "成熟した街は何を優先するか",
  description:
    "成長だけを追う段階は終わりました。競争力、生活の質、危機への強さのどれを優先するか決めます。",
  reason:
    "限られた財源の中では、すべての価値を同じ水準で高め続けることはできません。",
  theory: "多目的意思決定・社会的選択",

  weight: 1,
  cooldown: 50,
  repeatable: false,

  actors: ["住民", "企業", "将来世代", "市"],
  tags: ["成熟都市", "優先順位", "価値選択"],

  options: [
    {
      id: "maturity-competitive",
      label: "都市間競争を勝ち抜く",
      description: "企業、観光客、投資を呼び込み、経済的な競争力を維持します。",
      effects: {
        budget: -6,
        economy: 9,
        infrastructure: 4,
        congestion: 4,
        environment: -3,
        happiness: -1,
      },
      resultMessage: "都市間競争で選ばれる街を目指す方針を選びました。",
    },
    {
      id: "maturity-quality",
      label: "住民の生活の質を高める",
      description: "医療、文化、緑地、移動の快適さを優先します。",
      effects: {
        budget: -8,
        happiness: 9,
        environment: 5,
        trust: 5,
        economy: -1,
      },
      resultMessage: "住民が長く暮らしたい街を目指す方針を選びました。",
    },
    {
      id: "maturity-resilient",
      label: "危機に強い街をつくる",
      description: "防災、財政余力、インフラ保全へ重点的に投資します。",
      effects: {
        budget: 5,
        infrastructure: 7,
        trust: 5,
        happiness: -2,
        economy: -2,
      },
      resultMessage:
        "将来の災害や景気後退に耐えられる街を目指す方針を選びました。",
    },
  ],
};

// ==================================================
// 再編期：縮小局面の最終戦略
// ==================================================

const reorganizationStrategy: StrategyPolicy = {
  id: "stage-strategy-reorganization",
  type: "strategy",
  category: "stageStrategy",
  domain: "finance",
  stages: ["reorganization"],

  title: "縮小する街に何を残すか",
  description:
    "人口と財源が限られる中で、過去の街を維持するのか、新しい形へ組み直すのか決めます。",
  reason:
    "縮小局面では、維持する対象と撤退する対象を明確にしなければ、すべてが少しずつ悪化します。",
  theory: "退出ゲーム・サンクコスト・進化ゲーム",

  weight: 1,
  cooldown: 50,
  repeatable: false,

  actors: ["現在の住民", "将来世代", "企業", "市"],
  tags: ["都市再編", "縮小", "撤退"],

  options: [
    {
      id: "reorganization-preserve",
      label: "今の街をできる限り残す",
      description: "財政負担を受け入れ、既存の施設と地域サービスを維持します。",
      effects: {
        budget: -12,
        infrastructure: 3,
        happiness: 6,
        trust: 5,
        economy: -2,
      },
      resultMessage: "現在の住民生活を守る維持型の再編を選びました。",
    },
    {
      id: "reorganization-compact",
      label: "小さく効率的な街へ再編する",
      description: "居住地と公共施設を集約し、維持費を削減します。",
      effects: {
        budget: 10,
        infrastructure: 6,
        population: -300,
        happiness: -4,
        trust: -3,
        congestion: 2,
      },
      resultMessage: "街の規模を縮め、効率性を優先する再編を選びました。",
    },
    {
      id: "reorganization-renewal",
      label: "古い構造を壊して転換する",
      description:
        "衰退産業と未利用施設から撤退し、新産業と新住民へ投資します。",
      effects: {
        budget: -8,
        economy: 8,
        population: 250,
        infrastructure: 3,
        happiness: -3,
        trust: -2,
      },
      resultMessage: "短期的な痛みを受け入れ、街の構造転換を選びました。",
    },
  ],
};

// 発展段階ごとに一度だけ出現する戦略課題
export const stageStrategyPolicies: StrategyPolicy[] = [
  creationStrategy,
  growthStrategy,
  expansionStrategy,
  maturityStrategy,
  reorganizationStrategy,
];
