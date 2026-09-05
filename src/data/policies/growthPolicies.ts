import type { NumericPolicy, StrategyPolicy } from "../../types/game";

// 成長期の戦略選択政策を作る共通関数
function createStrategyPolicy(
  policy: Omit<StrategyPolicy, "type" | "category" | "stages">,
): StrategyPolicy {
  return {
    ...policy,
    type: "strategy",
    category: "regularPolicy",
    stages: ["growth"],
  };
}

// 成長期の数値選択政策を作る共通関数
function createNumericPolicy(
  policy: Omit<NumericPolicy, "type" | "category" | "stages">,
): NumericPolicy {
  return {
    ...policy,
    type: "numeric",
    category: "regularPolicy",
    stages: ["growth"],
  };
}

// ==================================================
// 戦略選択型の通常政策
// ==================================================

const anchorCompanyPolicy = createStrategyPolicy({
  id: "growth-regular-01",
  title: "中核企業からの追加要求",
  description:
    "進出を検討する大企業が、税制優遇と専用道路の整備を求めています。",
  reason:
    "大企業の進出は大きな利益を生みますが、交渉力の差によって市側が譲歩しすぎる可能性があります。",
  theory: "交渉ゲーム・ホールドアップ問題",
  domain: "industry",
  weight: 1.4,
  cooldown: 8,
  repeatable: true,
  actors: ["大企業", "地元企業", "住民", "市"],
  tags: ["企業誘致", "交渉", "雇用"],
  options: [
    {
      id: "accept-all",
      label: "要求を全面的に受け入れる",
      description: "進出を最優先し、税制優遇と道路整備を約束します。",
      effects: {
        economy: 10,
        population: 500,
        budget: -12,
        infrastructure: 4,
        trust: -4,
        congestion: 4,
      },
      resultMessage:
        "大企業は進出しましたが、市側が譲歩しすぎたとの批判が出ました。",
    },
    {
      id: "counter-offer",
      label: "雇用条件と引き換えに譲歩する",
      description: "地元雇用と地元調達を条件に、一部の優遇を認めます。",
      effects: {
        economy: 7,
        population: 350,
        budget: -6,
        trust: 3,
        congestion: 2,
      },
      resultMessage: "交渉はまとまり、地域へ利益が波及する条件も確保しました。",
    },
    {
      id: "reject-demand",
      label: "要求を拒否して地元企業を育てる",
      description: "大企業への依存を避け、地域産業へ投資します。",
      effects: {
        economy: 3,
        budget: -4,
        trust: 4,
        happiness: 2,
      },
      resultMessage: "急成長の機会は逃しましたが、地域の自立性が高まりました。",
    },
  ],
});

const stationRedevelopmentPolicy = createStrategyPolicy({
  id: "growth-regular-02",
  title: "駅前再開発の主導権",
  description: "駅前の再開発を、行政と民間のどちらが主導するか決めます。",
  reason: "民間主導は速い一方、公共性の低い開発になる可能性があります。",
  theory: "官民連携・プリンシパル＝エージェント問題",
  domain: "infrastructure",
  weight: 1.2,
  cooldown: 8,
  repeatable: false,
  actors: ["市", "鉄道会社", "不動産会社", "商店"],
  tags: ["駅前", "再開発", "官民連携"],
  options: [
    {
      id: "city-led",
      label: "市が計画を主導する",
      description: "公共広場や交通結節点を優先して整備します。",
      effects: {
        budget: -10,
        infrastructure: 8,
        happiness: 4,
        trust: 3,
        congestion: -2,
      },
      resultMessage: "公共性の高い駅前になりましたが、多額の公費を使いました。",
    },
    {
      id: "private-led",
      label: "民間事業者へ任せる",
      description: "商業施設を中心とした迅速な開発を認めます。",
      effects: {
        economy: 8,
        budget: 2,
        infrastructure: 4,
        congestion: 5,
        environment: -3,
      },
      resultMessage:
        "駅前は活気づきましたが、混雑と商業偏重が問題になりました。",
    },
    {
      id: "resident-participation",
      label: "住民参加で計画をつくる",
      description: "時間をかけて住民、商店、事業者の合意を形成します。",
      effects: {
        budget: -5,
        infrastructure: 5,
        trust: 7,
        happiness: 4,
        economy: 2,
      },
      resultMessage: "開発速度は落ちましたが、幅広い合意を得られました。",
    },
  ],
});

