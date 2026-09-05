import type { NumericPolicy, StrategyPolicy } from "../../types/game";

function createStrategyPolicy(
  policy: Omit<StrategyPolicy, "type" | "category" | "stages">,
): StrategyPolicy {
  return {
    ...policy,
    type: "strategy",
    category: "regularPolicy",
    stages: ["reorganization"],
  };
}

function createNumericPolicy(
  policy: Omit<NumericPolicy, "type" | "category" | "stages">,
): NumericPolicy {
  return {
    ...policy,
    type: "numeric",
    category: "regularPolicy",
    stages: ["reorganization"],
  };
}

// ==================================================
// 戦略選択型の通常政策
// ==================================================

const compactCityPolicy = createStrategyPolicy({
  id: "reorganization-regular-01",
  title: "縮小する街をどう再配置するか",
  description:
    "人口減少により、郊外まで公共サービスを維持することが難しくなっています。",
  reason:
    "居住地を集約すると効率化できますが、移転する住民に大きな負担が生じます。",
  theory: "集積の経済・補償ゲーム",
  domain: "infrastructure",
  weight: 1.5,
  cooldown: 7,
  repeatable: false,
  actors: ["中心部住民", "郊外住民", "市"],
  tags: ["コンパクトシティ", "移転", "人口減少"],
  options: [
    {
      id: "strong-concentration",
      label: "中心部へ大胆に集約する",
      description: "郊外サービスを縮小し、中心部への移転を促します。",
      effects: {
        budget: 12,
        infrastructure: 8,
        congestion: 5,
        happiness: -7,
        trust: -6,
        population: -250,
      },
      resultMessage:
        "都市運営は効率化しましたが、郊外住民の強い反発を招きました。",
    },
    {
      id: "multiple-centers",
      label: "複数の生活拠点を残す",
      description: "中心部だけでなく、地域ごとに小さな拠点を維持します。",
      effects: {
        budget: -5,
        infrastructure: 5,
        happiness: 5,
        trust: 6,
        congestion: -2,
      },
      resultMessage: "効率化は限定的ですが、地域生活を守ることができました。",
    },
    {
      id: "maintain-suburbs",
      label: "現在の居住地域を維持する",
      description: "費用を負担して、郊外のサービスを残します。",
      effects: {
        budget: -13,
        happiness: 4,
        trust: 4,
        infrastructure: -2,
      },
      resultMessage:
        "住民生活は守られましたが、財政負担がさらに重くなりました。",
    },
  ],
});

const publicFacilityClosurePolicy = createStrategyPolicy({
  id: "reorganization-regular-02",
  title: "利用者が減った公共施設",
  description: "図書館、体育館、公民館の利用者が減り、すべてを維持できません。",
  reason: "施設の便益は利用者に集中しますが、維持費は市民全体が負担します。",
  theory: "公共財供給・多数決ゲーム",
  domain: "finance",
  weight: 1.3,
  cooldown: 7,
  repeatable: true,
  actors: ["施設利用者", "納税者", "地域住民", "市"],
  tags: ["公共施設", "統廃合", "財政"],
  options: [
    {
      id: "usage-priority",
      label: "利用率の低い施設から閉鎖する",
      description: "利用者数を基準に、機械的に施設を選びます。",
      effects: {
        budget: 9,
        infrastructure: -4,
        happiness: -5,
        trust: -3,
      },
      resultMessage: "維持費は減りましたが、少数利用者の居場所が失われました。",
    },
    {
      id: "regional-balance",
      label: "地域ごとに一施設を残す",
      description: "利用率よりも地域間の公平性を優先します。",
      effects: {
        budget: 3,
        infrastructure: 1,
        happiness: 3,
        trust: 5,
      },
      resultMessage: "削減効果は小さいものの、地域間の納得を得られました。",
    },
    {
      id: "multi-purpose",
      label: "複数施設を一か所へ統合する",
      description: "図書館、体育、福祉機能を複合施設へまとめます。",
      effects: {
        budget: -6,
        infrastructure: 6,
        happiness: 3,
        trust: 2,
        congestion: 2,
      },
      resultMessage:
        "初期費用はかかりましたが、機能を残しながら効率化しました。",
    },
  ],
});

