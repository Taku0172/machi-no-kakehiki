import type { NumericPolicy, StrategyPolicy } from "../../types/game";

function createStrategyPolicy(
  policy: Omit<StrategyPolicy, "type" | "category" | "stages">,
): StrategyPolicy {
  return {
    ...policy,
    type: "strategy",
    category: "regularPolicy",
    stages: ["maturity"],
  };
}

function createNumericPolicy(
  policy: Omit<NumericPolicy, "type" | "category" | "stages">,
): NumericPolicy {
  return {
    ...policy,
    type: "numeric",
    category: "regularPolicy",
    stages: ["maturity"],
  };
}

// ==================================================
// 戦略選択型の通常政策
// ==================================================

const agingInfrastructurePolicy = createStrategyPolicy({
  id: "maturity-regular-01",
  title: "同時に老朽化する都市施設",
  description: "道路、橋、水道、公共施設が一斉に更新時期を迎えています。",
  reason:
    "すべてを更新する財源はなく、優先順位と事故リスクを比較する必要があります。",
  theory: "資源配分ゲーム・リスク選択",
  domain: "infrastructure",
  weight: 1.5,
  cooldown: 7,
  repeatable: true,
  actors: ["住民", "利用者", "建設会社", "市"],
  tags: ["老朽化", "維持管理", "優先順位"],
  options: [
    {
      id: "lifeline-priority",
      label: "水道と橋を優先する",
      description: "事故時の被害が大きい基幹設備から更新します。",
      effects: {
        budget: -13,
        infrastructure: 9,
        trust: 4,
        happiness: 1,
      },
      resultMessage:
        "重大事故の危険は下がりましたが、身近な施設の改修は遅れました。",
    },
    {
      id: "daily-life-priority",
      label: "道路と公共施設を優先する",
      description: "多くの住民が日常的に使う施設から改修します。",
      effects: {
        budget: -11,
        infrastructure: 6,
        happiness: 5,
        congestion: -3,
        trust: 2,
      },
      resultMessage: "生活の不便は減りましたが、基幹設備のリスクが残りました。",
    },
    {
      id: "preventive-maintenance",
      label: "小規模修繕を広く行う",
      description: "全面更新を避け、点検と予防保全で寿命を延ばします。",
      effects: {
        budget: -7,
        infrastructure: 5,
        trust: 3,
        environment: 2,
      },
      resultMessage:
        "急激な改善はありませんが、少ない費用で寿命を延ばしました。",
    },
  ],
});

const seniorMobilityPolicy = createStrategyPolicy({
  id: "maturity-regular-02",
  title: "高齢者の移動手段",
  description:
    "運転免許を返納した高齢者から、買い物や通院が難しいとの声が増えています。",
  reason:
    "利用者が少ない地域の交通は採算が取れず、市場だけでは供給されにくくなります。",
  theory: "地域公共財・ユニバーサルサービス",
  domain: "transport",
  weight: 1.3,
  cooldown: 7,
  repeatable: true,
  actors: ["高齢者", "交通会社", "家族", "市"],
  tags: ["高齢化", "交通", "買い物難民"],
  options: [
    {
      id: "community-bus",
      label: "小型循環バスを運行する",
      description: "病院、商店、住宅地を定時運行で結びます。",
      effects: {
        budget: -7,
        infrastructure: 4,
        happiness: 6,
        trust: 4,
        congestion: -2,
      },
      resultMessage: "移動の安心は高まりましたが、赤字路線を抱えました。",
    },
    {
      id: "taxi-voucher",
      label: "タクシー券を配布する",
      description: "必要な住民へ直接、移動費を補助します。",
      effects: {
        budget: -5,
        happiness: 5,
        trust: 3,
        infrastructure: 1,
      },
      resultMessage:
        "柔軟な移動が可能になりましたが、利用回数に限界があります。",
    },
    {
      id: "volunteer-transport",
      label: "地域の送迎活動を支援する",
      description: "住民団体による乗合送迎へ補助します。",
      effects: {
        budget: -2,
        happiness: 4,
        trust: 6,
        infrastructure: 1,
      },
      resultMessage:
        "地域のつながりが強まりましたが、担い手への負担が増えました。",
    },
  ],
});

