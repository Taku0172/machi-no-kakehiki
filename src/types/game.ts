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

// 政策による街の変化
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
  minimumYear?: number;
  maximumYear?: number;

  minimumPopulation?: number;
  maximumPopulation?: number;

  minimumMetrics?: Partial<Record<CityMetric, number>>;

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

  category?: PolicyCategory;
  domain?: PolicyDomain;

  stages?: DevelopmentStage[];

  conditions?: PolicyConditions;

  weight?: number;

  cooldown?: number;

  repeatable?: boolean;

  actors?: string[];

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

  effects: PolicyEffects;

  resultMessage?: string;
};

export type StrategyPolicy = BasePolicy & {
  type: "strategy";

  options: PolicyOption[];

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

  getForecast: (value: number, city: CityState) => string;

  calculateResult: (value: number, city: CityState) => PolicyResult;
};

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
// 年間財政
// ==================================================

export type AnnualFinanceRecord = {
  developmentModel: DevelopmentModel;

  baseRevenue: number;
  modelRevenue: number;
  taxRevenue: number;

  maintenanceCost: number;
  debtServiceCost: number;

  balance: number;
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
// 政策履歴
// ==================================================

export type HistoryEntry = {
  year: number;
  stage: DevelopmentStage;

  policyId: string;
  policyTitle: string;
  policyType: PolicyType;

  decision: string;
  result: string;

  // 選択した政策そのものの効果
  effects: PolicyEffects;

  // 通常政策を実施した年度の
  // 税収・維持費・収支
  annualFinance?: AnnualFinanceRecord;
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

  currentPolicyId: string | null;

  completedStageStrategies: DevelopmentStage[];

  recentPolicyIds: string[];

  completedPolicyIds: string[];

  developmentModel: DevelopmentModel;

  lastStrategyReviewYear: number;

  strategySwitchCount: number;

  history: HistoryEntry[];

  timeline: TimelinePoint[];

  isFinished: boolean;
};