const shrinkingTransitPolicy = createStrategyPolicy({
  id: "reorganization-regular-03",
  title: "赤字交通網の再編",
  description:
    "利用者の減った鉄道とバス路線について、交通会社が廃止を求めています。",
  reason: "路線廃止は効率的でも、自動車を使えない住民を孤立させます。",
  theory: "ネットワーク外部性・退出ゲーム",
  domain: "transport",
  weight: 1.3,
  cooldown: 7,
  repeatable: true,
  actors: ["交通会社", "高齢者", "通勤者", "市"],
  tags: ["赤字路線", "交通", "撤退"],
  options: [
    {
      id: "accept-closure",
      label: "赤字路線の廃止を認める",
      description: "需要の多い路線へ経営資源を集中させます。",
      effects: {
        budget: 6,
        infrastructure: -6,
        happiness: -6,
        trust: -5,
        congestion: 5,
      },
      resultMessage:
        "交通事業は効率化しましたが、移動できない住民が増えました。",
    },
    {
      id: "public-subsidy",
      label: "公費で路線を維持する",
      description: "生活に必要な路線として赤字を補填します。",
      effects: {
        budget: -9,
        infrastructure: 4,
        happiness: 6,
        trust: 5,
        congestion: -3,
      },
      resultMessage: "移動手段は守られましたが、補助金が財政を圧迫しました。",
    },
    {
      id: "on-demand-conversion",
      label: "予約制交通へ転換する",
      description: "定時路線を減らし、小型車両を必要時に運行します。",
      effects: {
        budget: -3,
        infrastructure: 2,
        happiness: 3,
        trust: 3,
        congestion: -1,
      },
      resultMessage:
        "利便性は少し下がりましたが、少ない費用で移動手段を残しました。",
    },
  ],
});

const immigrationPolicy = createStrategyPolicy({
  id: "reorganization-regular-04",
  title: "外国人住民の受け入れ",
  description:
    "人手不足を補うため、企業から外国人労働者の受け入れ拡大を求められています。",
  reason:
    "人口と労働力を確保できますが、言語支援や地域統合への投資が必要です。",
  theory: "協調ゲーム・社会的統合",
  domain: "living",
  weight: 1.2,
  cooldown: 8,
  repeatable: true,
  actors: ["外国人住民", "企業", "既存住民", "市"],
  tags: ["外国人", "労働力", "共生"],
  options: [
    {
      id: "labor-only",
      label: "労働者として積極的に受け入れる",
      description: "企業の人手不足解消を優先し、受け入れ人数を増やします。",
      effects: {
        population: 700,
        economy: 7,
        budget: 3,
        trust: -5,
        happiness: -2,
      },
      resultMessage:
        "労働力は増えましたが、生活支援不足による摩擦が起きました。",
    },
    {
      id: "integration-program",
      label: "生活支援とセットで受け入れる",
      description: "日本語教育、相談、子どもの教育も整備します。",
      effects: {
        population: 500,
        economy: 5,
        budget: -6,
        trust: 5,
        happiness: 4,
      },
      resultMessage: "費用はかかりましたが、新しい住民が地域へ定着しました。",
    },
    {
      id: "limited-acceptance",
      label: "受け入れ人数を限定する",
      description: "地域の支援能力に合わせて段階的に受け入れます。",
      effects: {
        population: 200,
        economy: 2,
        budget: -2,
        trust: 2,
      },
      resultMessage: "急激な変化は避けられましたが、人手不足は残りました。",
    },
  ],
});

