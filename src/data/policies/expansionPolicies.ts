import type { NumericPolicy, StrategyPolicy } from "../../types/game";

function createStrategyPolicy(
  policy: Omit<StrategyPolicy, "type" | "category" | "stages">,
): StrategyPolicy {
  return {
    ...policy,
    type: "strategy",
    category: "regularPolicy",
    stages: ["expansion"],
  };
}

function createNumericPolicy(
  policy: Omit<NumericPolicy, "type" | "category" | "stages">,
): NumericPolicy {
  return {
    ...policy,
    type: "numeric",
    category: "regularPolicy",
    stages: ["expansion"],
  };
}

// ==================================================
// 戦略選択型の通常政策
// ==================================================

const congestionStrategyPolicy = createStrategyPolicy({
  id: "expansion-regular-01",
  title: "深刻化する中心部の渋滞",
  description: "通勤時間帯の渋滞が深刻化しています。街の交通方針を決めます。",
  reason:
    "道路を増やすだけでは自動車利用も増え、再び混雑する可能性があります。",
  theory: "混雑ゲーム・誘発需要",
  domain: "transport",
  weight: 1.5,
  cooldown: 7,
  repeatable: true,
  actors: ["自動車利用者", "公共交通利用者", "市"],
  tags: ["渋滞", "道路", "公共交通"],
  options: [
    {
      id: "road-expansion",
      label: "幹線道路を拡幅する",
      description: "車線を増やし、短期的な交通容量を拡大します。",
      effects: {
        budget: -12,
        infrastructure: 8,
        congestion: -5,
        environment: -6,
        economy: 3,
      },
      resultMessage:
        "渋滞は一時的に改善しましたが、自動車交通がさらに増えました。",
    },
    {
      id: "public-transport",
      label: "公共交通へ転換する",
      description: "鉄道とバスを強化し、自動車利用を減らします。",
      effects: {
        budget: -10,
        infrastructure: 6,
        congestion: -9,
        environment: 5,
        happiness: 3,
      },
      resultMessage: "移動手段の転換が進み、混雑と環境負荷が軽減しました。",
    },
    {
      id: "distributed-work",
      label: "職場と業務拠点を分散する",
      description: "郊外拠点とテレワークを支援し、移動需要を減らします。",
      effects: {
        budget: -5,
        economy: 4,
        congestion: -6,
        environment: 3,
        infrastructure: 2,
      },
      resultMessage: "中心部への一極集中が緩み、移動需要そのものが減りました。",
    },
  ],
});

const risingRentPolicy = createStrategyPolicy({
  id: "expansion-regular-02",
  title: "地価上昇と住民の立ち退き",
  description:
    "再開発地域で家賃が上昇し、以前からの住民が住み続けられなくなっています。",
  reason:
    "再開発による利益と、居住者が負担する立ち退き費用は公平に配分されません。",
  theory: "ジェントリフィケーション・補償ゲーム",
  domain: "living",
  weight: 1.3,
  cooldown: 8,
  repeatable: true,
  actors: ["既存住民", "地主", "開発会社", "市"],
  tags: ["家賃", "再開発", "立ち退き"],
  options: [
    {
      id: "rent-control",
      label: "家賃上昇を規制する",
      description: "既存住宅の急激な家賃上昇を抑えます。",
      effects: {
        happiness: 6,
        trust: 5,
        economy: -3,
        population: 150,
      },
      resultMessage: "住民は残れましたが、新規住宅投資が減少しました。",
    },
    {
      id: "relocation-compensation",
      label: "立ち退き補償を充実させる",
      description: "開発を認める代わりに、移転費用と代替住宅を保障します。",
      effects: {
        budget: -7,
        economy: 4,
        happiness: 2,
        trust: 3,
        population: -100,
      },
      resultMessage: "開発と補償を両立しましたが、一部の住民は街を離れました。",
    },
    {
      id: "market-priority",
      label: "市場の動きを優先する",
      description: "規制せず、高付加価値な開発を促進します。",
      effects: {
        economy: 8,
        budget: 5,
        happiness: -6,
        trust: -5,
        population: -250,
      },
      resultMessage:
        "税収と投資は増えましたが、街から押し出される住民が増えました。",
    },
  ],
});

