import type {
    DevelopmentModel,
    PolicyOption,
    StrategyPolicy,
} from "../../types/game";

type StrategyReviewConfig = {
  id: string;
  currentModel: DevelopmentModel;
  title: string;
  description: string;
  reason: string;
  theory: string;
  domain: StrategyPolicy["domain"];
  tags: string[];
  options: PolicyOption[];
};

function createStrategyReview(config: StrategyReviewConfig): StrategyPolicy {
  return {
    id: config.id,
    type: "strategy",
    category: "strategyReview",
    domain: config.domain,
    stages: ["growth", "expansion", "maturity", "reorganization"],

    title: config.title,
    description: config.description,
    reason: config.reason,
    theory: config.theory,

    weight: 1,
    cooldown: 50,
    repeatable: false,

    actors: ["住民", "企業", "議会", "市"],
    tags: [`current-${config.currentModel}`, ...config.tags],

    options: config.options,
  };
}

// ==================================================
// 現在が「産業誘致型」のときに出る見直し
// ==================================================

const industryToTourism = createStrategyReview({
  id: "strategy-review-01",
  currentModel: "industry",
  title: "隣町の観光都市化が大成功",
  description:
    "隣町が観光開発で大きな収入を得ています。議会から、産業誘致をやめて観光へ転換すべきとの声が上がりました。",
  reason:
    "他都市の成功例は魅力的に見えますが、成功条件まで同じとは限りません。",
  theory: "FOMO・模倣ゲーム・生存者バイアス",
  domain: "industry",
  tags: ["switch-to-tourism", "観光", "他都市"],
  options: [
    {
      id: "keep-current-model",
      label: "産業誘致を続ける",
      description: "隣町の成功に惑わされず、これまでの産業基盤を強化します。",
      effects: {
        economy: 5,
        trust: 2,
        environment: -2,
        congestion: 2,
      },
      resultMessage: "現在の産業戦略を維持し、既存企業との関係を深めました。",
    },
    {
      id: "switch-to-tourism",
      label: "観光交流型へ乗り換える",
      description: "産業予算を観光施設と宣伝へ振り替えます。",
      effects: {
        budget: -7,
        economy: 4,
        happiness: 4,
        environment: 2,
        trust: -2,
      },
      resultMessage: "既存企業との関係を弱め、観光交流型へ転換しました。",
    },
    {
      id: "hybrid-model",
      label: "産業観光として組み合わせる",
      description: "工場見学や技術展示を観光資源として活用します。",
      effects: {
        budget: -4,
        economy: 5,
        happiness: 2,
        trust: 3,
      },
      resultMessage: "産業基盤を残しながら、新しい来訪需要をつくりました。",
    },
  ],
});

const industryToLiving = createStrategyReview({
  id: "strategy-review-02",
  currentModel: "industry",
  title: "住宅都市への転換案",
  description:
    "テレワーク移住で成功した都市が注目されています。企業誘致より、暮らしやすさへ投資すべきでしょうか。",
  reason:
    "流行する政策へ乗り換えると、これまで蓄積した産業資産を失う可能性があります。",
  theory: "進化ゲーム・スイッチングコスト",
  domain: "living",
  tags: ["switch-to-living", "移住", "住宅"],
  options: [
    {
      id: "keep-current-model",
      label: "雇用を生む産業を優先する",
      description: "住宅需要も、安定した雇用があってこそだと判断します。",
      effects: {
        economy: 6,
        budget: 3,
        happiness: -2,
        environment: -2,
      },
      resultMessage: "産業誘致型を維持し、雇用の確保を優先しました。",
    },
    {
      id: "switch-to-living",
      label: "生活都市型へ乗り換える",
      description: "企業優遇を縮小し、住宅、教育、公園へ予算を移します。",
      effects: {
        budget: -7,
        population: 400,
        happiness: 7,
        trust: 4,
        economy: -3,
      },
      resultMessage: "産業誘致型から、生活都市型へ転換しました。",
    },
    {
      id: "hybrid-model",
      label: "職住近接の街をつくる",
      description:
        "企業と住宅を近接させ、働きやすさと暮らしやすさを両立します。",
      effects: {
        budget: -5,
        economy: 4,
        population: 250,
        happiness: 4,
        congestion: -2,
      },
      resultMessage: "産業を残しながら、職住近接型の街へ修正しました。",
    },
  ],
});