const workerHousingPolicy = createStrategyPolicy({
  id: "growth-regular-03",
  title: "急増する労働者の住宅",
  description: "企業進出で増えた労働者の住居が不足しています。",
  reason:
    "住宅供給を市場だけに任せると、家賃上昇や居住地域の分断が起こる可能性があります。",
  theory: "住宅市場・混雑ゲーム",
  domain: "living",
  weight: 1.3,
  cooldown: 7,
  repeatable: true,
  actors: ["労働者", "不動産会社", "既存住民"],
  tags: ["住宅不足", "家賃", "人口流入"],
  options: [
    {
      id: "company-dormitories",
      label: "企業に社宅整備を求める",
      description: "雇用する企業に住宅確保の責任を持たせます。",
      effects: {
        population: 450,
        budget: 1,
        economy: 4,
        happiness: -1,
        trust: 1,
      },
      resultMessage:
        "住宅不足は緩和しましたが、企業中心の居住区が生まれました。",
    },
    {
      id: "public-rental",
      label: "公共賃貸住宅を建てる",
      description: "市が家賃を抑えた住宅を供給します。",
      effects: {
        population: 550,
        budget: -10,
        happiness: 5,
        trust: 4,
        infrastructure: 2,
      },
      resultMessage:
        "幅広い世帯が住めるようになりましたが、維持費が増えました。",
    },
    {
      id: "market-deregulation",
      label: "建築規制を緩和する",
      description: "民間住宅の供給速度を優先します。",
      effects: {
        population: 700,
        economy: 4,
        budget: 2,
        environment: -5,
        congestion: 5,
        happiness: -2,
      },
      resultMessage: "住宅は急増しましたが、無秩序な開発が進みました。",
    },
  ],
});

const localSupplierPolicy = createStrategyPolicy({
  id: "growth-regular-04",
  title: "公共調達を誰に任せるか",
  description:
    "公共施設の建設を、安価な大手企業と地元企業のどちらへ発注するか決めます。",
  reason:
    "最低価格での調達と、地域経済への波及効果は一致しないことがあります。",
  theory: "オークション・地域内乗数効果",
  domain: "industry",
  weight: 1,
  cooldown: 7,
  repeatable: true,
  actors: ["大手企業", "地元企業", "市"],
  tags: ["公共調達", "入札", "地元企業"],
  options: [
    {
      id: "lowest-bid",
      label: "最低価格の企業へ発注する",
      description: "企業所在地に関係なく、最も安い入札を選びます。",
      effects: {
        budget: -4,
        infrastructure: 5,
        economy: 1,
        trust: 1,
      },
      resultMessage: "費用を抑えられましたが、利益の多くは地域外へ流れました。",
    },
    {
      id: "local-preference",
      label: "地元企業を優先する",
      description: "価格が少し高くても地域内の企業へ発注します。",
      effects: {
        budget: -7,
        infrastructure: 4,
        economy: 5,
        trust: 3,
      },
      resultMessage: "費用は増えましたが、地域内の雇用と取引が広がりました。",
    },
    {
      id: "joint-venture",
      label: "大手と地元の共同受注にする",
      description: "技術力と地域への波及を両立させます。",
      effects: {
        budget: -6,
        infrastructure: 6,
        economy: 4,
        trust: 2,
      },
      resultMessage: "大手の技術が地元企業へ共有されました。",
    },
  ],
});

const medicalExpansionPolicy = createStrategyPolicy({
  id: "growth-regular-05",
  title: "医療体制をどう拡大するか",
  description: "人口増加に対して診療所と病床が不足しています。",
  reason:
    "大病院への集中は効率的ですが、地域医療へのアクセスが悪化する場合があります。",
  theory: "規模の経済・アクセスの公平性",
  domain: "living",
  weight: 1.1,
  cooldown: 8,
  repeatable: false,
  actors: ["患者", "病院", "診療所", "市"],
  tags: ["医療", "病院", "公平性"],
  options: [
    {
      id: "central-hospital",
      label: "中核病院へ集中投資する",
      description: "高度な設備を持つ大規模病院を整備します。",
      effects: {
        budget: -12,
        infrastructure: 7,
        happiness: 4,
        population: 200,
        congestion: 3,
      },
      resultMessage: "高度医療は充実しましたが、病院周辺に患者が集中しました。",
    },
    {
      id: "local-clinics",
      label: "地域診療所を増やす",
      description: "各地区で日常的な診療を受けられるようにします。",
      effects: {
        budget: -8,
        happiness: 6,
        trust: 4,
        infrastructure: 3,
      },
      resultMessage: "身近な医療へのアクセスが改善しました。",
    },
    {
      id: "online-medical",
      label: "オンライン診療を支援する",
      description: "デジタル技術で医師不足を補います。",
      effects: {
        budget: -4,
        happiness: 3,
        infrastructure: 3,
        economy: 2,
        trust: 1,
      },
      resultMessage: "効率は上がりましたが、対面診療を望む住民も残りました。",
    },
  ],
});