const logisticsHubPolicy = createStrategyPolicy({
  id: "expansion-regular-03",
  title: "大規模物流拠点の誘致",
  description:
    "物流会社が、高速道路沿いへの巨大配送拠点の建設を提案しています。",
  reason: "雇用と物流効率を生む一方、大型車の交通と環境負荷が集中します。",
  theory: "立地ゲーム・負の外部性",
  domain: "industry",
  weight: 1.1,
  cooldown: 8,
  repeatable: false,
  actors: ["物流会社", "周辺住民", "小売企業", "市"],
  tags: ["物流", "雇用", "大型車"],
  options: [
    {
      id: "accept-logistics",
      label: "条件を付けず誘致する",
      description: "迅速な建設を認め、雇用と税収を優先します。",
      effects: {
        economy: 9,
        budget: 6,
        population: 250,
        congestion: 8,
        environment: -7,
        happiness: -3,
      },
      resultMessage: "物流産業は成長しましたが、大型車と騒音が急増しました。",
    },
    {
      id: "environmental-conditions",
      label: "環境対策を条件に認める",
      description: "低公害車両と夜間走行制限を求めます。",
      effects: {
        economy: 6,
        budget: 3,
        congestion: 4,
        environment: -2,
        trust: 3,
      },
      resultMessage: "事業規模は縮小しましたが、住民との合意を得られました。",
    },
    {
      id: "reject-logistics",
      label: "誘致を断る",
      description: "住環境を守り、別の産業の成長を待ちます。",
      effects: {
        economy: -2,
        environment: 5,
        happiness: 4,
        trust: 2,
      },
      resultMessage: "雇用機会は逃しましたが、地域の生活環境を守りました。",
    },
  ],
});

const regionalRailPolicy = createStrategyPolicy({
  id: "expansion-regular-04",
  title: "近隣都市との鉄道延伸",
  description: "近隣都市から、両市を結ぶ鉄道路線の共同建設を提案されました。",
  reason:
    "共同事業では全体利益が増えても、駅の位置や費用負担を巡って対立します。",
  theory: "協調ゲーム・ナッシュ交渉",
  domain: "transport",
  weight: 1.2,
  cooldown: 9,
  repeatable: false,
  actors: ["自市", "近隣都市", "鉄道会社"],
  tags: ["鉄道", "広域連携", "費用分担"],
  options: [
    {
      id: "central-station",
      label: "中心駅への直結を求める",
      description: "市の利益を優先し、中心部へ路線を引き込みます。",
      effects: {
        budget: -12,
        economy: 8,
        infrastructure: 7,
        congestion: 3,
        trust: -2,
      },
      resultMessage: "市内経済は伸びましたが、近隣都市との関係が悪化しました。",
    },
    {
      id: "balanced-route",
      label: "両市に公平な経路を選ぶ",
      description: "所要時間よりも利益配分の公平性を重視します。",
      effects: {
        budget: -9,
        economy: 6,
        infrastructure: 7,
        trust: 5,
        congestion: -3,
      },
      resultMessage:
        "両市が納得する路線となり、長期的な協力関係が生まれました。",
    },
    {
      id: "decline-rail",
      label: "財政負担を理由に断る",
      description: "既存交通の改善を優先します。",
      effects: {
        budget: 3,
        infrastructure: -1,
        trust: -1,
        congestion: 2,
      },
      resultMessage: "支出は避けられましたが、広域交通の機会を逃しました。",
    },
  ],
});

