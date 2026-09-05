-- ==================================================
-- まちのかけひき
-- 匿名プレイデータ収集用スキーマ
-- ==================================================

-- UUID生成機能
create extension if not exists pgcrypto;

-- ==================================================
-- プレイセッション
-- 1回のニューゲームにつき1行
-- ==================================================

create table if not exists public.game_sessions (
  id uuid primary key,

  created_at timestamptz
    not null
    default now(),

  -- 同意文のバージョン
  consent_version text
    not null,

  -- データ形式のバージョン
  schema_version integer
    not null
    default 1,

  -- アプリのバージョン
  app_version text,

  -- ios / android / web
  platform text
    check (
      platform in (
        'ios',
        'android',
        'web',
        'unknown'
      )
    ),

  -- ja-JPなど。正確な位置情報は保存しない
  locale text,

  -- 研究利用への同意は、
  -- ゲーム改善への同意と分けて保存する
  analytics_consent boolean
    not null
    default true,

  research_consent boolean
    not null
    default false
);

comment on table public.game_sessions is
  '個人を特定しない1ゲーム単位のセッション';

comment on column public.game_sessions.research_consent is
  '研究利用について別途説明・同意を取得した場合のみtrue';

-- ==================================================
-- ゲームイベント
-- 政策選択やゲーム終了を時系列で保存
-- ==================================================

create table if not exists public.game_events (
  id uuid primary key,

  session_id uuid
    not null
    references public.game_sessions(id)
    on delete cascade,

  created_at timestamptz
    not null
    default now(),

  -- セッション内の送信順
  -- 通信失敗後の再送でも重複しないようにする
  event_sequence integer
    not null
    check (event_sequence >= 0),

  event_type text
    not null
    check (
      event_type in (
        'game_started',
        'policy_presented',
        'decision_made',
        'stage_changed',
        'game_completed'
      )
    ),

  -- 1〜50年目
  year integer
    check (
      year between 1 and 50
    ),

  stage text
    check (
      stage in (
        'creation',
        'growth',
        'expansion',
        'maturity',
        'reorganization'
      )
    ),

  phase text
    check (
      phase in (
        'stageStrategy',
        'strategyReview',
        'regularPolicy',
        'result',
        'finished'
      )
    ),

  -- 出題・実行した政策
  policy_id text,
  policy_title text,

  policy_type text
    check (
      policy_type in (
        'strategy',
        'numeric'
      )
    ),

  policy_category text
    check (
      policy_category in (
        'stageStrategy',
        'regularPolicy',
        'strategyReview'
      )
    ),

  policy_domain text
    check (
      policy_domain in (
        'transport',
        'industry',
        'living',
        'environment',
        'finance',
        'trust',
        'infrastructure'
      )
    ),

  -- strategy / numeric
  decision_kind text
    check (
      decision_kind in (
        'strategy',
        'numeric'
      )
    ),

  -- 戦略選択時に保存
  option_id text,
  option_label text,

  -- 数値選択時に保存
  numeric_value numeric,
  numeric_unit text,

  -- 選択前後の成長モデル
  development_model_before text
    check (
      development_model_before in (
        'industry',
        'tourism',
        'living'
      )
    ),

  development_model_after text
    check (
      development_model_after in (
        'industry',
        'tourism',
        'living'
      )
    ),

  -- 戦略を実際に乗り換えたか
  strategy_switched boolean
    not null
    default false,

  -- 選択直前の街の状態
  city_before jsonb,

  -- 選択反映後の街の状態
  city_after jsonb,

  -- 政策による変化量
  effects jsonb,

  -- ゲーム終了時の評価
  final_scores jsonb,

  -- クライアント側で記録した時刻
  client_created_at timestamptz,

  -- アプリバージョン
  app_version text,

  unique (
    session_id,
    event_sequence
  ),

  -- 戦略選択ならoption_id、
  -- 数値選択ならnumeric_valueを必要とする
  constraint valid_decision_data check (
    event_type <> 'decision_made'
    or (
      decision_kind = 'strategy'
      and option_id is not null
      and numeric_value is null
    )
    or (
      decision_kind = 'numeric'
      and numeric_value is not null
      and option_id is null
    )
  )
);

comment on table public.game_events is
  '政策の出題、戦略選択、数値設定、発展段階変更、ゲーム終了を保存する追記専用ログ';

comment on column public.game_events.city_before is
  '政策選択直前の人口・財政・評価指標';

comment on column public.game_events.city_after is
  '政策効果反映後の人口・財政・評価末数値';

-- ==================================================
-- 集計を高速化するインデックス
-- ==================================================

create index if not exists
  game_events_session_id_index
on public.game_events (
  session_id
);

create index if not exists
  game_events_policy_id_index
on public.game_events (
  policy_id
);

create index if not exists
  game_events_event_type_index
on public.game_events (
  event_type
);

create index if not exists
  game_events_year_index
on public.game_events (
  year
);

create index if not exists
  game_events_stage_index
on public.game_events (
  stage
);

create index if not exists
  game_events_option_id_index
on public.game_events (
  option_id
);

create index if not exists
  game_events_created_at_index
on public.game_events (
  created_at
);

-- ==================================================
-- Row Level Security
-- アプリからは追加だけ許可する
-- 読み取り・更新・削除は許可しない
-- ==================================================

alter table public.game_sessions
  enable row level security;

alter table public.game_events
  enable row level security;

-- 以前同名のポリシーを作った場合に備えて削除
drop policy if exists
  "allow anonymous session inserts"
on public.game_sessions;

drop policy if exists
  "allow anonymous event inserts"
on public.game_events;

-- 匿名利用者は同意済みセッションだけ追加できる
create policy
  "allow anonymous session inserts"
on public.game_sessions
for insert
to anon
with check (
  analytics_consent = true
);

-- 匿名利用者はイベントを追記できる
create policy
  "allow anonymous event inserts"
on public.game_events
for insert
to anon
with check (
  session_id is not null
);

-- 権限を一度取り消し、INSERTだけ付与する
revoke all
on table public.game_sessions
from anon;

revoke all
on table public.game_events
from anon;

grant insert
on table public.game_sessions
to anon;

grant insert
on table public.game_events
to anon;

-- 認証済みユーザーを将来使う場合も、
-- 現時点ではアプリから読み取れないようにする
revoke all
on table public.game_sessions
from authenticated;

revoke all
on table public.game_events
from authenticated;

grant insert
on table public.game_sessions
to authenticated;

grant insert
on table public.game_events
to authenticated;