const industryAutomation = createStrategyReview({
  id: "strategy-review-03",
  currentModel: "industry",
  title: "工場自動化で雇用が減少",
  description:
    "誘致企業が自動化を進め、生産額は増えているのに市内雇用は減っています。",
  reason:
    "企業利益と地域雇用が一致しなくなり、従来の産業誘致戦略が機能しなくなっています。",
  theory: "技術変化・利益配分ゲーム",
  domain: "industry",
  tags: ["automation", "switch-to-living"],
  options: [
    {
      id: "keep-current-model",
      label: "高生産性産業を維持する",
      description: "雇用数より、税収と生産性を重視します。",
      effects: {
        economy: 8,
        budget: 5,
        population: -200,
        happiness: -4,
        trust: -3,
      },
      resultMessage: "産業競争力を優先しましたが、雇用不安が強まりました。",
    },
    {
      id: "switch-to-living",
      label: "生活サービス産業へ転換する",
      description: "医療、教育、福祉など地域雇用を生む分野へ移ります。",
      effects: {
        economy: 2,
        budget: -5,
        population: 250,
        happiness: 6,
        trust: 5,
      },
      resultMessage: "生活都市型へ転換し、地域に残る雇用を増やしました。",
    },
    {
      id: "hybrid-model",
      label: "再教育と自動化を組み合わせる",
      description: "企業の自動化を認め、職業訓練へ投資します。",
      effects: {
        budget: -6,
        economy: 6,
        happiness: 2,
        trust: 4,
        population: 100,
      },
      resultMessage: "産業を維持しながら、労働者の転職を支援しました。",
    },
  ],
});

const industryEnvironmentalPressure = createStrategyReview({
  id: "strategy-review-04",
  currentModel: "industry",
  title: "環境都市への評価が急上昇",
  description:
    "企業誘致型の街より、環境と生活を重視する街へ人口が流れ始めています。",
  reason: "過去に有効だった戦略も、住民の価値観が変われば選ばれなくなります。",
  theory: "進化的安定戦略・選好変化",
  domain: "environment",
  tags: ["environment", "switch-to-living"],
  options: [
    {
      id: "keep-current-model",
      label: "産業競争力を守る",
      description: "環境対策を最小限にし、企業の費用増加を防ぎます。",
      effects: {
        economy: 6,
        budget: 3,
        environment: -5,
        happiness: -3,
        trust: -3,
      },
      resultMessage:
        "産業戦略を維持しましたが、環境都市との評価差が広がりました。",
    },
    {
      id: "switch-to-living",
      label: "環境生活都市へ乗り換える",
      description: "企業優遇を減らし、緑地と住環境へ投資します。",
      effects: {
        budget: -7,
        environment: 9,
        happiness: 7,
        population: 300,
        economy: -4,
      },
      resultMessage: "生活都市型へ転換し、環境を街の魅力にしました。",
    },
    {
      id: "hybrid-model",
      label: "環境産業を育てる",
      description: "既存産業を省エネ・環境技術へ転換します。",
      effects: {
        budget: -5,
        economy: 5,
        environment: 6,
        trust: 4,
      },
      resultMessage: "産業と環境を組み合わせた新しい成長経路を選びました。",
    },
  ],
});

const industryRecession = createStrategyReview({
  id: "strategy-review-05",
  currentModel: "industry",
  title: "主力産業が長期不況へ",
  description:
    "主力企業の業績が悪化し、工場閉鎖の噂が広がっています。別の成長戦略へ移るべきでしょうか。",
  reason: "一時的な不況か構造的な衰退かによって、最適な対応は変わります。",
  theory: "ベイズゲーム・サンクコスト",
  domain: "finance",
  tags: ["recession", "switch-to-tourism"],
  options: [
    {
      id: "keep-current-model",
      label: "回復を信じて支援を続ける",
      description: "主力企業へ追加支援し、景気回復を待ちます。",
      effects: {
        budget: -9,
        economy: 4,
        trust: 1,
        happiness: -1,
      },
      resultMessage: "産業型を維持し、主力企業の回復に賭けました。",
    },
    {
      id: "switch-to-tourism",
      label: "観光交流型へ転換する",
      description: "工業への依存を減らし、観光と交流へ投資します。",
      effects: {
        budget: -6,
        economy: 3,
        happiness: 4,
        environment: 3,
        trust: -2,
      },
      resultMessage: "主力産業から離れ、観光交流型へ転換しました。",
    },
    {
      id: "hybrid-model",
      label: "複数産業へ分散する",
      description: "主力企業を残しながら、小規模産業と観光も育てます。",
      effects: {
        budget: -5,
        economy: 4,
        trust: 4,
        happiness: 2,
      },
      resultMessage: "一つの産業に依存しない分散戦略へ修正しました。",
    },
  ],
});

