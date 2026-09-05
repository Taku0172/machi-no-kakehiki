import type { NumericPolicy, StrategyPolicy } from "../../types/game";

// 創生期の戦略選択政策を作る共通関数
function createStrategyPolicy(
  policy: Omit<StrategyPolicy, "type" | "category" | "stages">,
): StrategyPolicy {
  return {
    ...policy,
    type: "strategy",
    category: "regularPolicy",
    stages: ["creation"],
  };
}

// 創生期の数値選択政策を作る共通関数
function createNumericPolicy(
  policy: Omit<NumericPolicy, "type" | "category" | "stages">,
): NumericPolicy {
  return {
    ...policy,
    type: "numeric",
    category: "regularPolicy",
    stages: ["creation"],
  };
}

// ==================================================
// 戦略選択型の通常政策
// ==================================================

const developmentCostPolicy = createStrategyPolicy({
  id: "creation-regular-01",
  title: "発展費用を誰が負担するか",
  description:
    "道路、水道、公共施設を整備するには財源が必要です。誰を中心に負担を求めますか。",
  reason:
    "創生期の街では、利益を得る主体と費用を負担する主体が一致するとは限りません。",
  theory: "公共財ゲーム・費用分担ゲーム",
  domain: "finance",
  weight: 1.5,
  cooldown: 8,
  repeatable: false,
  actors: ["住民", "企業", "地主", "市"],
  tags: ["税負担", "公共財", "合意形成"],
  options: [
    {
      id: "resident-tax",
      label: "住民が広く負担する",
      description: "住民税を中心に安定した財源を確保します。",
      effects: {
        budget: 12,
        infrastructure: 3,
        happiness: -5,
        trust: -2,
      },
      resultMessage: "財源は安定しましたが、住民の負担感が強まりました。",
    },
    {
      id: "business-tax",
      label: "進出企業へ負担を求める",
      description: "企業負担を増やし、住民の負担を抑えます。",
      effects: {
        budget: 10,
        economy: -3,
        happiness: 2,
        trust: 1,
      },
      resultMessage: "住民には歓迎されましたが、企業誘致が難しくなりました。",
    },
    {
      id: "landowner-charge",
      label: "地主へ開発負担金を求める",
      description: "地価上昇の恩恵を受ける地主に負担を求めます。",
      effects: {
        budget: 9,
        infrastructure: 2,
        trust: -3,
        happiness: 1,
      },
      resultMessage:
        "受益者負担は明確になりましたが、地主との対立が残りました。",
    },
    {
      id: "public-private",
      label: "官民共同で整備する",
      description: "企業に事業機会を渡す代わりに、整備費を分担します。",
      effects: {
        budget: 6,
        economy: 4,
        infrastructure: 4,
        trust: 1,
      },
      resultMessage: "負担を分散しながら、民間の投資を呼び込めました。",
    },
  ],
});

const housingDevelopmentPolicy = createStrategyPolicy({
  id: "creation-regular-02",
  title: "最初の住宅地をどこにつくるか",
  description: "人口を増やすため、新しい住宅地の開発方針を決めます。",
  reason: "住宅地の配置は、将来の交通費用や生活環境を長期的に左右します。",
  theory: "立地ゲーム・集積の経済",
  domain: "living",
  weight: 1.2,
  cooldown: 7,
  repeatable: false,
  actors: ["住民", "不動産会社", "市"],
  tags: ["住宅", "土地利用", "人口"],
  options: [
    {
      id: "suburban",
      label: "郊外へ広く開発する",
      description: "安価な土地を使い、広い住宅を供給します。",
      effects: {
        population: 650,
        happiness: 4,
        infrastructure: -2,
        congestion: 4,
        environment: -4,
      },
      resultMessage: "人口は増えましたが、移動距離とインフラ費用が増えました。",
    },
    {
      id: "compact",
      label: "中心部へ集約する",
      description: "公共施設の周辺へ住宅を集中させます。",
      effects: {
        population: 450,
        infrastructure: 4,
        congestion: 3,
        happiness: -1,
        environment: 2,
      },
      resultMessage: "効率的な街になりましたが、中心部の混雑が始まりました。",
    },
    {
      id: "public-housing",
      label: "市営住宅を整備する",
      description: "市が住宅を供給し、低所得世帯を受け入れます。",
      effects: {
        population: 500,
        budget: -8,
        happiness: 5,
        trust: 4,
        infrastructure: 1,
      },
      resultMessage: "多様な住民を迎えましたが、市の財政負担が増えました。",
    },
  ],
});