const childcarePolicy = createStrategyPolicy({
  id: "growth-regular-06",
  title: "保育需要の急増",
  description: "子育て世帯の流入により、保育施設が不足しています。",
  reason: "保育サービスの供給方法によって、費用、質、利用機会が変わります。",
  theory: "割当問題・準市場",
  domain: "living",
  weight: 1.2,
  cooldown: 7,
  repeatable: true,
  actors: ["保護者", "保育事業者", "市"],
  tags: ["保育", "子育て", "待機児童"],
  options: [
    {
      id: "public-nurseries",
      label: "公立保育所を増設する",
      description: "市が直接、安定した保育サービスを供給します。",
      effects: {
        budget: -9,
        happiness: 6,
        trust: 4,
        population: 250,
      },
      resultMessage:
        "待機児童は減りましたが、継続的な運営費が必要になりました。",
    },
    {
      id: "private-vouchers",
      label: "民間利用へ補助券を出す",
      description: "保護者が複数の民間施設から選べるようにします。",
      effects: {
        budget: -6,
        economy: 3,
        happiness: 4,
        population: 200,
        trust: 1,
      },
      resultMessage: "選択肢は増えましたが、施設ごとの質に差が生まれました。",
    },
    {
      id: "company-childcare",
      label: "企業内保育を促す",
      description: "一定規模以上の企業に保育環境の整備を求めます。",
      effects: {
        budget: -2,
        economy: 2,
        happiness: 3,
        population: 150,
        trust: 2,
      },
      resultMessage:
        "市の負担は抑えられましたが、勤め先による格差が残りました。",
    },
  ],
});

const regionalCooperationPolicy = createStrategyPolicy({
  id: "growth-regular-07",
  title: "近隣都市からの共同事業提案",
  description: "近隣都市が、ごみ処理施設と交通網の共同運営を提案しています。",
  reason: "協力すれば費用を削減できますが、利益配分を巡る対立が生まれます。",
  theory: "協調ゲーム・利益配分",
  domain: "infrastructure",
  weight: 1,
  cooldown: 9,
  repeatable: false,
  actors: ["自市", "近隣都市", "住民"],
  tags: ["広域連携", "協力", "費用分担"],
  options: [
    {
      id: "full-cooperation",
      label: "全面的に共同運営する",
      description: "施設と交通網を一体的に管理します。",
      effects: {
        budget: 7,
        infrastructure: 6,
        environment: 3,
        trust: -2,
      },
      resultMessage: "効率化できましたが、市の裁量が小さくなりました。",
    },
    {
      id: "limited-cooperation",
      label: "ごみ処理だけ共同化する",
      description: "合意しやすい事業に限定して協力します。",
      effects: {
        budget: 3,
        infrastructure: 3,
        environment: 3,
        trust: 1,
      },
      resultMessage: "小さな協力から始め、安定した関係を築きました。",
    },
    {
      id: "independent-operation",
      label: "単独運営を続ける",
      description: "費用が増えても、市独自の判断を守ります。",
      effects: {
        budget: -5,
        trust: 3,
        infrastructure: 1,
      },
      resultMessage: "市の独立性は守られましたが、運営費が増えました。",
    },
  ],
});