const decliningShoppingDistrictPolicy = createStrategyPolicy({
  id: "reorganization-regular-05",
  title: "衰退した商業地区の将来",
  description: "かつての商業中心地で閉店が相次ぎ、空き店舗が並んでいます。",
  reason:
    "過去の成功を維持する投資と、新しい用途への転換を比較する必要があります。",
  theory: "サンクコスト・経路依存",
  domain: "industry",
  weight: 1.1,
  cooldown: 7,
  repeatable: false,
  actors: ["商店主", "地主", "住民", "市"],
  tags: ["商店街", "撤退", "用途転換"],
  options: [
    {
      id: "restore-shopping",
      label: "商業地区として再生する",
      description: "改修とイベントで、かつての集客を取り戻します。",
      effects: {
        budget: -10,
        economy: 5,
        happiness: 2,
        trust: 1,
      },
      resultMessage:
        "一定の客足は戻りましたが、以前ほどの需要はありませんでした。",
    },
    {
      id: "residential-conversion",
      label: "住宅と福祉施設へ転換する",
      description: "店舗跡を住宅、診療所、介護施設として利用します。",
      effects: {
        budget: -6,
        population: 300,
        happiness: 5,
        infrastructure: 4,
        economy: 1,
      },
      resultMessage: "商業の中心ではなく、暮らしを支える地区へ変化しました。",
    },
    {
      id: "creative-district",
      label: "創作・起業地区へ転換する",
      description: "低家賃を生かし、若者や小規模事業者を呼び込みます。",
      effects: {
        budget: -5,
        economy: 5,
        population: 200,
        happiness: 3,
        trust: 2,
      },
      resultMessage:
        "小さな事業と文化活動が集まり、新しい地区の個性が生まれました。",
    },
  ],
});

const municipalMergerPolicy = createStrategyPolicy({
  id: "reorganization-regular-06",
  title: "近隣都市との合併提案",
  description:
    "近隣都市から、行政費用を削減するための市町村合併を提案されました。",
  reason:
    "合併は規模の経済を生みますが、自市の意思決定権や地域性が失われます。",
  theory: "連合形成ゲーム・交渉力",
  domain: "finance",
  weight: 1,
  cooldown: 10,
  repeatable: false,
  actors: ["自市", "近隣都市", "両市住民"],
  tags: ["市町村合併", "広域行政", "自治"],
  options: [
    {
      id: "accept-merger",
      label: "合併を受け入れる",
      description: "行政機能を統合し、重複する費用を削減します。",
      effects: {
        budget: 14,
        infrastructure: 5,
        trust: -7,
        happiness: -4,
      },
      resultMessage:
        "財政は改善しましたが、自分たちの街を失ったとの声が上がりました。",
    },
    {
      id: "federated-services",
      label: "行政サービスだけ共同化する",
      description: "市は残し、ごみ処理、消防、システムを共同運営します。",
      effects: {
        budget: 7,
        infrastructure: 4,
        trust: 3,
        happiness: 1,
      },
      resultMessage: "自治を残しながら、重複費用を減らすことができました。",
    },
    {
      id: "remain-independent",
      label: "単独の市として残る",
      description: "費用を負担してでも、独自の意思決定を守ります。",
      effects: {
        budget: -7,
        trust: 6,
        happiness: 3,
      },
      resultMessage: "街の独立性は守られましたが、厳しい財政運営が続きます。",
    },
  ],
});