const businessAttractionPolicy = createStrategyPolicy({
  id: "creation-regular-03",
  title: "最初の企業をどう呼び込むか",
  description: "雇用と税収を生み出すため、企業誘致の方法を決めます。",
  reason:
    "短期的な誘致競争と、長期的な地域産業育成にはトレードオフがあります。",
  theory: "誘致競争・囚人のジレンマ",
  domain: "industry",
  weight: 1.3,
  cooldown: 7,
  repeatable: true,
  actors: ["市", "大企業", "地元企業"],
  tags: ["企業誘致", "雇用", "産業"],
  options: [
    {
      id: "tax-reduction",
      label: "大型企業へ減税する",
      description: "大きな税制優遇を提示し、早期進出を狙います。",
      effects: {
        economy: 8,
        population: 300,
        budget: -8,
        trust: -2,
        congestion: 2,
      },
      resultMessage: "大型企業が進出しましたが、優遇への不公平感が残りました。",
    },
    {
      id: "local-procurement",
      label: "地元調達を条件にする",
      description: "優遇の代わりに地元企業との取引を求めます。",
      effects: {
        economy: 5,
        budget: -3,
        trust: 3,
        population: 150,
      },
      resultMessage: "成長は緩やかですが、地域内に取引が広がりました。",
    },
    {
      id: "startup-support",
      label: "小さな起業を多数支援する",
      description: "一社に賭けず、複数の新規事業を育てます。",
      effects: {
        economy: 4,
        budget: -5,
        trust: 2,
        happiness: 2,
      },
      resultMessage: "即効性は小さいものの、多様な産業の芽が生まれました。",
    },
  ],
});

const waterManagementPolicy = createStrategyPolicy({
  id: "creation-regular-04",
  title: "水道事業を誰に任せるか",
  description: "人口増加に備えて、水道事業の運営方法を決めます。",
  reason: "料金の低さ、投資効率、供給の安定性を同時に満たすのは困難です。",
  theory: "自然独占・プリンシパル＝エージェント問題",
  domain: "infrastructure",
  weight: 1.1,
  cooldown: 8,
  repeatable: false,
  actors: ["市", "民間企業", "住民"],
  tags: ["水道", "公共サービス", "民営化"],
  options: [
    {
      id: "public-operation",
      label: "市が直接運営する",
      description: "市の責任で料金と供給を管理します。",
      effects: {
        budget: -6,
        infrastructure: 6,
        trust: 4,
        happiness: 2,
      },
      resultMessage: "安定供給への信頼は高まりましたが、財政負担が増えました。",
    },
    {
      id: "private-operation",
      label: "民間企業へ委託する",
      description: "運営権を企業へ渡し、効率化を求めます。",
      effects: {
        budget: 3,
        infrastructure: 4,
        happiness: -2,
        trust: -2,
        economy: 2,
      },
      resultMessage: "費用は抑えられましたが、料金上昇への不安が生まれました。",
    },
    {
      id: "resident-cooperative",
      label: "地域共同組合をつくる",
      description: "住民と市が共同で運営に参加します。",
      effects: {
        budget: -3,
        infrastructure: 3,
        trust: 6,
        happiness: 3,
      },
      resultMessage: "整備は遅れましたが、地域の協力関係が強まりました。",
    },
  ],
});

const localTransportPolicy = createStrategyPolicy({
  id: "creation-regular-05",
  title: "地域交通の最初の一手",
  description: "車を持たない住民の移動手段をどのように確保しますか。",
  reason: "需要が少ない時期の公共交通は、採算性と利用可能性が衝突します。",
  theory: "ネットワーク外部性・待ち合わせゲーム",
  domain: "transport",
  weight: 1.1,
  cooldown: 7,
  repeatable: true,
  actors: ["住民", "交通会社", "市"],
  tags: ["バス", "公共交通", "移動"],
  options: [
    {
      id: "public-bus",
      label: "市営バスを定時運行する",
      description: "利用者が少なくても一定本数を維持します。",
      effects: {
        budget: -7,
        infrastructure: 5,
        happiness: 4,
        congestion: -3,
        environment: 2,
      },
      resultMessage: "移動しやすくなりましたが、赤字路線を抱えました。",
    },
    {
      id: "private-route",
      label: "民間路線へ任せる",
      description: "需要のある区間を中心に運行してもらいます。",
      effects: {
        budget: -1,
        infrastructure: 3,
        economy: 2,
        happiness: -2,
        congestion: -1,
      },
      resultMessage: "中心部は便利になりましたが、郊外に交通空白が残りました。",
    },
    {
      id: "demand-taxi",
      label: "予約制の乗合交通にする",
      description: "予約に応じて小型車両を運行します。",
      effects: {
        budget: -3,
        infrastructure: 3,
        happiness: 3,
        trust: 2,
        congestion: -2,
      },
      resultMessage: "効率と移動手段を両立しましたが、予約の手間が残りました。",
    },
  ],
});