const tourismIdentityPolicy = createStrategyPolicy({
  id: "growth-regular-08",
  title: "街の観光ブランド",
  description: "知名度を上げるため、どの観光イメージを前面に出すか決めます。",
  reason:
    "観光客に分かりやすいブランドは集客に有効ですが、街の多様性を単純化する場合があります。",
  theory: "シグナリングゲーム・差別化戦略",
  domain: "industry",
  weight: 0.9,
  cooldown: 8,
  repeatable: false,
  actors: ["観光客", "商店", "住民", "市"],
  tags: ["観光", "ブランド", "地域資源"],
  options: [
    {
      id: "festival-brand",
      label: "祭りと歴史を売り出す",
      description: "伝統行事を街の中心的なブランドにします。",
      effects: {
        economy: 5,
        trust: 3,
        happiness: 3,
        congestion: 3,
      },
      resultMessage: "観光客が増え、地域文化への関心も高まりました。",
    },
    {
      id: "nature-brand",
      label: "自然と環境を売り出す",
      description: "公園や自然環境を観光資源として整備します。",
      effects: {
        economy: 3,
        environment: 5,
        happiness: 3,
        budget: -3,
      },
      resultMessage: "急増ではありませんが、環境と調和した観光が育ちました。",
    },
    {
      id: "business-brand",
      label: "産業都市として売り出す",
      description: "展示会や企業交流を中心に来訪者を増やします。",
      effects: {
        economy: 7,
        budget: -4,
        congestion: 4,
        happiness: -1,
      },
      resultMessage: "企業交流は増えましたが、住民向けの魅力は弱まりました。",
    },
  ],
});

// ==================================================
// 数値選択型の通常政策
// ==================================================

const corporateTaxReductionPolicy = createNumericPolicy({
  id: "growth-regular-09",
  title: "企業誘致の減税期間",
  description: "新しく進出する企業の法人関連税を何年間軽減するか決めます。",
  reason:
    "長期間の減税は進出を促しますが、企業が定着しなければ税収を失うだけになります。",
  theory: "租税競争・逐次ゲーム",
  domain: "finance",
  weight: 1.2,
  cooldown: 6,
  repeatable: true,
  actors: ["進出企業", "既存企業", "市"],
  tags: ["企業誘致", "減税", "税収"],
  valueLabel: "減税期間",
  unit: "年",
  min: 0,
  max: 10,
  step: 1,
  defaultValue: 3,
  getForecast: (value) => {
    if (value <= 2) {
      return "税収は守れますが、他都市との誘致競争では弱い条件です。";
    }

    if (value <= 5) {
      return "誘致効果と将来税収を両立しやすい期間です。";
    }

    return "企業進出は増えますが、長期間の税収減少が見込まれます。";
  },
  calculateResult: (value) => ({
    effects: {
      economy: Math.round(value * 1.2),
      population: value * 45,
      budget: -Math.round(value * 1.4),
      trust: value >= 7 ? -3 : 0,
    },
    message: `進出企業の減税期間を${value}年に設定しました。`,
  }),
});

const busFrequencyPolicy = createNumericPolicy({
  id: "growth-regular-10",
  title: "幹線バスの運行本数",
  description: "住宅地と駅を結ぶ幹線バスを、1時間に何本運行するか決めます。",
  reason:
    "本数が増えるほど便利になりますが、利用者が少ない時間帯の赤字も増えます。",
  theory: "ネットワーク外部性・混雑ゲーム",
  domain: "transport",
  weight: 1.2,
  cooldown: 6,
  repeatable: true,
  actors: ["通勤者", "交通会社", "市"],
  tags: ["バス", "運行頻度", "交通"],
  valueLabel: "1時間あたり本数",
  unit: "本",
  min: 1,
  max: 12,
  step: 1,
  defaultValue: 5,
  getForecast: (value) => {
    if (value <= 3) {
      return "運営費は抑えられますが、待ち時間が長くなります。";
    }

    if (value <= 7) {
      return "利便性と運営費のバランスが取れた本数です。";
    }

    return "非常に便利ですが、空車運行と財政負担が増えます。";
  },
  calculateResult: (value, city) => {
    const demandBonus = city.population >= 10000 ? 2 : 0;

    return {
      effects: {
        budget: -Math.round(value * 0.8),
        infrastructure: Math.round(value * 0.6),
        happiness: Math.round(value * 0.45),
        congestion: -Math.round(value * 0.5),
        environment: Math.round(value * 0.2),
        economy: demandBonus,
      },
      message: `幹線バスを1時間あたり${value}本に設定しました。`,
    };
  },
});