const legacyIndustryPolicy = createStrategyPolicy({
  id: "reorganization-regular-07",
  title: "衰退産業への追加支援",
  description: "長年街を支えた産業が縮小し、企業と労働者が支援を求めています。",
  reason:
    "雇用を守る支援は必要ですが、将来性の低い産業へ資源を固定する可能性があります。",
  theory: "サンクコスト・退出障壁",
  domain: "industry",
  weight: 1.2,
  cooldown: 7,
  repeatable: true,
  actors: ["既存企業", "労働者", "新産業", "市"],
  tags: ["産業転換", "雇用", "サンクコスト"],
  options: [
    {
      id: "protect-industry",
      label: "補助金で産業を維持する",
      description: "現在の企業と雇用を守ることを優先します。",
      effects: {
        budget: -10,
        economy: 2,
        happiness: 4,
        trust: 3,
      },
      resultMessage: "雇用は守られましたが、産業の根本的な問題は残りました。",
    },
    {
      id: "worker-transition",
      label: "労働者の転職を支援する",
      description: "企業ではなく、職業訓練と所得保障へ支出します。",
      effects: {
        budget: -7,
        economy: 4,
        happiness: 2,
        trust: 5,
        population: -100,
      },
      resultMessage:
        "一部の企業は撤退しましたが、労働者は新しい仕事へ移りました。",
    },
    {
      id: "new-industry-investment",
      label: "新産業へ資金を振り替える",
      description: "既存産業への支援を止め、新しい企業へ投資します。",
      effects: {
        budget: -5,
        economy: 7,
        happiness: -4,
        trust: -3,
        population: -150,
      },
      resultMessage:
        "新産業は育ち始めましたが、取り残された労働者の不満が残りました。",
    },
  ],
});

const natureRestorationPolicy = createStrategyPolicy({
  id: "reorganization-regular-08",
  title: "利用されなくなった郊外開発地",
  description: "人口減少により、道路や宅地だけが残った郊外地区が増えています。",
  reason:
    "利用されない土地を維持し続けるか、費用をかけて自然へ戻すかを選ぶ必要があります。",
  theory: "オプション価値・コモンズ再生",
  domain: "environment",
  weight: 1,
  cooldown: 8,
  repeatable: false,
  actors: ["土地所有者", "環境団体", "郊外住民", "市"],
  tags: ["自然再生", "郊外", "土地利用"],
  options: [
    {
      id: "maintain-land",
      label: "将来の再開発に備えて維持する",
      description: "道路と土地を残し、人口回復の可能性を待ちます。",
      effects: {
        budget: -6,
        infrastructure: 2,
        environment: -3,
        trust: 1,
      },
      resultMessage: "再開発の可能性は残りましたが、維持費がかかり続けました。",
    },
    {
      id: "restore-nature",
      label: "森林や湿地へ戻す",
      description: "不要な設備を撤去し、自然環境を再生します。",
      effects: {
        budget: -8,
        environment: 10,
        infrastructure: -3,
        happiness: 4,
        trust: 3,
      },
      resultMessage: "開発可能性は失いましたが、自然と防災機能が回復しました。",
    },
    {
      id: "community-farmland",
      label: "市民農園へ転換する",
      description: "住民が共同利用できる農地として再整備します。",
      effects: {
        budget: -4,
        environment: 6,
        happiness: 6,
        trust: 5,
        economy: 1,
      },
      resultMessage: "土地が地域交流と小規模生産の場に変わりました。",
    },
  ],
});

// ==================================================
// 数値選択型の通常政策
// ==================================================

const relocationGrantPolicy = createNumericPolicy({
  id: "reorganization-regular-09",
  title: "中心拠点への移転補助",
  description: "郊外から生活拠点周辺へ移転する世帯への補助額を決めます。",
  reason:
    "高い補助は集約を促しますが、移転しない住民との公平性が問題になります。",
  theory: "メカニズムデザイン・補償設計",
  domain: "infrastructure",
  weight: 1.3,
  cooldown: 6,
  repeatable: true,
  actors: ["移転世帯", "郊外住民", "中心部住民", "市"],
  tags: ["移転", "コンパクトシティ", "補助金"],
  valueLabel: "1世帯あたり補助",
  unit: "万円",
  min: 0,
  max: 200,
  step: 10,
  defaultValue: 60,
  getForecast: (value) => {
    if (value <= 30) {
      return "財政負担は小さい一方、自発的な移転はあまり進みません。";
    }

    if (value <= 100) {
      return "一定の移転を促し、公共サービスを集約できます。";
    }

    return "移転は急速に進みますが、公平性と財政負担が問題になります。";
  },
  calculateResult: (value) => {
    const level = value / 10;

    return {
      effects: {
        budget: -Math.round(level * 0.8),
        infrastructure: Math.round(level * 0.6),
        population: -Math.round(level * 5),
        congestion: Math.round(level * 0.2),
        trust: value <= 100 ? Math.round(level * 0.25) : -3,
        happiness: value >= 50 ? 2 : -1,
      },
      message: `移転補助を1世帯あたり${value}万円に設定しました。`,
    };
  },
});