const wasteFacilityPolicy = createStrategyPolicy({
  id: "expansion-regular-05",
  title: "新しいごみ処理施設の建設地",
  description: "ごみの増加により、新しい処理施設が必要になりました。",
  reason:
    "施設は街全体に必要ですが、建設地域だけが負担を受けやすい問題があります。",
  theory: "NIMBY問題・補償ゲーム",
  domain: "environment",
  weight: 1.2,
  cooldown: 8,
  repeatable: false,
  actors: ["候補地区住民", "市民全体", "市"],
  tags: ["ごみ処理", "NIMBY", "補償"],
  options: [
    {
      id: "low-cost-location",
      label: "最も安い場所へ建てる",
      description: "補償を抑え、建設費用を最小化します。",
      effects: {
        budget: -6,
        infrastructure: 6,
        environment: 2,
        trust: -7,
        happiness: -4,
      },
      resultMessage: "施設は完成しましたが、建設地域との対立が深まりました。",
    },
    {
      id: "compensation-package",
      label: "地域補償とセットで建てる",
      description: "公園や地域施設も整備し、負担地域へ利益を返します。",
      effects: {
        budget: -12,
        infrastructure: 7,
        environment: 3,
        trust: 4,
        happiness: 2,
      },
      resultMessage: "費用は増えましたが、地域との合意を形成できました。",
    },
    {
      id: "distributed-processing",
      label: "小型施設へ分散する",
      description: "複数地区で少量ずつ処理し、負担を分散します。",
      effects: {
        budget: -10,
        infrastructure: 5,
        environment: 5,
        trust: 3,
      },
      resultMessage: "効率は下がりましたが、負担の集中を避けられました。",
    },
  ],
});

const heatIslandPolicy = createStrategyPolicy({
  id: "expansion-regular-06",
  title: "都市の暑さへの対応",
  description:
    "市街地の気温上昇により、住民の健康と電力消費への影響が出ています。",
  reason:
    "即効性のある対策と、長期的な都市構造の改善では費用と効果が異なります。",
  theory: "共有資源問題・環境外部性",
  domain: "environment",
  weight: 1.1,
  cooldown: 7,
  repeatable: true,
  actors: ["住民", "建物所有者", "市"],
  tags: ["ヒートアイランド", "緑化", "健康"],
  options: [
    {
      id: "cooling-centers",
      label: "冷房避難施設を増やす",
      description: "公共施設を暑さから避難できる場所として開放します。",
      effects: {
        budget: -5,
        happiness: 5,
        trust: 4,
        environment: -1,
      },
      resultMessage:
        "健康被害を抑えましたが、都市の暑さ自体は解消していません。",
    },
    {
      id: "street-trees",
      label: "街路樹と日陰を増やす",
      description: "道路空間を使って、長期的に気温を下げます。",
      effects: {
        budget: -8,
        environment: 8,
        happiness: 5,
        infrastructure: 2,
        congestion: 1,
      },
      resultMessage: "時間はかかりましたが、歩きやすく涼しい街へ近づきました。",
    },
    {
      id: "building-standards",
      label: "建物へ断熱基準を課す",
      description: "新築建物に高い省エネ性能を求めます。",
      effects: {
        environment: 6,
        economy: -2,
        trust: 2,
        infrastructure: 3,
      },
      resultMessage: "将来の電力消費は減りましたが、建築費が上昇しました。",
    },
  ],
});

