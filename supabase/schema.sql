-- ==================================================
-- まちのかけひき
-- 匿名プレイデータ収集用スキーマ
-- ==================================================

create extension if not exists pgcrypto;

-- ==================================================
-- ゲームセッション
-- 1回のニューゲームにつき1行
-- ==================================================

create table if not exists public.game_sessions (
  id uuid primary key,

  created_at timestamptz
    not null
    default now(),

  consent_version text
    not null,

  schema_version integer
    not null
    default 1,

  app_version text,

  platform text
    check (
      platform in (
        'ios',
        'android',
        'web',
        'unknown'
      )
    ),

  locale text,

  analytics_consent boolean
    not null
    default true,

  research_consent boolean
    not null
    default false
);

comment on table public.game_sessions is
  '個人を特定しないゲーム単位の匿名セッション';

comment on column public.game_sessions.analytics_consent is
  'ゲーム改善を目的とした分析への同意';

comment on column public.game_sessions.research_consent is
  '研究利用について別途同意を取得した場合のみtrue';

-- ==================================================
-- ゲームイベント
-- 政策提示、選択、発展段階変更、ゲーム終了を保存
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

  event_sequence integer
    not null
    check (
      event_sequence >= 0
    ),

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

  decision_kind text
    check (
      decision_kind in (
        'strategy',
        'numeric'
      )
    ),

  option_id text,

  option_label text,

  numeric_value numeric,

  numeric_unit text,

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

  strategy_switched boolean
    not null
    default false,

  city_before jsonb,

  city_after jsonb,

  effects jsonb,

  final_scores jsonb,

  client_created_at timestamptz,

  app_version text,

  unique (
    session_id,
    event_sequence
  ),

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
  '政策提示、戦略選択、数値設定、発展段階変更、ゲーム終了を保存する追記専用ログ';

comment on column public.game_events.city_before is
  '政策選択前の人口、財政、評価指標などの街の状態';

comment on column public.game_events.city_after is
  '政策効果反映後の人口、財政、評価指標などの街の状態';

comment on column public.game_events.effects is
  '政策によって発生した各指標の変化量';

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
-- アプリからは追加だけを許可する
-- 読み取り・更新・削除は許可しない
-- ==================================================

alter table public.game_sessions
  enable row level security;

alter table public.game_events
  enable row level security;

drop policy if exists
  "allow anonymous session inserts"
on public.game_sessions;

drop policy if exists
  "allow anonymous event inserts"
on public.game_events;

drop policy if exists
  "allow authenticated session inserts"
on public.game_sessions;

drop policy if exists
  "allow authenticated event inserts"
on public.game_events;

create policy
  "allow anonymous session inserts"
on public.game_sessions
for insert
to anon
with check (
  analytics_consent = true
);

create policy
  "allow anonymous event inserts"
on public.game_events
for insert
to anon
with check (
  session_id is not null
);

create policy
  "allow authenticated session inserts"
on public.game_sessions
for insert
to authenticated
with check (
  analytics_consent = true
);

create policy
  "allow authenticated event inserts"
on public.game_events
for insert
to authenticated
with check (
  session_id is not null
);

-- ==================================================
-- アプリ用権限
-- INSERTだけを許可
-- ==================================================

revoke all
on table public.game_sessions
from anon;

revoke all
on table public.game_events
from anon;

revoke all
on table public.game_sessions
from authenticated;

revoke all
on table public.game_events
from authenticated;

grant insert
on table public.game_sessions
to anon;

grant insert
on table public.game_events
to anon;

grant insert
on table public.game_sessions
to authenticated;

grant insert
on table public.game_events
to authenticated;