const classSizePolicy = createNumericPolicy({
  id: "growth-regular-11",
  title: "学校の学級人数",
  description: "公立学校の1学級あたりの上限人数を決めます。",
  reason:
    "少人数教育は学習環境を改善しますが、教員と教室が多く必要になります。",
  theory: "公共サービスの質・費用最小化",
  domain: "living",
  weight: 1,
  cooldown: 7,
  repeatable: true,
  actors: ["児童", "保護者", "教員", "市"],
  tags: ["教育", "学級人数", "財政"],
  valueLabel: "1学級の上限",
  unit: "人",
  min: 20,
  max: 40,
  step: 2,
  defaultValue: 30,
  getForecast: (value) => {
    if (value <= 24) {
      return "教育環境は改善しますが、多数の教員と教室が必要です。";
    }

    if (value <= 32) {
      return "教育の質と費用を両立しやすい人数です。";
    }

    return "費用は抑えられますが、教室の過密化が進みます。";
  },
  calculateResult: (value) => {
    const quality = Math.round((40 - value) / 2);
    const cost = Math.round((40 - value) * 0.45);

    return {
      effects: {
        budget: -cost,
        happiness: quality,
        trust: Math.round(quality * 0.5),
        population: quality * 20,
      },
      message: `1学級の上限を${value}人に設定しました。`,
    };
  },
});

const shoppingStreetSupportPolicy = createNumericPolicy({
  id: "growth-regular-12",
  title: "商店街への改修補助",
  description: "空き店舗の改修費を、市が何割補助するか決めます。",
  reason:
    "補助率が高いほど出店は増えますが、自力で投資する意欲を弱める可能性があります。",
  theory: "補助金設計・モラルハザード",
  domain: "industry",
  weight: 1,
  cooldown: 6,
  repeatable: true,
  actors: ["商店主", "新規出店者", "市"],
  tags: ["商店街", "空き店舗", "補助率"],
  valueLabel: "改修費補助率",
  unit: "%",
  min: 0,
  max: 80,
  step: 10,
  defaultValue: 30,
  getForecast: (value) => {
    if (value <= 20) {
      return "財政負担は軽い一方、出店促進効果は限定的です。";
    }

    if (value <= 50) {
      return "民間負担を残しながら、出店を後押しできます。";
    }

    return "出店は増えますが、補助金頼みの事業も増える可能性があります。";
  },
  calculateResult: (value) => {
    const level = value / 10;

    return {
      effects: {
        budget: -Math.round(level * 1.2),
        economy: Math.round(level * 1.1),
        happiness: Math.round(level * 0.5),
        trust: value >= 70 ? -2 : 1,
      },
      message: `空き店舗の改修費を${value}%補助することにしました。`,
    };
  },
});

const sewerInvestmentPolicy = createNumericPolicy({
  id: "growth-regular-13",
  title: "下水道整備への投資",
  description: "人口増加に対応するため、下水道へ投じる予算を決めます。",
  reason:
    "地下インフラは成果が見えにくい一方、整備不足は将来大きな問題になります。",
  theory: "インフラ投資・世代間負担",
  domain: "infrastructure",
  weight: 1.2,
  cooldown: 6,
  repeatable: true,
  actors: ["住民", "企業", "市"],
  tags: ["下水道", "公共投資", "衛生"],
  valueLabel: "下水道予算",
  unit: "億円",
  min: 0,
  max: 20,
  step: 1,
  defaultValue: 8,
  getForecast: (value) => {
    if (value <= 4) {
      return "財政は守れますが、人口増加に処理能力が追いつきません。";
    }

    if (value <= 12) {
      return "主要地区の処理能力を安定させられます。";
    }

    return "将来余力まで確保できますが、現在の財政負担が大きくなります。";
  },
  calculateResult: (value) => ({
    effects: {
      budget: -value,
      infrastructure: Math.round(value * 0.7),
      environment: Math.round(value * 0.4),
      happiness: Math.round(value * 0.2),
    },
    message: `下水道整備へ${value}億円を投資しました。`,
  }),
});