const demolitionBudgetPolicy = createNumericPolicy({
  id: "reorganization-regular-10",
  title: "危険空き家の撤去予算",
  description: "倒壊の危険がある空き家の撤去へ、年間いくら使うか決めます。",
  reason:
    "撤去は周辺環境を改善しますが、所有者が負うべき費用を公費で肩代わりする面があります。",
  theory: "モラルハザード・負の外部性",
  domain: "living",
  weight: 1.1,
  cooldown: 6,
  repeatable: true,
  actors: ["空き家所有者", "近隣住民", "市"],
  tags: ["空き家", "撤去", "安全"],
  valueLabel: "年間撤去予算",
  unit: "億円",
  min: 0,
  max: 15,
  step: 1,
  defaultValue: 5,
  getForecast: (value) => {
    if (value <= 3) {
      return "緊急性の高い建物だけを撤去できます。";
    }

    if (value <= 9) {
      return "危険度の高い地区から計画的に撤去できます。";
    }

    return "改善は速く進みますが、所有者責任を弱める可能性があります。";
  },
  calculateResult: (value) => ({
    effects: {
      budget: -value,
      infrastructure: Math.round(value * 0.55),
      happiness: Math.round(value * 0.6),
      environment: Math.round(value * 0.45),
      trust: value >= 12 ? -1 : Math.round(value * 0.2),
    },
    message: `危険空き家の撤去へ年間${value}億円を配分しました。`,
  }),
});

const busRetentionPolicy = createNumericPolicy({
  id: "reorganization-regular-11",
  title: "赤字バス路線を残す割合",
  description: "現在の赤字路線のうち、市が補助して維持する割合を決めます。",
  reason: "多く残すほど移動機会を守れますが、継続的な赤字補填が必要です。",
  theory: "ユニバーサルサービス・費用分担",
  domain: "transport",
  weight: 1.2,
  cooldown: 6,
  repeatable: true,
  actors: ["交通会社", "沿線住民", "納税者"],
  tags: ["バス", "赤字路線", "交通弱者"],
  valueLabel: "維持する路線",
  unit: "%",
  min: 0,
  max: 100,
  step: 10,
  defaultValue: 50,
  getForecast: (value) => {
    if (value <= 30) {
      return "財政は改善しますが、多くの地域で交通手段が失われます。";
    }

    if (value <= 70) {
      return "重要路線を選別しながら、一定の移動機会を守れます。";
    }

    return "広く交通を維持できますが、赤字補填が財政を圧迫します。";
  },
  calculateResult: (value) => {
    const level = value / 10;

    return {
      effects: {
        budget: -Math.round(level),
        infrastructure: Math.round(level * 0.55),
        happiness: Math.round(level * 0.65),
        trust: Math.round(level * 0.45),
        congestion: -Math.round(level * 0.3),
      },
      message: `赤字バス路線の${value}%を維持することにしました。`,
    };
  },
});