const stadiumPolicy = createStrategyPolicy({
  id: "expansion-regular-07",
  title: "大型スタジアムの建設提案",
  description:
    "スポーツクラブが、市の支援を条件に新スタジアム建設を提案しています。",
  reason: "集客効果は期待できますが、利益予測が外れると市が損失を負担します。",
  theory: "楽観バイアス・官民リスク分担",
  domain: "industry",
  weight: 0.9,
  cooldown: 10,
  repeatable: false,
  actors: ["スポーツクラブ", "住民", "商店", "市"],
  tags: ["スタジアム", "スポーツ", "大型事業"],
  options: [
    {
      id: "public-stadium",
      label: "市が建設費を負担する",
      description: "大型施設を建設し、集客効果を狙います。",
      effects: {
        budget: -18,
        economy: 9,
        happiness: 6,
        infrastructure: 3,
        congestion: 7,
        trust: -2,
      },
      resultMessage: "街の知名度は上がりましたが、巨額の公費負担が残りました。",
    },
    {
      id: "private-risk",
      label: "民間の自己負担を求める",
      description: "市は周辺整備だけを行い、事業リスクを民間に持たせます。",
      effects: {
        budget: -5,
        economy: 5,
        happiness: 3,
        infrastructure: 3,
        congestion: 3,
        trust: 3,
      },
      resultMessage: "規模は縮小しましたが、市のリスクを抑えられました。",
    },
    {
      id: "community-sports",
      label: "地域スポーツ施設へ分散投資する",
      description: "大型施設ではなく、住民が使う複数施設を整備します。",
      effects: {
        budget: -9,
        happiness: 7,
        trust: 5,
        infrastructure: 4,
        economy: 1,
      },
      resultMessage: "大きな集客はありませんが、住民の利用機会が増えました。",
    },
  ],
});

const waterShortagePolicy = createStrategyPolicy({
  id: "expansion-regular-08",
  title: "人口増加による水不足",
  description:
    "人口と工場の増加により、水道供給が需要に追いつかなくなっています。",
  reason: "水は全員に必要ですが、節水努力を他者に任せる誘因があります。",
  theory: "共有地の悲劇・資源配分ゲーム",
  domain: "infrastructure",
  weight: 1.2,
  cooldown: 7,
  repeatable: true,
  actors: ["住民", "工場", "農家", "市"],
  tags: ["水不足", "資源配分", "節水"],
  options: [
    {
      id: "new-reservoir",
      label: "新しい貯水施設を建設する",
      description: "供給量を増やし、現在の利用方法を維持します。",
      effects: {
        budget: -14,
        infrastructure: 9,
        environment: -5,
        happiness: 3,
      },
      resultMessage: "供給量は増えましたが、自然環境への影響が残りました。",
    },
    {
      id: "industry-restrictions",
      label: "工場の使用量を制限する",
      description: "生活用水を優先し、産業用水を削減します。",
      effects: {
        economy: -5,
        infrastructure: 3,
        happiness: 5,
        trust: 3,
        environment: 3,
      },
      resultMessage: "生活用水は守られましたが、工場の生産が落ち込みました。",
    },
    {
      id: "recycled-water",
      label: "再生水設備へ投資する",
      description: "使用済みの水を処理し、工業用途へ再利用します。",
      effects: {
        budget: -10,
        infrastructure: 7,
        environment: 6,
        economy: 2,
        trust: 2,
      },
      resultMessage: "初期費用はかかりましたが、供給と環境を両立しました。",
    },
  ],
});

// ==================================================
// 数値選択型の通常政策
// ==================================================

const congestionChargePolicy = createNumericPolicy({
  id: "expansion-regular-09",
  title: "中心部への混雑料金",
  description: "混雑時間帯に中心部へ入る自動車から徴収する料金を決めます。",
  reason: "料金は渋滞を減らしますが、車を必要とする人への負担になります。",
  theory: "混雑料金・ピグー税",
  domain: "transport",
  weight: 1.4,
  cooldown: 6,
  repeatable: true,
  actors: ["自動車利用者", "公共交通利用者", "商店"],
  tags: ["混雑料金", "渋滞", "課金"],
  valueLabel: "1回あたり料金",
  unit: "円",
  min: 0,
  max: 2000,
  step: 100,
  defaultValue: 500,
  getForecast: (value) => {
    if (value <= 300) {
      return "負担は小さいものの、交通行動はあまり変わりません。";
    }

    if (value <= 1000) {
      return "一定の自動車利用が公共交通へ移ると予想されます。";
    }

    return "渋滞は大きく減りますが、商店と自動車利用者の反発が強まります。";
  },
  calculateResult: (value) => {
    const level = value / 100;

    return {
      effects: {
        budget: Math.round(level * 0.7),
        congestion: -Math.round(level * 0.8),
        environment: Math.round(level * 0.5),
        happiness: -Math.round(level * 0.3),
        trust: value >= 1200 ? -4 : 0,
        economy: value >= 1600 ? -3 : 0,
      },
      message: `中心部への混雑料金を${value}円に設定しました。`,
    };
  },
});