const renewableEnergyPolicy = createNumericPolicy({
  id: "growth-regular-14",
  title: "公共施設の再生可能エネルギー比率",
  description:
    "公共施設で使用する電力のうち、再生可能エネルギーの割合を決めます。",
  reason: "環境負荷は減りますが、導入初期には設備費や調達費が必要です。",
  theory: "環境外部性・技術採用ゲーム",
  domain: "environment",
  weight: 0.9,
  cooldown: 7,
  repeatable: true,
  actors: ["市", "電力会社", "住民"],
  tags: ["再生可能エネルギー", "環境", "公共施設"],
  valueLabel: "再エネ比率",
  unit: "%",
  min: 0,
  max: 100,
  step: 10,
  defaultValue: 30,
  getForecast: (value) => {
    if (value <= 20) {
      return "費用は抑えられますが、環境改善は限定的です。";
    }

    if (value <= 60) {
      return "費用を管理しながら再エネ転換を進められます。";
    }

    return "大幅な環境改善が期待できますが、導入費用も大きくなります。";
  },
  calculateResult: (value) => {
    const level = value / 10;

    return {
      effects: {
        budget: -Math.round(level * 0.8),
        environment: Math.round(level * 1.2),
        infrastructure: Math.round(level * 0.3),
        trust: Math.round(level * 0.3),
        economy: value >= 70 ? 2 : 0,
      },
      message: `公共施設の再エネ比率を${value}%に設定しました。`,
    };
  },
});

const festivalBudgetPolicy = createNumericPolicy({
  id: "growth-regular-15",
  title: "地域祭りの開催予算",
  description: "街の知名度と住民交流を高める祭りへ、いくら支出するか決めます。",
  reason:
    "祭りは交流と消費を生みますが、一時的なイベントへの公費投入には批判もあります。",
  theory: "コーディネーションゲーム・シグナリング",
  domain: "trust",
  weight: 0.9,
  cooldown: 8,
  repeatable: true,
  actors: ["住民", "商店", "観光客", "市"],
  tags: ["祭り", "観光", "地域交流"],
  valueLabel: "開催予算",
  unit: "億円",
  min: 0,
  max: 10,
  step: 1,
  defaultValue: 3,
  getForecast: (value) => {
    if (value <= 2) {
      return "小規模な地域行事として開催できます。";
    }

    if (value <= 6) {
      return "市外からの来訪者も期待できる規模です。";
    }

    return "大きな集客が見込めますが、混雑と公費負担も増えます。";
  },
  calculateResult: (value) => ({
    effects: {
      budget: -value,
      economy: Math.round(value * 0.8),
      happiness: Math.round(value * 0.9),
      trust: Math.round(value * 0.6),
      congestion: Math.round(value * 0.5),
    },
    message: `地域祭りへ${value}億円を配分しました。`,
  }),
});

const municipalBondPolicy = createNumericPolicy({
  id: "growth-regular-16",
  title: "成長投資のための市債発行",
  description: "将来の税収増を見込み、いくら市債を発行するか決めます。",
  reason:
    "借入によって現在の投資を増やせますが、将来世代に返済負担が残ります。",
  theory: "異時点間選択・世代間ゲーム",
  domain: "finance",
  weight: 1,
  cooldown: 8,
  repeatable: true,
  actors: ["現在の住民", "将来の住民", "金融機関"],
  tags: ["市債", "借入", "世代間負担"],
  valueLabel: "市債発行額",
  unit: "億円",
  min: 0,
  max: 30,
  step: 2,
  defaultValue: 10,
  getForecast: (value) => {
    if (value <= 6) {
      return "財政規律を保てますが、大規模投資は難しい水準です。";
    }

    if (value <= 18) {
      return "成長投資を進めつつ、返済可能性を保ちやすい水準です。";
    }

    return "現在の投資余力は増えますが、将来の返済負担が重くなります。";
  },
  calculateResult: (value, city) => {
    const repaymentRisk = value >= 20 && city.budget < 30 ? -4 : 0;

    return {
      effects: {
        budget: value,
        infrastructure: Math.round(value * 0.25),
        economy: Math.round(value * 0.15),
        trust: repaymentRisk,
      },
      message: `成長投資のため、市債を${value}億円発行しました。`,
    };
  },
});

// 成長期に出現する通常政策16件
export const growthPolicies = [
  anchorCompanyPolicy,
  stationRedevelopmentPolicy,
  workerHousingPolicy,
  localSupplierPolicy,
  medicalExpansionPolicy,
  childcarePolicy,
  regionalCooperationPolicy,
  tourismIdentityPolicy,
  corporateTaxReductionPolicy,
  busFrequencyPolicy,
  classSizePolicy,
  shoppingStreetSupportPolicy,
  sewerInvestmentPolicy,
  renewableEnergyPolicy,
  festivalBudgetPolicy,
  municipalBondPolicy,
];