const vacantHousePolicy = createStrategyPolicy({
  id: "maturity-regular-03",
  title: "増加する空き家",
  description: "古い住宅地で空き家が増え、防犯や景観への影響が出ています。",
  reason: "空き家は私有財産ですが、放置による費用は周辺住民も負担します。",
  theory: "所有権ゲーム・負の外部性",
  domain: "living",
  weight: 1.2,
  cooldown: 7,
  repeatable: true,
  actors: ["所有者", "近隣住民", "移住者", "市"],
  tags: ["空き家", "所有権", "住宅"],
  options: [
    {
      id: "forced-demolition",
      label: "危険な空き家を強制撤去する",
      description: "安全性を優先し、市が撤去を進めます。",
      effects: {
        budget: -7,
        happiness: 4,
        trust: -2,
        environment: 2,
        infrastructure: 3,
      },
      resultMessage: "安全性は改善しましたが、財産権を巡る反発が起きました。",
    },
    {
      id: "renovation-market",
      label: "民間の改修流通を支援する",
      description: "改修事業者と購入希望者を結びつけます。",
      effects: {
        budget: -3,
        economy: 4,
        population: 300,
        happiness: 3,
        environment: 2,
      },
      resultMessage: "空き家が新しい住宅や店舗として再利用されました。",
    },
    {
      id: "community-use",
      label: "地域施設として活用する",
      description: "所有者から借り上げ、交流拠点や福祉施設へ転用します。",
      effects: {
        budget: -5,
        happiness: 5,
        trust: 5,
        infrastructure: 2,
      },
      resultMessage: "空き家が地域活動の拠点として生まれ変わりました。",
    },
  ],
});

const schoolConsolidationPolicy = createStrategyPolicy({
  id: "maturity-regular-04",
  title: "児童数が減った学校",
  description: "一部地域で児童数が減り、小規模校の維持費が問題になっています。",
  reason: "統合すれば効率化できますが、地域コミュニティの中心が失われます。",
  theory: "規模の経済・地域間公平性",
  domain: "living",
  weight: 1.1,
  cooldown: 8,
  repeatable: false,
  actors: ["児童", "保護者", "地域住民", "市"],
  tags: ["学校統合", "教育", "地域"],
  options: [
    {
      id: "full-consolidation",
      label: "中心校へ統合する",
      description: "学校規模を確保し、設備と教員を集約します。",
      effects: {
        budget: 7,
        infrastructure: 3,
        happiness: -5,
        trust: -4,
        congestion: 2,
      },
      resultMessage: "教育資源は集約できましたが、地域の反発が強まりました。",
    },
    {
      id: "maintain-schools",
      label: "小規模校を維持する",
      description: "費用を負担し、地域に学校を残します。",
      effects: {
        budget: -8,
        happiness: 5,
        trust: 4,
        population: 100,
      },
      resultMessage: "地域の安心は守られましたが、教育費の負担が続きます。",
    },
    {
      id: "shared-campus",
      label: "施設を地域と共用する",
      description: "学校機能を残しながら、福祉や交流施設を併設します。",
      effects: {
        budget: -4,
        happiness: 4,
        trust: 6,
        infrastructure: 3,
      },
      resultMessage: "学校を残しつつ、施設の利用率を高めました。",
    },
  ],
});

const tourismCongestionPolicy = createStrategyPolicy({
  id: "maturity-regular-05",
  title: "観光客と住民生活の衝突",
  description:
    "観光客の増加により、騒音、混雑、ごみ問題への苦情が増えています。",
  reason: "観光収入の利益と生活負担が、異なる主体に偏っています。",
  theory: "外部性・利益配分ゲーム",
  domain: "environment",
  weight: 1.2,
  cooldown: 7,
  repeatable: true,
  actors: ["観光客", "住民", "観光事業者", "市"],
  tags: ["観光公害", "混雑", "住民生活"],
  options: [
    {
      id: "tourism-limit",
      label: "観光客数を制限する",
      description: "予約制や入場制限で、混雑を直接抑えます。",
      effects: {
        economy: -5,
        congestion: -8,
        environment: 6,
        happiness: 6,
        trust: 4,
      },
      resultMessage: "住民生活は改善しましたが、観光収入が減少しました。",
    },
    {
      id: "tourism-dispersion",
      label: "観光地を分散する",
      description: "周辺地域へ観光ルートを広げます。",
      effects: {
        budget: -5,
        economy: 4,
        congestion: -4,
        environment: 2,
        infrastructure: 3,
      },
      resultMessage: "観光利益と混雑を複数地域へ分散できました。",
    },
    {
      id: "business-regulation",
      label: "事業者へ対策を義務付ける",
      description: "ごみ処理、警備、交通整理の費用を事業者に負担させます。",
      effects: {
        budget: 4,
        economy: -2,
        congestion: -4,
        environment: 4,
        trust: 3,
      },
      resultMessage:
        "観光の負担を事業者へ戻しましたが、一部事業者が撤退しました。",
    },
  ],
});