const schoolPlacementPolicy = createStrategyPolicy({
  id: "creation-regular-06",
  title: "学校をどう配置するか",
  description: "子育て世帯の流入に備えて、最初の学校配置を決めます。",
  reason:
    "大規模化による効率と、地域に近い教育環境にはトレードオフがあります。",
  theory: "規模の経済・地域公共財",
  domain: "living",
  weight: 1,
  cooldown: 8,
  repeatable: false,
  actors: ["子育て世帯", "地域住民", "市"],
  tags: ["教育", "学校", "子育て"],
  options: [
    {
      id: "central-school",
      label: "中心部に大規模校を置く",
      description: "設備を一か所へ集約し、運営を効率化します。",
      effects: {
        budget: -6,
        infrastructure: 4,
        population: 250,
        congestion: 3,
        happiness: 1,
      },
      resultMessage: "教育設備は充実しましたが、通学時の混雑が増えました。",
    },
    {
      id: "small-schools",
      label: "各地区に小規模校を置く",
      description: "住民の近くに学校を分散して配置します。",
      effects: {
        budget: -10,
        population: 350,
        happiness: 5,
        trust: 3,
        infrastructure: 2,
      },
      resultMessage:
        "子育て世帯に選ばれる街になりましたが、維持費が増えました。",
    },
    {
      id: "community-school",
      label: "地域施設と学校を共用する",
      description: "図書館や集会所を学校と共同利用します。",
      effects: {
        budget: -5,
        population: 200,
        happiness: 3,
        trust: 5,
        infrastructure: 3,
      },
      resultMessage: "施設を効率化しながら、地域交流が増えました。",
    },
  ],
});

const zoningPolicy = createStrategyPolicy({
  id: "creation-regular-07",
  title: "土地利用の基本ルール",
  description: "住宅、店舗、工場をどのように配置するか決めます。",
  reason: "用途を分けると衝突は減りますが、移動距離が長くなります。",
  theory: "空間ゲーム・負の外部性",
  domain: "infrastructure",
  weight: 1.1,
  cooldown: 9,
  repeatable: false,
  actors: ["住民", "企業", "地主"],
  tags: ["都市計画", "用途地域", "外部性"],
  options: [
    {
      id: "separated-zones",
      label: "用途を明確に分離する",
      description: "住宅地と工業地を離して配置します。",
      effects: {
        infrastructure: 5,
        happiness: 3,
        congestion: 4,
        environment: 2,
        economy: 1,
      },
      resultMessage: "住環境は守られましたが、移動距離が長くなりました。",
    },
    {
      id: "mixed-use",
      label: "住宅と店舗を混在させる",
      description: "徒歩圏内で生活できる街を目指します。",
      effects: {
        infrastructure: 3,
        economy: 3,
        congestion: -2,
        happiness: 2,
        environment: 1,
      },
      resultMessage:
        "便利な街になりましたが、土地利用の調整が複雑になりました。",
    },
    {
      id: "flexible-zoning",
      label: "規制を最小限にする",
      description: "民間の判断に任せ、開発速度を優先します。",
      effects: {
        economy: 6,
        population: 300,
        infrastructure: -2,
        happiness: -3,
        environment: -4,
      },
      resultMessage: "開発は加速しましたが、住民間の利害対立が増えました。",
    },
  ],
});