const parkingFeePolicy = createNumericPolicy({
  id: "expansion-regular-10",
  title: "市営駐車場の料金",
  description: "中心部にある市営駐車場の1時間料金を決めます。",
  reason: "安い駐車料金は来訪を促しますが、自動車流入と道路混雑を増やします。",
  theory: "価格メカニズム・需要管理",
  domain: "transport",
  weight: 1,
  cooldown: 6,
  repeatable: true,
  actors: ["買い物客", "商店", "公共交通利用者"],
  tags: ["駐車場", "料金", "中心市街地"],
  valueLabel: "1時間料金",
  unit: "円",
  min: 0,
  max: 1000,
  step: 50,
  defaultValue: 300,
  getForecast: (value) => {
    if (value <= 200) {
      return "中心部へ車で訪れやすい一方、混雑が悪化します。";
    }

    if (value <= 600) {
      return "来訪機会を保ちながら、自動車流入を抑えられます。";
    }

    return "混雑は減りますが、中心部の商店への来客も減る可能性があります。";
  },
  calculateResult: (value) => {
    const level = value / 100;

    return {
      effects: {
        budget: Math.round(level),
        congestion: -Math.round(level * 0.7),
        environment: Math.round(level * 0.3),
        economy: value < 200 ? 2 : value > 700 ? -3 : 1,
        happiness: value >= 800 ? -2 : 0,
      },
      message: `市営駐車場を1時間${value}円に設定しました。`,
    };
  },
});

const railwayInvestmentPolicy = createNumericPolicy({
  id: "expansion-regular-11",
  title: "都市鉄道への追加投資",
  description: "車両、駅、線路の改良へ投じる予算を決めます。",
  reason:
    "鉄道投資は多くの利用者に利益を与えますが、整備には大きな固定費が必要です。",
  theory: "ネットワーク外部性・固定費",
  domain: "transport",
  weight: 1.2,
  cooldown: 7,
  repeatable: true,
  actors: ["通勤者", "鉄道会社", "市"],
  tags: ["鉄道", "公共投資", "混雑"],
  valueLabel: "鉄道投資額",
  unit: "億円",
  min: 0,
  max: 30,
  step: 2,
  defaultValue: 10,
  getForecast: (value) => {
    if (value <= 6) {
      return "老朽設備の部分的な改善にとどまります。";
    }

    if (value <= 18) {
      return "輸送力と駅の利便性を着実に改善できます。";
    }

    return "大幅な輸送力向上が見込めますが、財政負担も大きくなります。";
  },
  calculateResult: (value, city) => {
    const demandBonus = city.population >= 12000 ? Math.round(value * 0.15) : 0;

    return {
      effects: {
        budget: -value,
        infrastructure: Math.round(value * 0.55),
        congestion: -Math.round(value * 0.4),
        environment: Math.round(value * 0.2),
        economy: demandBonus,
        happiness: Math.round(value * 0.15),
      },
      message: `都市鉄道へ${value}億円を投資しました。`,
    };
  },
});

