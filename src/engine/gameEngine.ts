import { createInitialCityState } from "../data/initialCityState";

import {
    findPolicyById,
    regularPolicyCatalog,
    stageStrategyPolicyCatalog,
    strategyReviewPolicyCatalog,
} from "../data/policyCatalog";

import { executeAdditionalDecision, executeRegularPolicy } from "./cityEngine";

import {
    getDevelopmentModelFromOption,
    selectRegularPolicy,
    selectStageStrategyPolicy,
    selectStrategyReview,
    shouldTriggerStrategyReview,
} from "./policySelector";

import { calculateCityScores } from "./scoreEngine";

import type {
    CityState,
    DevelopmentModel,
    DevelopmentStage,
    GameState,
    HistoryEntry,
    NumericPolicy,
    Policy,
    PolicyOption,
    PolicyResult,
    StrategyPolicy,
    TimelinePoint,
} from "../types/game";

const RECENT_POLICY_LIMIT = 20;

// ==================================================
// タイムライン
// ==================================================

function createTimelinePoint(
  city: CityState,
  year: number = city.year,
): TimelinePoint {
  return {
    year,
    population: city.population,
    budget: city.budget,
    economy: city.economy,
    infrastructure: city.infrastructure,
    happiness: city.happiness,
    trust: city.trust,
    congestion: city.congestion,
    environment: city.environment,
    scores: calculateCityScores(city),
  };
}

// ==================================================
// 初期状態
// ==================================================

export function createInitialGameState(): GameState {
  const city = createInitialCityState();

  const stageStrategy = selectStageStrategyPolicy(
    stageStrategyPolicyCatalog,
    city,
    [],
  );

  const regularPolicy = stageStrategy
    ? null
    : selectRegularPolicy(regularPolicyCatalog, city, [], []);

  return {
    city,

    phase: stageStrategy ? "stageStrategy" : "regularPolicy",

    currentPolicyId: stageStrategy?.id ?? regularPolicy?.id ?? null,

    completedPolicyIds: [],
    recentPolicyIds: [],
    completedStageStrategies: [],

    history: [],

    timeline: [createTimelinePoint(city, 0)],

    developmentModel: "living",

    lastStrategyReviewYear: 0,

    strategySwitchCount: 0,

    isFinished: false,
  };
}

// ==================================================
// ID・履歴管理
// ==================================================

function addUniqueId(ids: string[], id: string): string[] {
  if (ids.includes(id)) {
    return ids;
  }

  return [...ids, id];
}

function addCompletedStage(
  stages: DevelopmentStage[],
  stage: DevelopmentStage,
): DevelopmentStage[] {
  if (stages.includes(stage)) {
    return stages;
  }

  return [...stages, stage];
}

function addRecentPolicyId(
  recentPolicyIds: string[],
  policyId: string,
): string[] {
  return [...recentPolicyIds, policyId].slice(-RECENT_POLICY_LIMIT);
}

// ==================================================
// 現在の政策
// ==================================================

export function getCurrentPolicy(state: GameState): Policy | null {
  if (!state.currentPolicyId) {
    return null;
  }

  return findPolicyById(state.currentPolicyId);
}

export function getCurrentStrategyPolicy(
  state: GameState,
): StrategyPolicy | null {
  const policy = getCurrentPolicy(state);

  if (!policy || policy.type !== "strategy") {
    return null;
  }

  return policy;
}

export function getCurrentNumericPolicy(
  state: GameState,
): NumericPolicy | null {
  const policy = getCurrentPolicy(state);

  if (!policy || policy.type !== "numeric") {
    return null;
  }

  return policy;
}

// ==================================================
// 政策結果
// ==================================================

function calculateStrategyResult(
  policy: StrategyPolicy,
  option: PolicyOption,
  city: CityState,
): PolicyResult {
  if (policy.calculateResult) {
    return policy.calculateResult(option, city);
  }

  return {
    effects: option.effects,

    message: option.resultMessage ?? `「${option.label}」を実行しました。`,
  };
}