// ==================================================
// 現在が「観光交流型」のときに出る見直し
// ==================================================

const tourismToIndustry = createStrategyReview({
  id: "strategy-review-06",
  currentModel: "tourism",
  title: "隣町に巨大工場が進出",
  description:
    "隣町が工場誘致で雇用と税収を急増させています。こちらも観光から産業へ乗り換えるべきでしょうか。",
  reason:
    "他都市の高収益戦略を見て、現在の方針を過小評価するFOMOが生じています。",
  theory: "FOMO・模倣ダイナミクス",
  domain: "industry",
  tags: ["switch-to-industry", "factory", "他都市"],
  options: [
    {
      id: "keep-current-model",
      label: "観光交流型を続ける",
      description: "他都市と競わず、蓄積した観光ブランドを強化します。",
      effects: {
        economy: 4,
        happiness: 4,
        trust: 3,
        congestion: 2,
      },
      resultMessage: "観光交流型を維持し、街の独自性を守りました。",
    },
    {
      id: "switch-to-industry",
      label: "産業誘致型へ乗り換える",
      description: "観光予算を企業誘致と工業用地へ振り替えます。",
      effects: {
        budget: -8,
        economy: 8,
        population: 250,
        environment: -5,
        trust: -2,
      },
      resultMessage: "観光交流型から産業誘致型へ転換しました。",
    },
    {
      id: "hybrid-model",
      label: "観光と地場産業を結びつける",
      description: "地域製品、工房、食産業を観光資源として育てます。",
      effects: {
        budget: -4,
        economy: 6,
        happiness: 3,
        trust: 4,
      },
      resultMessage: "観光と産業を組み合わせ、地域内消費を増やしました。",
    },
  ],
});

const tourismToLiving = createStrategyReview({
  id: "strategy-review-07",
  currentModel: "tourism",
  title: "観光客より移住者を呼ぶべきか",
  description:
    "一時的な観光客ではなく、長期的に税金を納める住民を増やすべきとの意見が出ています。",
  reason:
    "短期消費を生む観光客と、長期的な費用と税収をもたらす住民では価値が異なります。",
  theory: "異時点間選択・顧客転換",
  domain: "living",
  tags: ["switch-to-living", "移住"],
  options: [
    {
      id: "keep-current-model",
      label: "観光客の消費を優先する",
      description: "宿泊、飲食、イベントへの投資を続けます。",
      effects: {
        economy: 6,
        budget: 4,
        congestion: 4,
        happiness: -2,
      },
      resultMessage: "観光交流型を維持し、短期的な消費を優先しました。",
    },
    {
      id: "switch-to-living",
      label: "生活都市型へ乗り換える",
      description: "観光施設より住宅、学校、医療へ投資します。",
      effects: {
        budget: -7,
        population: 500,
        happiness: 7,
        trust: 5,
        economy: -2,
      },
      resultMessage: "観光交流型から生活都市型へ転換しました。",
    },
    {
      id: "hybrid-model",
      label: "長期滞在者を増やす",
      description: "短期観光と移住の中間となる長期滞在を支援します。",
      effects: {
        budget: -4,
        population: 250,
        economy: 4,
        happiness: 3,
        trust: 2,
      },
      resultMessage: "観光の強みを使いながら、定住人口も増やしました。",
    },
  ],
});