const inequalityPolicy = createStrategyPolicy({
  id: "maturity-regular-06",
  title: "地域間格差の拡大",
  description:
    "中心部と郊外で、所得、交通、公共サービスの格差が広がっています。",
  reason:
    "成長地域へ投資すると効率的ですが、衰退地域との格差がさらに広がります。",
  theory: "公平性と効率性・分配ゲーム",
  domain: "trust",
  weight: 1.2,
  cooldown: 7,
  repeatable: true,
  actors: ["中心部住民", "郊外住民", "企業", "市"],
  tags: ["格差", "再分配", "地域"],
  options: [
    {
      id: "growth-center",
      label: "成長地域へ集中投資する",
      description: "経済効果の高い中心部をさらに強化します。",
      effects: {
        economy: 8,
        budget: 4,
        infrastructure: 4,
        happiness: -5,
        trust: -6,
      },
      resultMessage: "街全体の経済は伸びましたが、地域間の不満が強まりました。",
    },
    {
      id: "redistribution",
      label: "郊外へ重点的に再分配する",
      description: "交通、医療、教育を郊外へ追加配分します。",
      effects: {
        budget: -8,
        happiness: 6,
        trust: 7,
        infrastructure: 3,
        economy: -1,
      },
      resultMessage: "成長速度は落ちましたが、地域間の信頼が回復しました。",
    },
    {
      id: "local-autonomy",
      label: "地区ごとに予算を任せる",
      description: "各地区へ一定額を渡し、使い道を地域で決めてもらいます。",
      effects: {
        budget: -5,
        trust: 8,
        happiness: 4,
        infrastructure: 2,
      },
      resultMessage:
        "地区ごとの差は残りましたが、政策への納得感が高まりました。",
    },
  ],
});

const hospitalReorganizationPolicy = createStrategyPolicy({
  id: "maturity-regular-07",
  title: "赤字病院の再編",
  description: "市立病院の赤字が続き、診療体制の見直しが必要になっています。",
  reason:
    "採算の悪い診療科も地域には必要であり、利益だけでは存続を判断できません。",
  theory: "クリームスキミング・公共サービス供給",
  domain: "finance",
  weight: 1.1,
  cooldown: 8,
  repeatable: false,
  actors: ["患者", "医師", "民間病院", "市"],
  tags: ["病院", "医療", "赤字"],
  options: [
    {
      id: "maintain-public",
      label: "赤字でも市立病院を維持する",
      description: "救急や不採算診療を公共サービスとして残します。",
      effects: {
        budget: -12,
        happiness: 6,
        trust: 6,
        infrastructure: 2,
      },
      resultMessage: "医療への安心は守られましたが、赤字が財政を圧迫しました。",
    },
    {
      id: "private-transfer",
      label: "民間病院へ事業譲渡する",
      description: "効率化を条件に、運営を民間へ移します。",
      effects: {
        budget: 6,
        economy: 3,
        happiness: -3,
        trust: -4,
      },
      resultMessage: "財政は改善しましたが、一部の診療科が縮小されました。",
    },
    {
      id: "regional-network",
      label: "近隣病院と機能分担する",
      description: "病院ごとに専門分野を分け、重複設備を減らします。",
      effects: {
        budget: -4,
        infrastructure: 5,
        happiness: 3,
        trust: 3,
        congestion: 1,
      },
      resultMessage:
        "医療資源を効率化しましたが、遠方への通院も必要になりました。",
    },
  ],
});