function createHistoryEntry(
  cityBeforeDecision: CityState,
  policy: Policy,
  decision: string,
  result: PolicyResult,
): HistoryEntry {
  return {
    year: cityBeforeDecision.year,
    stage: cityBeforeDecision.stage,

    policyId: policy.id,
    policyTitle: policy.title,
    policyType: policy.type,

    decision,
    result: result.message,

    effects: result.effects,
  };
}

// ==================================================
// 次の通常政策
// ==================================================

function prepareRegularPolicy(state: GameState): GameState {
  const policy = selectRegularPolicy(
    regularPolicyCatalog,
    state.city,
    state.completedPolicyIds,
    state.recentPolicyIds,
  );

  if (!policy) {
    return {
      ...state,
      phase: "finished",
      currentPolicyId: null,
      isFinished: true,
    };
  }

  return {
    ...state,
    phase: "regularPolicy",
    currentPolicyId: policy.id,
  };
}

// ==================================================
// 発展段階の戦略課題
// ==================================================

function prepareStageStrategy(state: GameState): GameState | null {
  if (state.completedStageStrategies.includes(state.city.stage)) {
    return null;
  }

  const policy = selectStageStrategyPolicy(
    stageStrategyPolicyCatalog,
    state.city,
    state.completedPolicyIds,
  );

  if (!policy) {
    return null;
  }

  return {
    ...state,
    phase: "stageStrategy",
    currentPolicyId: policy.id,
  };
}

// ==================================================
// 戦略見直し
// ==================================================

function prepareStrategyReview(state: GameState): GameState | null {
  const activeModel = state.developmentModel;

  const availableReviews = strategyReviewPolicyCatalog.filter(
    (policy) =>
      policy.tags?.includes(`current-${activeModel}`) &&
      !state.completedPolicyIds.includes(policy.id),
  );

  const shouldReview = shouldTriggerStrategyReview({
    city: state.city,

    lastStrategyReviewYear: state.lastStrategyReviewYear,

    availableReviewCount: availableReviews.length,
  });

  if (!shouldReview) {
    return null;
  }

  const review = selectStrategyReview(
    strategyReviewPolicyCatalog,
    state.city,
    activeModel,
    state.completedPolicyIds,
  );

  if (!review) {
    return null;
  }

  return {
    ...state,
    phase: "strategyReview",
    currentPolicyId: review.id,
  };
}

// ==================================================
// 翌年度に表示する政策
// ==================================================

function prepareNextYear(state: GameState, stageChanged: boolean): GameState {
  if (state.isFinished) {
    return {
      ...state,
      phase: "finished",
      currentPolicyId: null,
    };
  }

  if (stageChanged) {
    const stageStrategyState = prepareStageStrategy(state);

    if (stageStrategyState) {
      return stageStrategyState;
    }
  }

  const strategyReviewState = prepareStrategyReview(state);

  if (strategyReviewState) {
    return strategyReviewState;
  }

  return prepareRegularPolicy(state);
}

// ==================================================
// 発展モデルの変更
// ==================================================

type DevelopmentModelUpdate = {
  developmentModel: DevelopmentModel;
  switched: boolean;
};

function calculateDevelopmentModelUpdate(
  currentModel: DevelopmentModel,
  category: Policy["category"],
  selectedOptionId?: string,
): DevelopmentModelUpdate {
  if (!selectedOptionId) {
    return {
      developmentModel: currentModel,

      switched: false,
    };
  }

  const selectedModel = getDevelopmentModelFromOption(selectedOptionId);

  if (!selectedModel) {
    return {
      developmentModel: currentModel,

      switched: false,
    };
  }

  const switched =
    category === "strategyReview" && selectedModel !== currentModel;

  return {
    developmentModel: selectedModel,

    switched,
  };
}

// ==================================================
// 政策実行の共通処理
// ==================================================

type CompleteDecisionOptions = {
  state: GameState;
  policy: Policy;
  decision: string;
  result: PolicyResult;
  selectedOptionId?: string;
};

