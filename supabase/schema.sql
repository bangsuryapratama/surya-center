-- =====================================================================
-- SURYA CENTER — SUPABASE SCHEMA
-- Run this in Supabase SQL Editor (Project > SQL Editor > New Query).
-- Safe to re-run: uses IF NOT EXISTS / CREATE OR REPLACE where possible.
-- =====================================================================

-- ---------------------------------------------------------------------
-- EXTENSIONS
-- ---------------------------------------------------------------------
create extension if not exists "uuid-ossp";

-- ---------------------------------------------------------------------
-- ENUMS
-- ---------------------------------------------------------------------
do $$ begin
  create type goal_category as enum ('finance','career','education','health','content_creator','personal');
exception when duplicate_object then null; end $$;

do $$ begin
  create type goal_priority as enum ('low','medium','high','critical');
exception when duplicate_object then null; end $$;

do $$ begin
  create type goal_status as enum ('not_started','in_progress','on_hold','completed','cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type transaction_type as enum ('income','expense','saving');
exception when duplicate_object then null; end $$;

do $$ begin
  create type decision_recommendation as enum ('take','consider','postpone');
exception when duplicate_object then null; end $$;

do $$ begin
  create type mentor_role as enum ('user','model');
exception when duplicate_object then null; end $$;

do $$ begin
  create type insight_type as enum ('daily_motivation','ai_insight','money_analysis','journal_pattern');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------
-- PROFILES  (1:1 with auth.users)
-- ---------------------------------------------------------------------
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  timezone text default 'Asia/Jakarta',
  onboarding_completed boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Auto-create a profile row whenever a new auth user signs up
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ---------------------------------------------------------------------
-- PRIORITIES (Dashboard "Prioritas hari ini")
-- ---------------------------------------------------------------------
create table if not exists priorities (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  is_done boolean default false,
  priority_date date not null default current_date,
  created_at timestamptz default now()
);
create index if not exists idx_priorities_user_date on priorities(user_id, priority_date);

-- ---------------------------------------------------------------------
-- GOALS (Goal Center)
-- ---------------------------------------------------------------------
create table if not exists goals (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  category goal_category not null,
  deadline date,
  progress smallint not null default 0 check (progress between 0 and 100),
  priority goal_priority not null default 'medium',
  status goal_status not null default 'not_started',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists idx_goals_user on goals(user_id);

-- ---------------------------------------------------------------------
-- MONEY CENTER
-- ---------------------------------------------------------------------
create table if not exists transactions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type transaction_type not null,
  amount numeric(14,2) not null check (amount >= 0),
  category text not null,
  note text,
  transaction_date date not null default current_date,
  created_at timestamptz default now()
);
create index if not exists idx_transactions_user_date on transactions(user_id, transaction_date);

create table if not exists wishlist_items (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  price numeric(14,2) not null,
  target_date date,
  is_purchased boolean default false,
  created_at timestamptz default now()
);

-- ---------------------------------------------------------------------
-- HABIT TRACKER
-- ---------------------------------------------------------------------
create table if not exists habits (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  target_per_week smallint not null default 7 check (target_per_week between 1 and 7),
  archived boolean default false,
  created_at timestamptz default now()
);

create table if not exists habit_logs (
  id uuid primary key default uuid_generate_v4(),
  habit_id uuid not null references habits(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null default current_date,
  is_done boolean default true,
  created_at timestamptz default now(),
  unique (habit_id, log_date)
);
create index if not exists idx_habit_logs_user_date on habit_logs(user_id, log_date);

-- ---------------------------------------------------------------------
-- RECOVERY JOURNAL
-- ---------------------------------------------------------------------
create table if not exists journal_entries (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entry_date date not null default current_date,
  mood smallint not null check (mood between 1 and 10),
  energy smallint not null check (energy between 1 and 10),
  productivity smallint not null check (productivity between 1 and 10),
  note text,
  created_at timestamptz default now(),
  unique (user_id, entry_date)
);

-- ---------------------------------------------------------------------
-- DECISION CENTER
-- ---------------------------------------------------------------------
create table if not exists decisions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  cost numeric(14,2),
  benefit text,
  risk text,
  goal_impact text,
  ai_score smallint check (ai_score between 0 and 100),
  ai_priority text,
  ai_short_term text,
  ai_long_term text,
  ai_recommendation decision_recommendation,
  created_at timestamptz default now()
);
create index if not exists idx_decisions_user on decisions(user_id);

-- ---------------------------------------------------------------------
-- AI MENTOR CHAT HISTORY
-- ---------------------------------------------------------------------
create table if not exists mentor_messages (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role mentor_role not null,
  content text not null,
  created_at timestamptz default now()
);
create index if not exists idx_mentor_messages_user on mentor_messages(user_id, created_at);

-- ---------------------------------------------------------------------
-- AI INSIGHTS CACHE (daily motivation, dashboard insight, money/journal analysis)
-- Cached so Gemini isn't called on every single page load.
-- ---------------------------------------------------------------------
create table if not exists ai_insights (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type insight_type not null,
  content text not null,
  valid_for_date date not null default current_date,
  created_at timestamptz default now(),
  unique (user_id, type, valid_for_date)
);

-- =====================================================================
-- ROW LEVEL SECURITY — every table is scoped to auth.uid()
-- =====================================================================
alter table profiles enable row level security;
alter table priorities enable row level security;
alter table goals enable row level security;
alter table transactions enable row level security;
alter table wishlist_items enable row level security;
alter table habits enable row level security;
alter table habit_logs enable row level security;
alter table journal_entries enable row level security;
alter table decisions enable row level security;
alter table mentor_messages enable row level security;
alter table ai_insights enable row level security;

-- Generic pattern applied per table: owner-only read/write
create policy "profiles_owner" on profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "priorities_owner" on priorities for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "goals_owner" on goals for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "transactions_owner" on transactions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "wishlist_owner" on wishlist_items for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "habits_owner" on habits for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "habit_logs_owner" on habit_logs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "journal_owner" on journal_entries for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "decisions_owner" on decisions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "mentor_messages_owner" on mentor_messages for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "ai_insights_owner" on ai_insights for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- =====================================================================
-- CONVENIENCE VIEW: monthly money summary (used by Money Center charts)
-- =====================================================================
create or replace view v_monthly_money_summary as
select
  user_id,
  date_trunc('month', transaction_date)::date as month,
  sum(amount) filter (where type = 'income') as total_income,
  sum(amount) filter (where type = 'expense') as total_expense,
  sum(amount) filter (where type = 'saving') as total_saving
from transactions
group by user_id, date_trunc('month', transaction_date);