const affordableHousingPolicy = createNumericPolicy({
  id: "expansion-regular-12",
  title: "再開発住宅の低価格枠",
  description: "新しい集合住宅のうち、低価格住宅として確保する割合を決めます。",
  reason: "低価格枠は居住の公平性を高めますが、開発事業者の収益を減らします。",
  theory: "包摂的ゾーニング・公平性と効率性",
  domain: "living",
  weight: 1.1,
  cooldown: 7,
  repeatable: true,
  actors: ["低所得世帯", "開発会社", "地主", "市"],
  tags: ["住宅", "家賃", "公平性"],
  valueLabel: "低価格住宅枠",
  unit: "%",
  min: 0,
  max: 50,
  step: 5,
  defaultValue: 20,
  getForecast: (value) => {
    if (value <= 10) {
      return "民間開発は進みますが、低所得世帯向け住宅は不足します。";
    }

    if (value <= 30) {
      return "開発利益と居住の公平性を両立しやすい割合です。";
    }

    return "多くの住宅を確保できますが、民間開発が減る可能性があります。";
  },
  calculateResult: (value) => {
    const level = value / 5;

    return {
      effects: {
        happiness: Math.round(level * 0.8),
        trust: Math.round(level * 0.7),
        population: Math.round(level * 30),
        economy: value >= 35 ? -4 : 1,
        budget: -Math.round(level * 0.5),
      },
      message: `再開発住宅の${value}%を低価格住宅として確保しました。`,
    };
  },
});

const emissionReductionPolicy = createNumericPolicy({
  id: "expansion-regular-13",
  title: "工場の排出削減目標",
  description: "市内工場へ求める温室効果ガスの削減率を決めます。",
  reason:
    "厳しい目標は環境を改善しますが、企業の設備負担と撤退リスクを高めます。",
  theory: "環境規制・共有地の悲劇",
  domain: "environment",
  weight: 1.2,
  cooldown: 6,
  repeatable: true,
  actors: ["工場", "住民", "環境団体", "市"],
  tags: ["排出規制", "工場", "環境"],
  valueLabel: "排出削減率",
  unit: "%",
  min: 0,
  max: 60,
  step: 5,
  defaultValue: 20,
  getForecast: (value) => {
    if (value <= 10) {
      return "企業負担は小さい一方、環境改善も限定的です。";
    }

    if (value <= 35) {
      return "設備更新を促しながら、産業への影響を抑えられます。";
    }

    return "環境は大きく改善しますが、一部企業が撤退する可能性があります。";
  },
  calculateResult: (value, city) => {
    const level = value / 5;
    const economicDamage =
      value >= 40 && city.economy < 65
        ? -Math.round(level * 0.7)
        : -Math.round(level * 0.3);

    return {
      effects: {
        environment: Math.round(level * 1.1),
        economy: economicDamage,
        trust: Math.round(level * 0.4),
        budget: Math.round(level * 0.2),
      },
      message: `工場へ${value}%の排出削減を求めました。`,
    };
  },
});

const rooftopGreeningPolicy = createNumericPolicy({
  id: "expansion-regular-14",
  title: "屋上緑化への補助率",
  description: "建物の屋上緑化費用を、市がどれだけ補助するか決めます。",
  reason: "補助率が高いほど導入は進みますが、公費に依存する事業者も増えます。",
  theory: "正の外部性・補助金設計",
  domain: "environment",
  weight: 0.9,
  cooldown: 7,
  repeatable: true,
  actors: ["建物所有者", "住民", "市"],
  tags: ["屋上緑化", "補助金", "暑さ対策"],
  valueLabel: "緑化費用補助率",
  unit: "%",
  min: 0,
  max: 80,
  step: 10,
  defaultValue: 30,
  getForecast: (value) => {
    if (value <= 20) {
      return "財政負担は軽い一方、導入できる建物は限られます。";
    }

    if (value <= 50) {
      return "民間負担を残しながら緑化を広げられます。";
    }

    return "緑化は急速に進みますが、市の補助負担が増えます。";
  },
  calculateResult: (value) => {
    const level = value / 10;

    return {
      effects: {
        budget: -Math.round(level * 0.9),
        environment: Math.round(level),
        happiness: Math.round(level * 0.5),
        infrastructure: Math.round(level * 0.25),
        trust: value >= 70 ? -1 : 1,
      },
      message: `屋上緑化費用の${value}%を補助しました。`,
    };
  },
});