const disasterGovernancePolicy = createStrategyPolicy({
  id: "creation-regular-08",
  title: "防災の責任をどう分担するか",
  description: "災害への備えを行政、地域、民間のどこが担うか決めます。",
  reason:
    "防災は全員に利益がありますが、各主体には他者へ負担を任せる誘因があります。",
  theory: "公共財ゲーム・フリーライダー問題",
  domain: "trust",
  weight: 1,
  cooldown: 8,
  repeatable: true,
  actors: ["市", "自治会", "保険会社", "住民"],
  tags: ["防災", "責任分担", "公共財"],
  options: [
    {
      id: "government-led",
      label: "行政が全面的に担う",
      description: "税金を使って避難所と備蓄を整えます。",
      effects: {
        budget: -8,
        infrastructure: 5,
        trust: 5,
        happiness: 2,
      },
      resultMessage: "安心感は高まりましたが、行政への依存も強まりました。",
    },
    {
      id: "community-led",
      label: "地域の自主防災を支援する",
      description: "自治会へ資金と訓練機会を提供します。",
      effects: {
        budget: -4,
        trust: 7,
        happiness: 3,
        infrastructure: 2,
      },
      resultMessage: "地域の結束が強まりましたが、地区ごとに差が生まれました。",
    },
    {
      id: "insurance-led",
      label: "保険加入を中心にする",
      description: "民間保険を活用し、行政支出を抑えます。",
      effects: {
        budget: -1,
        economy: 2,
        trust: -2,
        happiness: -1,
      },
      resultMessage:
        "財政負担は抑えられましたが、未加入者への不安が残りました。",
    },
  ],
});

// ==================================================
// 数値選択型の通常政策
// ==================================================

const developmentTaxPolicy = createNumericPolicy({
  id: "creation-regular-09",
  title: "まちづくり税の税率",
  description: "道路や公共施設の整備に使う特別税の税率を決めます。",
  reason: "高い税率は財源を増やしますが、住民と企業の負担も増加します。",
  theory: "公共財供給・最適課税",
  domain: "finance",
  weight: 1.4,
  cooldown: 6,
  repeatable: true,
  actors: ["住民", "企業", "市"],
  tags: ["税率", "財源", "負担"],
  valueLabel: "特別税率",
  unit: "%",
  min: 0,
  max: 20,
  step: 1,
  defaultValue: 7,
  getForecast: (value) => {
    if (value <= 4) {
      return "負担は軽い一方、十分な整備財源を確保できません。";
    }

    if (value <= 10) {
      return "財源と負担のバランスを取りやすい税率です。";
    }

    return "大きな財源を得られますが、反発と経済停滞が予想されます。";
  },
  calculateResult: (value) => {
    const burden = Math.max(0, Math.round((value - 5) / 3));

    return {
      effects: {
        budget: Math.round(value * 1.3),
        infrastructure: Math.round(value / 4),
        happiness: -burden,
        trust: value <= 10 ? 1 : -burden,
        economy: value >= 15 ? -3 : 0,
      },
      message: `特別税率を${value}%に設定しました。`,
    };
  },
});

const roadInvestmentPolicy = createNumericPolicy({
  id: "creation-regular-10",
  title: "生活道路への投資額",
  description: "新しい住宅地を結ぶ生活道路へ、何億円投資するか決めます。",
  reason: "道路整備は利便性を高めますが、財政負担と自動車依存を生みます。",
  theory: "費用便益分析・誘発需要",
  domain: "transport",
  weight: 1.2,
  cooldown: 6,
  repeatable: true,
  actors: ["住民", "建設会社", "市"],
  tags: ["道路", "公共投資", "混雑"],
  valueLabel: "道路投資額",
  unit: "億円",
  min: 0,
  max: 20,
  step: 1,
  defaultValue: 8,
  getForecast: (value) => {
    if (value <= 4) {
      return "財政は守れますが、未舗装区間が多く残ります。";
    }

    if (value <= 12) {
      return "主要な生活道路を優先的に整備できます。";
    }

    return "道路網は急速に整いますが、財政と環境への負担が大きくなります。";
  },
  calculateResult: (value) => ({
    effects: {
      budget: -value,
      infrastructure: Math.round(value * 0.65),
      economy: Math.round(value * 0.2),
      congestion: value >= 14 ? 2 : -Math.round(value * 0.2),
      environment: -Math.round(value * 0.2),
    },
    message: `生活道路へ${value}億円を投資しました。`,
  }),
});

