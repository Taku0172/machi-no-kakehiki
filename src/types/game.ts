// ==================================================
// 街の発展段階
// ==================================================

export type DevelopmentStage =
  | "creation"
  | "growth"
  | "expansion"
  | "maturity"
  | "reorganization";

// ==================================================
// 街の基本状態
// ==================================================

export type CityState = {
  year: number;
  stage: DevelopmentStage;

  population: number;
  budget: number;
  economy: number;
  infrastructure: number;
  happiness: number;
  trust: number;
  congestion: number;
  environment: number;
};

// 年度・発展段階以外の数値項目
export type CityMetric = Exclude<keyof CityState, "year" | "stage">;

// 政策による街の増減
export type PolicyEffects = Partial<Record<CityMetric, number>>;

// ==================================================
// 街の評価ポイント
// ==================================================

export type CityScoreKey =
  | "transport"
  | "industry"
  | "living"
  | "environment"
  | "finance"
  | "trust"
  | "overall";

export type CityScores = Record<CityScoreKey, number>;

// ==================================================
// 政策の分類
// ==================================================

export type PolicyType = "strategy" | "numeric";

export type PolicyCategory =
  | "stageStrategy"
  | "regularPolicy"
  | "strategyReview";

export type PolicyDomain =
  | "transport"
  | "industry"
  | "living"
  | "environment"
  | "finance"
  | "trust"
  | "infrastructure";

// ==================================================
// 政策の発生条件
// ==================================================

export type PolicyConditions = {
  // 表示できる最初と最後の年度
  minimumYear?: number;
  maximumYear?: number;

  // 人口条件
  minimumPopulation?: number;
  maximumPopulation?: number;

  // 各指標の最低条件
  minimumMetrics?: Partial<Record<CityMetric, number>>;

  // 各指標の最大条件
  maximumMetrics?: Partial<Record<CityMetric, number>>;
};

// ==================================================
// すべての政策が共通して持つ情報
// ==================================================

export type BasePolicy = {
  id: string;
  type: PolicyType;

  title: string;
  description: string;
  reason: string;
  theory: string;

  // 完成版で使用する政策情報
  category?: PolicyCategory;
  domain?: PolicyDomain;

  // 表示できる発展段階
  stages?: DevelopmentStage[];

  // 発生条件
  conditions?: PolicyConditions;

  // 数値が大きい政策ほど出やすくなる
  weight?: number;

  // 一度出た後、再登場まで空ける年数
  cooldown?: number;

  // 複数回出せる政策か
  repeatable?: boolean;

  // 関係する主体
  actors?: string[];

  // 都市史や検索に使う分類
  tags?: string[];
};

// ==================================================
// 政策実行後の結果
// ==================================================

export type PolicyResult = {
  effects: PolicyEffects;
  message: string;
};

// ==================================================
// 戦略選択型の政策
// ==================================================

export type PolicyOption = {
  id: string;
  label: string;
  description: string;

  // この選択肢を選んだ場合の効果
  effects: PolicyEffects;

  // 政策結果に表示する文章
  resultMessage?: string;
};

export type StrategyPolicy = BasePolicy & {
  type: "strategy";
  options: PolicyOption[];

  // 街の状態によって結果を変える場合に使用する
  calculateResult?: (option: PolicyOption, city: CityState) => PolicyResult;
};

// ==================================================
// 数値選択型の政策
// ==================================================

export type NumericPolicy = BasePolicy & {
  type: "numeric";

  valueLabel: string;
  unit: string;

  min: number;
  max: number;
  step: number;
  defaultValue: number;

  // バーを動かしたときに表示する予測
  getForecast: (value: number, city: CityState) => string;

  // 政策実行時の結果
  calculateResult: (value: number, city: CityState) => PolicyResult;
};

// 戦略政策と数値政策の共通型
export type Policy = StrategyPolicy | NumericPolicy;

// ==================================================
// 都市の成長モデル
// ==================================================

export type DevelopmentModel = "industry" | "tourism" | "living";

export type DevelopmentModelData = {
  id: DevelopmentModel;
  name: string;
  shortName: string;
  description: string;
};

// ==================================================
// ゲームの進行状態
// ==================================================

export type GamePhase =
  | "stageStrategy"
  | "strategyReview"
  | "regularPolicy"
  | "result"
  | "finished";

// ==================================================
// 都市史
// ==================================================

export type HistoryEntry = {
  year: number;
  stage: DevelopmentStage;

  policyId: string;
  policyTitle: string;
  policyType: PolicyType;

  decision: string;
  result: string;

  effects: PolicyEffects;
};

// ==================================================
// 折れ線グラフ用の時系列データ
// ==================================================

export type TimelinePoint = {
  year: number;

  population: number;
  budget: number;
  economy: number;
  infrastructure: number;
  happiness: number;
  trust: number;
  congestion: number;
  environment: number;

  scores: CityScores;
};

// ==================================================
// ゲーム全体のセーブデータ
// ==================================================

export type GameState = {
  city: CityState;
  phase: GamePhase;

  // 現在表示している政策
  currentPolicyId: string | null;

  // 発展段階ごとの都市戦略を実行したか
  completedStageStrategies: DevelopmentStage[];

  // 最近表示した通常政策
  recentPolicyIds: string[];

  // すでに実行した政策
  completedPolicyIds: string[];

  // 現在採用している成長モデル
  developmentModel: DevelopmentModel;

  // 最後に成長モデルを見直した年度
  lastStrategyReviewYear: number;

  // 成長モデルを変更した回数
  strategySwitchCount: number;

  // 都市史
  history: HistoryEntry[];

  // 折れ線グラフ用データ
  timeline: TimelinePoint[];

  // 50年間のゲームが終了したか
  isFinished: boolean;
};