const securityCameraPolicy = createNumericPolicy({
  id: "expansion-regular-15",
  title: "公共空間の防犯カメラ",
  description: "駅や繁華街へ設置する防犯カメラの台数を決めます。",
  reason: "安全性の向上と、監視されない自由の間にはトレードオフがあります。",
  theory: "監視ゲーム・プライバシーの外部性",
  domain: "trust",
  weight: 0.9,
  cooldown: 7,
  repeatable: true,
  actors: ["住民", "警察", "商店", "市"],
  tags: ["防犯", "監視", "プライバシー"],
  valueLabel: "追加設置台数",
  unit: "台",
  min: 0,
  max: 200,
  step: 20,
  defaultValue: 60,
  getForecast: (value) => {
    if (value <= 40) {
      return "プライバシーへの影響は小さい一方、防犯範囲も限定的です。";
    }

    if (value <= 120) {
      return "主要な公共空間を中心に防犯体制を強化できます。";
    }

    return "広範囲を監視できますが、市民の警戒感が強まります。";
  },
  calculateResult: (value) => {
    const level = value / 20;

    return {
      effects: {
        budget: -Math.round(level * 0.5),
        happiness: Math.round(level * 0.5),
        trust:
          value <= 120 ? Math.round(level * 0.4) : -Math.round(level * 0.3),
        infrastructure: Math.round(level * 0.2),
      },
      message: `公共空間へ防犯カメラを${value}台追加しました。`,
    };
  },
});

const touristBusLimitPolicy = createNumericPolicy({
  id: "expansion-regular-16",
  title: "観光バスの中心部乗り入れ上限",
  description: "中心部へ1日に乗り入れられる観光バスの上限台数を決めます。",
  reason:
    "上限を緩くすると観光収入は増えますが、交通と住環境への負担も増えます。",
  theory: "容量制約・コモンズ問題",
  domain: "transport",
  weight: 0.9,
  cooldown: 7,
  repeatable: true,
  actors: ["観光客", "観光事業者", "住民", "市"],
  tags: ["観光バス", "混雑", "観光"],
  valueLabel: "1日の上限",
  unit: "台",
  min: 10,
  max: 150,
  step: 10,
  defaultValue: 70,
  getForecast: (value) => {
    if (value <= 40) {
      return "住環境は守られますが、観光事業者の収入が減少します。";
    }

    if (value <= 100) {
      return "観光収入と交通負担を両立しやすい上限です。";
    }

    return "多くの観光客を受け入れられますが、混雑が悪化します。";
  },
  calculateResult: (value) => {
    const level = value / 10;

    return {
      effects: {
        economy: Math.round(level * 0.7),
        budget: Math.round(level * 0.3),
        congestion: Math.round(level * 0.6),
        environment: -Math.round(level * 0.3),
        happiness: value >= 120 ? -3 : 1,
      },
      message: `観光バスの乗り入れ上限を1日${value}台に設定しました。`,
    };
  },
});

// 拡大期に出現する通常政策16件
export const expansionPolicies = [
  congestionStrategyPolicy,
  risingRentPolicy,
  logisticsHubPolicy,
  regionalRailPolicy,
  wasteFacilityPolicy,
  heatIslandPolicy,
  stadiumPolicy,
  waterShortagePolicy,
  congestionChargePolicy,
  parkingFeePolicy,
  railwayInvestmentPolicy,
  affordableHousingPolicy,
  emissionReductionPolicy,
  rooftopGreeningPolicy,
  securityCameraPolicy,
  touristBusLimitPolicy,
];