const dataGovernancePolicy = createStrategyPolicy({
  id: "maturity-regular-08",
  title: "行政データの民間利用",
  description:
    "企業から、交通や人流などの行政データを利用したいと提案されました。",
  reason:
    "データ活用は新しいサービスを生みますが、住民のプライバシーを損なう可能性があります。",
  theory: "情報の非対称性・プライバシーゲーム",
  domain: "trust",
  weight: 0.9,
  cooldown: 8,
  repeatable: false,
  actors: ["住民", "IT企業", "市"],
  tags: ["行政データ", "プライバシー", "DX"],
  options: [
    {
      id: "open-data",
      label: "幅広く民間へ公開する",
      description: "利用規制を抑え、新規サービスの創出を優先します。",
      effects: {
        economy: 7,
        infrastructure: 3,
        budget: 2,
        trust: -6,
      },
      resultMessage:
        "新しいサービスが生まれましたが、情報利用への不安が広がりました。",
    },
    {
      id: "controlled-access",
      label: "審査制で利用を認める",
      description: "目的と管理体制を審査し、必要なデータだけを提供します。",
      effects: {
        economy: 4,
        infrastructure: 3,
        trust: 3,
        budget: -2,
      },
      resultMessage: "活用速度は落ちましたが、信頼と利用を両立しました。",
    },
    {
      id: "public-only",
      label: "行政内部だけで利用する",
      description: "住民情報の保護を最優先します。",
      effects: {
        trust: 6,
        infrastructure: 2,
        economy: -2,
        budget: -3,
      },
      resultMessage:
        "プライバシーは守られましたが、民間サービスの機会を逃しました。",
    },
  ],
});

// ==================================================
// 数値選択型の通常政策
// ==================================================

const maintenanceBudgetPolicy = createNumericPolicy({
  id: "maturity-regular-09",
  title: "インフラ維持管理予算",
  description: "道路、橋、水道の点検と修繕へ使う年間予算を決めます。",
  reason:
    "維持費を削ると現在の財政は改善しますが、将来の故障と事故リスクが高まります。",
  theory: "予防投資・時間的不整合",
  domain: "infrastructure",
  weight: 1.4,
  cooldown: 5,
  repeatable: true,
  actors: ["現在の住民", "将来の住民", "市"],
  tags: ["維持管理", "インフラ", "予防投資"],
  valueLabel: "維持管理予算",
  unit: "億円",
  min: 0,
  max: 25,
  step: 1,
  defaultValue: 10,
  getForecast: (value) => {
    if (value <= 6) {
      return "現在の支出は減りますが、老朽化が急速に進みます。";
    }

    if (value <= 15) {
      return "重要設備を優先しながら、老朽化を抑えられます。";
    }

    return "広範囲を更新できますが、他の政策予算を圧迫します。";
  },
  calculateResult: (value, city) => {
    const shortagePenalty = value < 6 && city.infrastructure < 55 ? -5 : 0;

    return {
      effects: {
        budget: -value,
        infrastructure: Math.round(value * 0.65) + shortagePenalty,
        trust: Math.round(value * 0.2),
        happiness: shortagePenalty < 0 ? -3 : 1,
      },
      message: `維持管理へ${value}億円を配分しました。`,
    };
  },
});

const seniorFarePolicy = createNumericPolicy({
  id: "maturity-regular-10",
  title: "高齢者向け交通割引",
  description: "公共交通の高齢者運賃を何％割り引くか決めます。",
  reason:
    "割引は外出を支えますが、交通事業者か市が差額を負担する必要があります。",
  theory: "価格差別・ユニバーサルサービス",
  domain: "transport",
  weight: 1,
  cooldown: 6,
  repeatable: true,
  actors: ["高齢者", "交通会社", "納税者"],
  tags: ["高齢者", "運賃", "交通"],
  valueLabel: "運賃割引率",
  unit: "%",
  min: 0,
  max: 100,
  step: 10,
  defaultValue: 40,
  getForecast: (value) => {
    if (value <= 20) {
      return "財政負担は小さいものの、外出促進効果も限定的です。";
    }

    if (value <= 60) {
      return "利用促進と財政負担を両立しやすい割引率です。";
    }

    return "移動しやすくなりますが、市の補助負担が大きくなります。";
  },
  calculateResult: (value) => {
    const level = value / 10;

    return {
      effects: {
        budget: -Math.round(level * 0.8),
        happiness: Math.round(level * 0.8),
        trust: Math.round(level * 0.5),
        congestion: -Math.round(level * 0.25),
      },
      message: `高齢者運賃を${value}%割り引きました。`,
    };
  },
});