const housingSubsidyPolicy = createNumericPolicy({
  id: "creation-regular-11",
  title: "移住者への住宅補助",
  description: "新しく移住する世帯へ支給する住宅補助額を決めます。",
  reason: "補助金は人口流入を促しますが、既存住民との公平性が問題になります。",
  theory: "補助金競争・選別効果",
  domain: "living",
  weight: 1.1,
  cooldown: 6,
  repeatable: true,
  actors: ["移住者", "既存住民", "不動産会社"],
  tags: ["移住", "住宅", "補助金"],
  valueLabel: "1世帯あたり補助",
  unit: "万円",
  min: 0,
  max: 100,
  step: 5,
  defaultValue: 30,
  getForecast: (value) => {
    if (value <= 15) {
      return "財政負担は小さいものの、移住の決め手にはなりにくい水準です。";
    }

    if (value <= 50) {
      return "一定の人口流入と財政負担が予想されます。";
    }

    return "人口は増えますが、既存住民から不公平との批判が出そうです。";
  },
  calculateResult: (value) => {
    const populationIncrease = Math.round(value * 7);
    const cost = Math.round(value / 5);

    return {
      effects: {
        population: populationIncrease,
        budget: -cost,
        happiness: value <= 50 ? 2 : -2,
        trust: value <= 50 ? 1 : -3,
        congestion: Math.round(value / 25),
      },
      message: `住宅補助を1世帯あたり${value}万円に設定しました。`,
    };
  },
});

const businessSubsidyPolicy = createNumericPolicy({
  id: "creation-regular-12",
  title: "創業支援の予算",
  description: "地域で新しく事業を始める人への支援予算を決めます。",
  reason: "多額の支援は起業を増やしますが、失敗事業にも公費が使われます。",
  theory: "ベンチャー投資・モラルハザード",
  domain: "industry",
  weight: 1.1,
  cooldown: 6,
  repeatable: true,
  actors: ["起業家", "地元企業", "市"],
  tags: ["起業", "産業", "補助金"],
  valueLabel: "創業支援予算",
  unit: "億円",
  min: 0,
  max: 15,
  step: 1,
  defaultValue: 5,
  getForecast: (value) => {
    if (value <= 3) {
      return "小規模な相談支援にとどまります。";
    }

    if (value <= 9) {
      return "複数の新規事業を育成できる水準です。";
    }

    return "起業は増えますが、支援先の審査と監督が難しくなります。";
  },
  calculateResult: (value, city) => {
    const trustBonus = city.trust >= 55 ? 2 : 0;

    return {
      effects: {
        budget: -value,
        economy: Math.round(value * 0.75),
        population: Math.round(value * 20),
        trust: trustBonus,
      },
      message: `創業支援へ${value}億円を配分しました。`,
    };
  },
});

const parkRatioPolicy = createNumericPolicy({
  id: "creation-regular-13",
  title: "開発地に残す緑地の割合",
  description:
    "新しい開発区域のうち、どれだけを公園や緑地として残すか決めます。",
  reason: "緑地は生活環境を高めますが、住宅や事業用地を減らします。",
  theory: "機会費用・環境外部性",
  domain: "environment",
  weight: 1,
  cooldown: 7,
  repeatable: true,
  actors: ["住民", "開発会社", "環境団体"],
  tags: ["公園", "緑地", "開発"],
  valueLabel: "緑地割合",
  unit: "%",
  min: 0,
  max: 40,
  step: 2,
  defaultValue: 16,
  getForecast: (value) => {
    if (value <= 8) {
      return "開発用地は増えますが、環境悪化が予想されます。";
    }

    if (value <= 24) {
      return "開発余地と生活環境を両立しやすい割合です。";
    }

    return "豊かな緑地を確保できますが、開発可能な土地が減少します。";
  },
  calculateResult: (value) => ({
    effects: {
      environment: Math.round(value * 0.35),
      happiness: Math.round(value * 0.18),
      economy: value >= 26 ? -3 : 1,
      population: value >= 30 ? -150 : 100,
      budget: -Math.round(value * 0.15),
    },
    message: `開発区域の${value}%を緑地として確保しました。`,
  }),
});