const tourismOvercrowding = createStrategyReview({
  id: "strategy-review-08",
  currentModel: "tourism",
  title: "観光収入は増えたが住民が疲弊",
  description:
    "観光客数は過去最高ですが、住民満足度と環境評価が低下しています。",
  reason: "観光の利益を得る事業者と、混雑を負担する住民が異なっています。",
  theory: "オーバーツーリズム・外部性",
  domain: "environment",
  tags: ["overtourism", "switch-to-living"],
  options: [
    {
      id: "keep-current-model",
      label: "集客拡大を続ける",
      description: "住民への対策より、観光市場での地位を優先します。",
      effects: {
        economy: 8,
        budget: 5,
        congestion: 7,
        environment: -5,
        happiness: -6,
        trust: -5,
      },
      resultMessage: "観光収入は増えましたが、住民との対立が深まりました。",
    },
    {
      id: "switch-to-living",
      label: "生活都市型へ転換する",
      description: "観光客数を減らし、住民向けの空間へ戻します。",
      effects: {
        economy: -5,
        congestion: -8,
        environment: 7,
        happiness: 8,
        trust: 6,
      },
      resultMessage: "生活都市型へ転換し、住民生活の回復を優先しました。",
    },
    {
      id: "hybrid-model",
      label: "高付加価値観光へ絞る",
      description: "観光客数を抑え、一人あたり消費額を高めます。",
      effects: {
        economy: 4,
        budget: 2,
        congestion: -4,
        environment: 3,
        happiness: 4,
      },
      resultMessage: "観光を残しながら、量から質へ戦略を修正しました。",
    },
  ],
});

const tourismClimateRisk = createStrategyReview({
  id: "strategy-review-09",
  currentModel: "tourism",
  title: "異常気象で観光需要が不安定に",
  description: "猛暑や豪雨により、観光客数が年ごとに大きく変動しています。",
  reason: "一つの需要へ依存すると、外部環境の変化で街全体が影響を受けます。",
  theory: "リスク分散・混合戦略",
  domain: "finance",
  tags: ["climate-risk", "switch-to-industry"],
  options: [
    {
      id: "keep-current-model",
      label: "全天候型観光へ投資する",
      description: "屋内施設を整備し、観光戦略そのものは維持します。",
      effects: {
        budget: -9,
        economy: 5,
        infrastructure: 5,
        environment: -2,
      },
      resultMessage: "観光交流型を維持し、天候リスクへの対応を進めました。",
    },
    {
      id: "switch-to-industry",
      label: "産業誘致型へ乗り換える",
      description: "観光依存を減らし、安定した企業税収を求めます。",
      effects: {
        budget: -7,
        economy: 7,
        population: 200,
        environment: -4,
        trust: -2,
      },
      resultMessage: "観光交流型から産業誘致型へ転換しました。",
    },
    {
      id: "hybrid-model",
      label: "観光以外の収入源も育てる",
      description: "観光を残しながら、農業、IT、地域産業へ分散投資します。",
      effects: {
        budget: -5,
        economy: 5,
        trust: 4,
        environment: 2,
      },
      resultMessage: "観光への依存を下げ、複数の収入源を持つ街へ修正しました。",
    },
  ],
});

const tourismTrendFade = createStrategyReview({
  id: "strategy-review-10",
  currentModel: "tourism",
  title: "街のブームが終わり始めた",
  description: "SNSで注目された観光地への投稿と来訪者が減り始めています。",
  reason:
    "一時的な流行を恒久的な需要と誤認すると、過剰な施設を抱えることになります。",
  theory: "情報カスケード・バブル",
  domain: "industry",
  tags: ["trend", "switch-to-living"],
  options: [
    {
      id: "keep-current-model",
      label: "大型宣伝でブームを取り戻す",
      description: "追加の広告とイベントで再び注目を集めます。",
      effects: {
        budget: -10,
        economy: 5,
        congestion: 3,
        trust: -2,
      },
      resultMessage: "観光交流型を維持し、再び流行を起こすことに賭けました。",
    },
    {
      id: "switch-to-living",
      label: "生活都市型へ乗り換える",
      description: "余った観光施設を住民向け施設へ転用します。",
      effects: {
        budget: -5,
        happiness: 7,
        trust: 5,
        infrastructure: 4,
        economy: -2,
      },
      resultMessage: "観光交流型から生活都市型へ転換しました。",
    },
    {
      id: "hybrid-model",
      label: "固定客を重視する",
      description: "大量集客をやめ、再訪者や長期滞在者を大切にします。",
      effects: {
        economy: 3,
        happiness: 3,
        trust: 4,
        congestion: -3,
        environment: 2,
      },
      resultMessage:
        "流行を追う観光から、安定した関係を築く観光へ修正しました。",
    },
  ],
});

// ==================================================
// 現在が「生活都市型」のときに出る見直し
// ==================================================