const nursingCarePolicy = createNumericPolicy({
  id: "maturity-regular-11",
  title: "介護人材への定着支援",
  description: "介護職員1人あたりに支給する年間定着支援金を決めます。",
  reason: "待遇改善は人材確保につながりますが、継続的な財源が必要です。",
  theory: "効率賃金・労働市場の外部性",
  domain: "living",
  weight: 1.1,
  cooldown: 6,
  repeatable: true,
  actors: ["介護職員", "高齢者", "介護事業者", "市"],
  tags: ["介護", "人材不足", "賃金"],
  valueLabel: "1人あたり支援金",
  unit: "万円",
  min: 0,
  max: 60,
  step: 5,
  defaultValue: 20,
  getForecast: (value) => {
    if (value <= 10) {
      return "財政負担は軽い一方、人材定着への効果は小さい水準です。";
    }

    if (value <= 35) {
      return "一定の介護人材確保が期待できます。";
    }

    return "待遇は大きく改善しますが、継続的な支出が必要です。";
  },
  calculateResult: (value) => {
    const level = value / 5;

    return {
      effects: {
        budget: -Math.round(level * 0.8),
        happiness: Math.round(level * 0.8),
        trust: Math.round(level * 0.5),
        population: Math.round(level * 15),
        economy: Math.round(level * 0.2),
      },
      message: `介護職員へ年間${value}万円の定着支援金を設定しました。`,
    };
  },
});

const touristTaxPolicy = createNumericPolicy({
  id: "maturity-regular-12",
  title: "宿泊税の金額",
  description: "観光環境の整備に使うため、宿泊者1人あたりの税額を決めます。",
  reason:
    "観光客へ費用負担を求められますが、税額が高いと旅行先として選ばれにくくなります。",
  theory: "受益者負担・価格弾力性",
  domain: "finance",
  weight: 1,
  cooldown: 6,
  repeatable: true,
  actors: ["観光客", "宿泊事業者", "住民", "市"],
  tags: ["宿泊税", "観光", "財源"],
  valueLabel: "1人1泊の宿泊税",
  unit: "円",
  min: 0,
  max: 2000,
  step: 100,
  defaultValue: 500,
  getForecast: (value) => {
    if (value <= 300) {
      return "観光需要への影響は小さい一方、税収も限定的です。";
    }

    if (value <= 1000) {
      return "観光環境の整備財源を安定的に確保できます。";
    }

    return "大きな税収を得られますが、宿泊需要が減る可能性があります。";
  },
  calculateResult: (value) => {
    const level = value / 100;

    return {
      effects: {
        budget: Math.round(level * 0.8),
        environment: Math.round(level * 0.25),
        infrastructure: Math.round(level * 0.2),
        economy: value >= 1300 ? -4 : 1,
        congestion: value >= 1000 ? -2 : 0,
      },
      message: `宿泊税を1人1泊${value}円に設定しました。`,
    };
  },
});

const vacantLandTaxPolicy = createNumericPolicy({
  id: "maturity-regular-13",
  title: "低利用土地への追加課税",
  description: "空き地や長期間使われていない土地へ追加する税率を決めます。",
  reason:
    "追加課税は土地利用を促しますが、資産価値や所有者の事情を無視する場合があります。",
  theory: "土地課税・機会費用",
  domain: "finance",
  weight: 0.9,
  cooldown: 7,
  repeatable: true,
  actors: ["地主", "開発事業者", "住民", "市"],
  tags: ["空き地", "土地税", "再開発"],
  valueLabel: "追加税率",
  unit: "%",
  min: 0,
  max: 10,
  step: 1,
  defaultValue: 3,
  getForecast: (value) => {
    if (value <= 2) {
      return "所有者への影響は小さい一方、土地利用はあまり進みません。";
    }

    if (value <= 6) {
      return "土地の売却や活用を適度に促す税率です。";
    }

    return "利用は進みますが、地主の強い反発が予想されます。";
  },
  calculateResult: (value) => ({
    effects: {
      budget: Math.round(value * 1.2),
      economy: Math.round(value * 0.7),
      population: value * 30,
      trust: value >= 7 ? -5 : 1,
      environment: value >= 7 ? -2 : 0,
    },
    message: `低利用土地へ${value}%の追加課税を設定しました。`,
  }),
});