function completeDecision({
  state,
  policy,
  decision,
  result,
  selectedOptionId,
}: CompleteDecisionOptions): GameState {
  const category = policy.category ?? "regularPolicy";

  const historyEntry = createHistoryEntry(state.city, policy, decision, result);

  const completedPolicyIds = addUniqueId(state.completedPolicyIds, policy.id);

  const recentPolicyIds = addRecentPolicyId(state.recentPolicyIds, policy.id);

  const modelUpdate = calculateDevelopmentModelUpdate(
    state.developmentModel,
    category,
    selectedOptionId,
  );

  const strategySwitchCount =
    state.strategySwitchCount + (modelUpdate.switched ? 1 : 0);

  // ==================================================
  // 通常政策：年度を進める
  // ==================================================

  if (category === "regularPolicy") {
    const execution = executeRegularPolicy(
      state.city,
      result.effects,
      modelUpdate.developmentModel,
    );

    // 政策結果の履歴へ、
    // その年度の税収・維持費・収支を追加する
    const regularHistoryEntry: HistoryEntry = {
      ...historyEntry,

      annualFinance: execution.annualFinance,
    };

    const updatedState: GameState = {
      ...state,

      city: execution.city,

      phase: execution.gameFinished ? "finished" : "regularPolicy",

      currentPolicyId: null,

      developmentModel: modelUpdate.developmentModel,

      strategySwitchCount,

      completedPolicyIds,
      recentPolicyIds,

      history: [...state.history, regularHistoryEntry],

      timeline: [
        ...state.timeline,

        createTimelinePoint(execution.city, state.city.year),
      ],

      isFinished: execution.gameFinished,
    };

    return prepareNextYear(updatedState, execution.stageChanged);
  }

  // ==================================================
  // 戦略課題・見直し：年度を進めない
  // ==================================================

  const updatedCity = executeAdditionalDecision(state.city, result.effects);

  const completedStageStrategies =
    category === "stageStrategy"
      ? addCompletedStage(state.completedStageStrategies, state.city.stage)
      : state.completedStageStrategies;

  const updatedState: GameState = {
    ...state,

    city: updatedCity,

    phase: "regularPolicy",
    currentPolicyId: null,

    developmentModel: modelUpdate.developmentModel,

    strategySwitchCount,

    completedPolicyIds,
    recentPolicyIds,
    completedStageStrategies,

    history: [...state.history, historyEntry],

    lastStrategyReviewYear:
      category === "strategyReview"
        ? state.city.year
        : state.lastStrategyReviewYear,
  };

  return prepareRegularPolicy(updatedState);
}

// ==================================================
// 戦略選択の実行
// ==================================================

export function executeStrategyDecision(
  state: GameState,
  optionId: string,
): GameState {
  if (state.isFinished) {
    return state;
  }

  const policy = getCurrentStrategyPolicy(state);

  if (!policy) {
    return state;
  }

  const selectedOption: PolicyOption | undefined = policy.options.find(
    (option: PolicyOption) => option.id === optionId,
  );

  if (!selectedOption) {
    return state;
  }

  const result = calculateStrategyResult(policy, selectedOption, state.city);

  return completeDecision({
    state,
    policy,

    decision: selectedOption.label,

    result,

    selectedOptionId: selectedOption.id,
  });
}

// ==================================================
// 数値選択の実行
// ==================================================

export function executeNumericDecision(
  state: GameState,
  value: number,
): GameState {
  if (state.isFinished) {
    return state;
  }

  const policy = getCurrentNumericPolicy(state);

  if (!policy) {
    return state;
  }

  const safeValue = Math.max(policy.min, Math.min(policy.max, value));

  const result = policy.calculateResult(safeValue, state.city);

  return completeDecision({
    state,
    policy,

    decision: `${policy.valueLabel}：${safeValue}${policy.unit}`,

    result,
  });
}

// ==================================================
// ニューゲーム
// ==================================================

export function restartGame(): GameState {
  return createInitialGameState();
}