const integrationSupportPolicy = createNumericPolicy({
  id: "reorganization-regular-12",
  title: "外国人住民への生活支援",
  description: "日本語教育、相談窓口、学校支援へ使う予算を決めます。",
  reason: "統合支援は短期的な費用を要しますが、長期的な摩擦を減らします。",
  theory: "反復協調ゲーム・社会関係資本",
  domain: "trust",
  weight: 1,
  cooldown: 6,
  repeatable: true,
  actors: ["外国人住民", "既存住民", "学校", "市"],
  tags: ["多文化共生", "日本語教育", "統合"],
  valueLabel: "共生支援予算",
  unit: "億円",
  min: 0,
  max: 12,
  step: 1,
  defaultValue: 4,
  getForecast: (value) => {
    if (value <= 2) {
      return "受け入れ費用は抑えられますが、地域での摩擦が残ります。";
    }

    if (value <= 7) {
      return "基本的な言語、教育、生活相談を提供できます。";
    }

    return "手厚い支援が可能ですが、既存住民との公平性への説明が必要です。";
  },
  calculateResult: (value, city) => {
    const lowTrustPenalty = city.trust < 40 && value < 4 ? -3 : 0;

    return {
      effects: {
        budget: -value,
        trust: Math.round(value * 0.8) + lowTrustPenalty,
        happiness: Math.round(value * 0.45),
        population: value * 35,
        economy: Math.round(value * 0.3),
      },
      message: `多文化共生支援へ${value}億円を配分しました。`,
    };
  },
});

const debtRepaymentPolicy = createNumericPolicy({
  id: "reorganization-regular-13",
  title: "市債の繰上げ返済",
  description:
    "過去の開発で増えた市債を、今年いくら繰り上げ返済するか決めます。",
  reason: "返済は将来負担を減らしますが、現在使える政策予算も減少します。",
  theory: "異時点間選択・世代間公平",
  domain: "finance",
  weight: 1.1,
  cooldown: 6,
  repeatable: true,
  actors: ["現在の住民", "将来の住民", "金融機関"],
  tags: ["市債", "返済", "財政"],
  valueLabel: "繰上げ返済額",
  unit: "億円",
  min: 0,
  max: 25,
  step: 1,
  defaultValue: 8,
  getForecast: (value) => {
    if (value <= 5) {
      return "現在の政策余力は残りますが、将来の返済負担も残ります。";
    }

    if (value <= 15) {
      return "現在の支出と将来負担を両立しやすい返済額です。";
    }

    return "財政健全化は進みますが、今年の政策余力が大きく減ります。";
  },
  calculateResult: (value, city) => {
    const payment = Math.min(value, Math.max(0, city.budget + 10));

    return {
      effects: {
        budget: -payment,
        trust: Math.round(payment * 0.35),
        economy: payment >= 18 ? -3 : 0,
        happiness: payment >= 18 ? -3 : 0,
      },
      message: `市債を${payment}億円繰り上げ返済しました。`,
    };
  },
});

const facilityReductionPolicy = createNumericPolicy({
  id: "reorganization-regular-14",
  title: "公共施設の削減率",
  description: "今後維持することが難しい公共施設を、何％削減するか決めます。",
  reason:
    "削減率を高めるほど財政は改善しますが、サービスへのアクセスが失われます。",
  theory: "撤退ゲーム・社会的選択",
  domain: "finance",
  weight: 1.2,
  cooldown: 7,
  repeatable: true,
  actors: ["施設利用者", "納税者", "市"],
  tags: ["公共施設", "削減", "再編"],
  valueLabel: "施設削減率",
  unit: "%",
  min: 0,
  max: 50,
  step: 5,
  defaultValue: 15,
  getForecast: (value) => {
    if (value <= 10) {
      return "サービスは守られますが、財政改善は限定的です。";
    }

    if (value <= 30) {
      return "利用率の低い施設を中心に再編できます。";
    }

    return "財政は大きく改善しますが、生活の利便性が低下します。";
  },
  calculateResult: (value) => {
    const level = value / 5;

    return {
      effects: {
        budget: Math.round(level * 1.4),
        infrastructure: -Math.round(level * 0.7),
        happiness: -Math.round(level * 0.75),
        trust: value <= 25 ? 1 : -Math.round(level * 0.5),
      },
      message: `公共施設を${value}%削減する方針を決めました。`,
    };
  },
});