const parkMaintenancePolicy = createNumericPolicy({
  id: "maturity-regular-14",
  title: "公園の維持管理水準",
  description: "清掃、遊具更新、植栽管理へ使う年間予算を決めます。",
  reason: "公園は無料で利用できますが、管理費を直接回収しにくい公共財です。",
  theory: "公共財供給・フリーライダー問題",
  domain: "environment",
  weight: 0.9,
  cooldown: 6,
  repeatable: true,
  actors: ["公園利用者", "近隣住民", "市"],
  tags: ["公園", "維持管理", "公共財"],
  valueLabel: "公園管理予算",
  unit: "億円",
  min: 0,
  max: 12,
  step: 1,
  defaultValue: 4,
  getForecast: (value) => {
    if (value <= 2) {
      return "支出は抑えられますが、設備と景観の劣化が進みます。";
    }

    if (value <= 7) {
      return "主要公園を安全で快適な状態に維持できます。";
    }

    return "高品質な公園になりますが、利用の少ない施設にも費用がかかります。";
  },
  calculateResult: (value) => ({
    effects: {
      budget: -value,
      environment: Math.round(value * 0.8),
      happiness: Math.round(value * 0.7),
      trust: Math.round(value * 0.25),
      infrastructure: Math.round(value * 0.2),
    },
    message: `公園の維持管理へ${value}億円を配分しました。`,
  }),
});

const floodProtectionPolicy = createNumericPolicy({
  id: "maturity-regular-15",
  title: "浸水対策の更新規模",
  description: "排水設備、堤防、雨水貯留施設の更新へ使う予算を決めます。",
  reason: "被害が起きるまで効果が見えにくく、予算が先送りされやすい分野です。",
  theory: "災害リスク・保険ゲーム",
  domain: "infrastructure",
  weight: 1,
  cooldown: 7,
  repeatable: true,
  actors: ["浸水地域住民", "市民全体", "市"],
  tags: ["水害", "防災", "予防投資"],
  valueLabel: "浸水対策予算",
  unit: "億円",
  min: 0,
  max: 25,
  step: 1,
  defaultValue: 9,
  getForecast: (value) => {
    if (value <= 5) {
      return "目立つ支出は避けられますが、豪雨への対応力が不足します。";
    }

    if (value <= 15) {
      return "被害の大きい地域から優先的に更新できます。";
    }

    return "広域的な安全性が高まりますが、現在の財政を圧迫します。";
  },
  calculateResult: (value) => ({
    effects: {
      budget: -value,
      infrastructure: Math.round(value * 0.6),
      trust: Math.round(value * 0.35),
      environment: Math.round(value * 0.15),
      happiness: Math.round(value * 0.2),
    },
    message: `浸水対策へ${value}億円を投資しました。`,
  }),
});

const culturalBudgetPolicy = createNumericPolicy({
  id: "maturity-regular-16",
  title: "文化施設への年間予算",
  description: "図書館、博物館、劇場などの文化施設へ使う予算を決めます。",
  reason:
    "文化の価値は金銭だけで測りにくく、財政難では削減対象になりやすい分野です。",
  theory: "価値財・公共財供給",
  domain: "living",
  weight: 0.8,
  cooldown: 7,
  repeatable: true,
  actors: ["施設利用者", "芸術団体", "納税者", "市"],
  tags: ["文化", "図書館", "公共施設"],
  valueLabel: "文化予算",
  unit: "億円",
  min: 0,
  max: 15,
  step: 1,
  defaultValue: 5,
  getForecast: (value) => {
    if (value <= 3) {
      return "財政負担は抑えられますが、開館時間や事業が縮小します。";
    }

    if (value <= 9) {
      return "基本的な施設運営と文化事業を維持できます。";
    }

    return "文化活動は充実しますが、利用者が限定されるとの批判も出そうです。";
  },
  calculateResult: (value) => ({
    effects: {
      budget: -value,
      happiness: Math.round(value * 0.75),
      trust: Math.round(value * 0.35),
      economy: Math.round(value * 0.25),
      population: Math.round(value * 10),
    },
    message: `文化施設へ年間${value}億円を配分しました。`,
  }),
});

// 成熟期に出現する通常政策16件
export const maturityPolicies = [
  agingInfrastructurePolicy,
  seniorMobilityPolicy,
  vacantHousePolicy,
  schoolConsolidationPolicy,
  tourismCongestionPolicy,
  inequalityPolicy,
  hospitalReorganizationPolicy,
  dataGovernancePolicy,
  maintenanceBudgetPolicy,
  seniorFarePolicy,
  nursingCarePolicy,
  touristTaxPolicy,
  vacantLandTaxPolicy,
  parkMaintenancePolicy,
  floodProtectionPolicy,
  culturalBudgetPolicy,
];