const livingToIndustry = createStrategyReview({
  id: "strategy-review-11",
  currentModel: "living",
  title: "大企業から突然の進出提案",
  description:
    "多くの雇用を生む企業が、工業用地と税制優遇を条件に進出を提案しています。",
  reason:
    "大きな利益を前にすると、これまで守ってきた生活環境を過小評価しやすくなります。",
  theory: "誘惑ゲーム・FOMO",
  domain: "industry",
  tags: ["switch-to-industry", "企業誘致"],
  options: [
    {
      id: "keep-current-model",
      label: "生活環境を守り断る",
      description: "短期的な利益より、住民から選ばれる街を維持します。",
      effects: {
        happiness: 6,
        trust: 5,
        environment: 4,
        economy: -3,
      },
      resultMessage: "生活都市型を維持し、企業の進出提案を断りました。",
    },
    {
      id: "switch-to-industry",
      label: "産業誘致型へ乗り換える",
      description: "住宅政策の一部を縮小し、工業用地を確保します。",
      effects: {
        economy: 10,
        budget: 6,
        population: 250,
        environment: -7,
        happiness: -5,
      },
      resultMessage: "生活都市型から産業誘致型へ転換しました。",
    },
    {
      id: "hybrid-model",
      label: "厳しい立地条件を付ける",
      description: "環境対策と地元雇用を条件に、限定的な進出を認めます。",
      effects: {
        economy: 6,
        budget: 2,
        environment: -2,
        happiness: 2,
        trust: 4,
      },
      resultMessage: "生活環境を守る条件を付け、産業を部分的に受け入れました。",
    },
  ],
});

const livingToTourism = createStrategyReview({
  id: "strategy-review-12",
  currentModel: "living",
  title: "街の景観がSNSで話題に",
  description:
    "住民向けに整備した公園や街並みが注目され、観光地化を求める声が増えています。",
  reason:
    "住民のための資源を観光へ転用すると、成功の原因だった生活環境を損なう可能性があります。",
  theory: "コモンズの商業化・FOMO",
  domain: "living",
  tags: ["switch-to-tourism", "SNS", "観光"],
  options: [
    {
      id: "keep-current-model",
      label: "住民利用を優先する",
      description: "観光宣伝を抑え、公園と街並みを住民のために守ります。",
      effects: {
        happiness: 6,
        trust: 5,
        environment: 3,
        economy: -2,
      },
      resultMessage: "生活都市型を維持し、住民の利用を優先しました。",
    },
    {
      id: "switch-to-tourism",
      label: "観光交流型へ乗り換える",
      description: "宣伝と観光施設へ投資し、注目を収入へ変えます。",
      effects: {
        budget: -6,
        economy: 7,
        congestion: 6,
        environment: -3,
        happiness: -3,
      },
      resultMessage: "生活都市型から観光交流型へ転換しました。",
    },
    {
      id: "hybrid-model",
      label: "予約制で限定的に受け入れる",
      description: "住民利用を守りながら、観光客数を管理します。",
      effects: {
        economy: 4,
        budget: 2,
        happiness: 3,
        trust: 4,
        congestion: 1,
      },
      resultMessage: "生活環境を守りながら、管理された観光を導入しました。",
    },
  ],
});

const livingFiscalCrisis = createStrategyReview({
  id: "strategy-review-13",
  currentModel: "living",
  title: "住民サービスが財政を圧迫",
  description: "教育、医療、交通への手厚い支出により、財政余力が減っています。",
  reason:
    "生活サービスは支持されますが、税収を生む経済基盤がなければ維持できません。",
  theory: "予算制約・持続可能な協力",
  domain: "finance",
  tags: ["fiscal-crisis", "switch-to-industry"],
  options: [
    {
      id: "keep-current-model",
      label: "増税してサービスを守る",
      description: "住民負担を増やしてでも、生活サービスを維持します。",
      effects: {
        budget: 9,
        happiness: -4,
        trust: -3,
        infrastructure: 2,
      },
      resultMessage: "生活都市型を維持しましたが、住民負担が増えました。",
    },
    {
      id: "switch-to-industry",
      label: "産業誘致型へ乗り換える",
      description: "サービス支出を抑え、企業と税収を呼び込みます。",
      effects: {
        budget: 5,
        economy: 8,
        happiness: -5,
        trust: -3,
        environment: -3,
      },
      resultMessage: "生活都市型から産業誘致型へ転換しました。",
    },
    {
      id: "hybrid-model",
      label: "サービスを選別して産業も育てる",
      description: "重要サービスを残しながら、小規模な産業支援を始めます。",
      effects: {
        budget: 2,
        economy: 4,
        happiness: 1,
        trust: 3,
      },
      resultMessage: "生活と財政の両立を目指す混合戦略へ修正しました。",
    },
  ],
});