const wasteFeePolicy = createNumericPolicy({
  id: "creation-regular-14",
  title: "家庭ごみ処理の有料化",
  description: "家庭ごみ袋に設定する料金を決めます。",
  reason:
    "料金を高くするとごみは減りますが、住民負担や不法投棄が増える可能性があります。",
  theory: "ピグー税・負の外部性",
  domain: "environment",
  weight: 1,
  cooldown: 7,
  repeatable: true,
  actors: ["住民", "市", "廃棄物事業者"],
  tags: ["ごみ", "環境税", "外部性"],
  valueLabel: "指定ごみ袋料金",
  unit: "円",
  min: 0,
  max: 100,
  step: 10,
  defaultValue: 30,
  getForecast: (value) => {
    if (value <= 20) {
      return "住民負担は軽い一方、ごみ削減効果は限定的です。";
    }

    if (value <= 60) {
      return "一定のごみ削減と処理財源が期待できます。";
    }

    return "ごみは減りますが、負担感と不法投棄への警戒が必要です。";
  },
  calculateResult: (value) => {
    const chargeLevel = value / 10;

    return {
      effects: {
        budget: Math.round(chargeLevel),
        environment: Math.round(chargeLevel * 0.8),
        happiness: -Math.round(chargeLevel * 0.4),
        trust: value >= 70 ? -3 : 0,
      },
      message: `指定ごみ袋の料金を${value}円に設定しました。`,
    };
  },
});

const digitalGovernmentPolicy = createNumericPolicy({
  id: "creation-regular-15",
  title: "行政デジタル化への投資",
  description: "オンライン申請や行政データ整備へ投じる予算を決めます。",
  reason: "初期投資は必要ですが、将来の行政コストと住民の手間を減らせます。",
  theory: "先行投資・ネットワーク効果",
  domain: "trust",
  weight: 0.9,
  cooldown: 8,
  repeatable: true,
  actors: ["住民", "市職員", "IT企業"],
  tags: ["DX", "行政", "デジタル"],
  valueLabel: "デジタル化予算",
  unit: "億円",
  min: 0,
  max: 12,
  step: 1,
  defaultValue: 4,
  getForecast: (value) => {
    if (value <= 2) {
      return "一部手続きの電子化にとどまります。";
    }

    if (value <= 7) {
      return "主要な申請をオンライン化できる水準です。";
    }

    return "大規模な改革が可能ですが、使いこなせない住民への支援が必要です。";
  },
  calculateResult: (value, city) => {
    const digitalTrust = city.trust >= 45 ? Math.round(value * 0.4) : 0;

    return {
      effects: {
        budget: -value,
        infrastructure: Math.round(value * 0.4),
        economy: Math.round(value * 0.25),
        happiness: Math.round(value * 0.3),
        trust: digitalTrust,
      },
      message: `行政デジタル化へ${value}億円を投資しました。`,
    };
  },
});

const disasterReservePolicy = createNumericPolicy({
  id: "creation-regular-16",
  title: "災害への備蓄予算",
  description: "食料、医薬品、発電設備などの備蓄へ使う予算を決めます。",
  reason:
    "災害が起きなければ成果が見えにくいため、備えは過少になりやすい政策です。",
  theory: "保険ゲーム・時間的不整合",
  domain: "infrastructure",
  weight: 0.9,
  cooldown: 8,
  repeatable: true,
  actors: ["住民", "市", "医療機関"],
  tags: ["防災", "備蓄", "リスク"],
  valueLabel: "備蓄予算",
  unit: "億円",
  min: 0,
  max: 12,
  step: 1,
  defaultValue: 4,
  getForecast: (value) => {
    if (value <= 2) {
      return "平時の財政は守れますが、大規模災害には対応できません。";
    }

    if (value <= 7) {
      return "基本的な避難生活を支えられる備蓄量です。";
    }

    return "高い安心を得られますが、他の政策へ使える予算が減ります。";
  },
  calculateResult: (value) => ({
    effects: {
      budget: -value,
      infrastructure: Math.round(value * 0.45),
      trust: Math.round(value * 0.5),
      happiness: Math.round(value * 0.25),
    },
    message: `災害備蓄へ${value}億円を配分しました。`,
  }),
});

// 創生期に出現する通常政策16件
export const creationPolicies = [
  developmentCostPolicy,
  housingDevelopmentPolicy,
  businessAttractionPolicy,
  waterManagementPolicy,
  localTransportPolicy,
  schoolPlacementPolicy,
  zoningPolicy,
  disasterGovernancePolicy,
  developmentTaxPolicy,
  roadInvestmentPolicy,
  housingSubsidyPolicy,
  businessSubsidyPolicy,
  parkRatioPolicy,
  wasteFeePolicy,
  digitalGovernmentPolicy,
  disasterReservePolicy,
];