const youthRetentionPolicy = createNumericPolicy({
  id: "reorganization-regular-15",
  title: "若者定着への給付",
  description: "市内で就職・起業する若者へ支給する定着給付額を決めます。",
  reason:
    "給付は人口流出を抑えますが、給付終了後に転出される可能性があります。",
  theory: "シグナリング・補助金依存",
  domain: "industry",
  weight: 1.1,
  cooldown: 6,
  repeatable: true,
  actors: ["若者", "地元企業", "大学", "市"],
  tags: ["若者", "定着", "雇用"],
  valueLabel: "1人あたり給付",
  unit: "万円",
  min: 0,
  max: 100,
  step: 5,
  defaultValue: 25,
  getForecast: (value) => {
    if (value <= 15) {
      return "財政負担は小さい一方、進路選択への影響も限定的です。";
    }

    if (value <= 50) {
      return "一定数の若者が市内就職を選ぶ可能性があります。";
    }

    return "短期的な定着は進みますが、給付目的の移住も増えそうです。";
  },
  calculateResult: (value, city) => {
    const employmentBonus =
      city.economy >= 55 ? Math.round(value * 0.12) : Math.round(value * 0.06);

    return {
      effects: {
        budget: -Math.round(value / 5),
        population: Math.round(value * 5),
        economy: employmentBonus,
        happiness: Math.round(value * 0.05),
        trust: value >= 70 ? -2 : 1,
      },
      message: `若者への定着給付を1人${value}万円に設定しました。`,
    };
  },
});

const renewableDistrictPolicy = createNumericPolicy({
  id: "reorganization-regular-16",
  title: "未利用地の再生可能エネルギー転換",
  description:
    "使われなくなった工業地や宅地のうち、発電用地へ転換する割合を決めます。",
  reason: "エネルギー収入を得られますが、将来別用途へ使う選択肢が減ります。",
  theory: "オプション価値・土地利用ゲーム",
  domain: "environment",
  weight: 0.9,
  cooldown: 7,
  repeatable: true,
  actors: ["土地所有者", "電力会社", "住民", "市"],
  tags: ["未利用地", "再生可能エネルギー", "土地利用"],
  valueLabel: "発電用地への転換率",
  unit: "%",
  min: 0,
  max: 60,
  step: 5,
  defaultValue: 20,
  getForecast: (value) => {
    if (value <= 10) {
      return "土地の選択肢は残りますが、環境と収入への効果は限定的です。";
    }

    if (value <= 35) {
      return "未利用地を活用しながら、将来の土地利用余地も残せます。";
    }

    return "大きな発電収入を得られますが、土地利用が固定されます。";
  },
  calculateResult: (value) => {
    const level = value / 5;

    return {
      effects: {
        budget: Math.round(level * 0.7),
        environment: Math.round(level * 0.9),
        economy: Math.round(level * 0.5),
        infrastructure: Math.round(level * 0.2),
        happiness: value >= 45 ? -2 : 1,
      },
      message: `未利用地の${value}%を再生可能エネルギー用地へ転換しました。`,
    };
  },
});

// 再編期に出現する通常政策16件
export const reorganizationPolicies = [
  compactCityPolicy,
  publicFacilityClosurePolicy,
  shrinkingTransitPolicy,
  immigrationPolicy,
  decliningShoppingDistrictPolicy,
  municipalMergerPolicy,
  legacyIndustryPolicy,
  natureRestorationPolicy,
  relocationGrantPolicy,
  demolitionBudgetPolicy,
  busRetentionPolicy,
  integrationSupportPolicy,
  debtRepaymentPolicy,
  facilityReductionPolicy,
  youthRetentionPolicy,
  renewableDistrictPolicy,
];
