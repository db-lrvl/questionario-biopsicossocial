create extension if not exists pgcrypto;

create table if not exists public.questionnaires (
  id text primary key,
  title text not null,
  version text not null,
  source_file text,
  created_at timestamptz not null default now()
);

create table if not exists public.questionnaire_sections (
  id text primary key,
  questionnaire_id text not null references public.questionnaires(id) on delete cascade,
  key text not null,
  title text not null,
  order_index integer not null default 0,
  unique (questionnaire_id, key)
);

create table if not exists public.questions (
  id text primary key,
  questionnaire_id text not null references public.questionnaires(id) on delete cascade,
  section_id text not null references public.questionnaire_sections(id) on delete cascade,
  key text not null,
  number text,
  label text not null,
  type text not null,
  options jsonb,
  condition jsonb,
  order_index integer not null default 0,
  is_sensitive boolean not null default false,
  is_institutional boolean not null default false,
  created_at timestamptz not null default now(),
  unique (questionnaire_id, key)
);

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  questionnaire_id text not null references public.questionnaires(id),
  status text not null default 'submitted',
  access_token_hash text,
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.answers (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.submissions(id) on delete cascade,
  question_id text not null references public.questions(id),
  question_key text not null,
  section_key text not null,
  value jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.submissions(id) on delete cascade,
  section_key text not null,
  wants_referral boolean not null default false,
  referral_notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.institutional_classifications (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.submissions(id) on delete cascade,
  section_key text not null,
  question_key text not null,
  value jsonb,
  created_at timestamptz not null default now()
);

create index if not exists questionnaire_sections_questionnaire_idx
  on public.questionnaire_sections(questionnaire_id, order_index);

create index if not exists questions_questionnaire_section_idx
  on public.questions(questionnaire_id, section_id, order_index);

create index if not exists submissions_questionnaire_created_idx
  on public.submissions(questionnaire_id, created_at desc);

create index if not exists answers_submission_idx
  on public.answers(submission_id);

create index if not exists answers_question_key_idx
  on public.answers(question_key);

create index if not exists referrals_submission_idx
  on public.referrals(submission_id);

create index if not exists institutional_classifications_submission_idx
  on public.institutional_classifications(submission_id);

alter table public.questionnaires enable row level security;
alter table public.questionnaire_sections enable row level security;
alter table public.questions enable row level security;
alter table public.submissions enable row level security;
alter table public.answers enable row level security;
alter table public.referrals enable row level security;
alter table public.institutional_classifications enable row level security;

-- No public policies are created on purpose.
-- The Next.js API uses SUPABASE_SERVICE_ROLE_KEY server-side, which bypasses RLS.
-- Never expose SUPABASE_SERVICE_ROLE_KEY in client-side code or NEXT_PUBLIC_* variables.