const livingHighRiseCompetition = createStrategyReview({
  id: "strategy-review-14",
  currentModel: "living",
  title: "周辺都市で高層住宅ブーム",
  description: "周辺都市が高層住宅を大量供給し、若い世帯を呼び込んでいます。",
  reason:
    "人口獲得競争に参加すると、供給過剰と街並みの変化を招く可能性があります。",
  theory: "軍拡競争・囚人のジレンマ",
  domain: "living",
  tags: ["housing-competition", "人口"],
  options: [
    {
      id: "keep-current-model",
      label: "低密度な住環境を守る",
      description: "人口競争には参加せず、現在の暮らしやすさを維持します。",
      effects: {
        happiness: 5,
        environment: 4,
        population: -150,
        economy: -1,
      },
      resultMessage: "生活都市型を維持し、人口規模より住環境を優先しました。",
    },
    {
      id: "switch-to-industry",
      label: "住宅より雇用を増やす",
      description: "住宅供給競争を避け、企業と働く場所を呼び込みます。",
      effects: {
        budget: -5,
        economy: 7,
        population: 200,
        environment: -3,
        congestion: 3,
      },
      resultMessage: "住宅中心から産業誘致型へ転換しました。",
    },
    {
      id: "hybrid-model",
      label: "駅前だけ高密度化する",
      description: "地域を限定し、生活環境を守りながら住宅を供給します。",
      effects: {
        budget: -4,
        population: 400,
        infrastructure: 4,
        congestion: 2,
        happiness: 2,
      },
      resultMessage: "生活都市型を残しながら、限定的な高密度化を進めました。",
    },
  ],
});

const livingResearchCluster = createStrategyReview({
  id: "strategy-review-15",
  currentModel: "living",
  title: "大学から研究都市化の提案",
  description:
    "大学が研究施設と企業を集める構想を提案しています。静かな生活都市から転換すべきでしょうか。",
  reason:
    "新しい集積は成長機会ですが、成功するまでに長い時間と先行投資が必要です。",
  theory: "集積ゲーム・ネットワーク外部性",
  domain: "industry",
  tags: ["research-cluster", "switch-to-industry"],
  options: [
    {
      id: "keep-current-model",
      label: "教育環境だけを支援する",
      description: "企業集積は目指さず、住民向けの教育機能を強化します。",
      effects: {
        budget: -4,
        happiness: 5,
        trust: 4,
        economy: 2,
      },
      resultMessage: "生活都市型を維持し、教育機能として大学を支援しました。",
    },
    {
      id: "switch-to-industry",
      label: "研究産業都市へ乗り換える",
      description: "研究施設、企業用地、起業支援へ大規模投資します。",
      effects: {
        budget: -10,
        economy: 9,
        population: 300,
        infrastructure: 4,
        congestion: 2,
      },
      resultMessage:
        "生活都市型から、研究産業を軸とする産業誘致型へ転換しました。",
    },
    {
      id: "hybrid-model",
      label: "生活課題の研究拠点にする",
      description: "医療、福祉、交通など、住民生活を改善する研究に限定します。",
      effects: {
        budget: -6,
        economy: 5,
        happiness: 5,
        trust: 5,
        infrastructure: 3,
      },
      resultMessage: "生活都市の強みと研究産業を組み合わせました。",
    },
  ],
});

// 戦略見直し・FOMOイベント15件
export const strategyReviewPolicies: StrategyPolicy[] = [
  industryToTourism,
  industryToLiving,
  industryAutomation,
  industryEnvironmentalPressure,
  industryRecession,
  tourismToIndustry,
  tourismToLiving,
  tourismOvercrowding,
  tourismClimateRisk,
  tourismTrendFade,
  livingToIndustry,
  livingToTourism,
  livingFiscalCrisis,
  livingHighRiseCompetition,
  livingResearchCluster,
];
