-- ============================================================
-- Byteforce Crowdfunding Platform — Supabase PostgreSQL Schema
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─────────────────────────────────────────
-- ENUM TYPES
-- ─────────────────────────────────────────
create type user_role as enum ('backer', 'campaigner', 'admin');
create type campaign_status as enum ('pending', 'active', 'suspended', 'closed', 'rejected');
create type donation_status as enum ('pending', 'completed', 'failed');

-- ─────────────────────────────────────────
-- PROFILES (extends auth.users)
-- ─────────────────────────────────────────
create table if not exists public.profiles (
  id          uuid references auth.users(id) on delete cascade primary key,
  name        text not null,
  role        user_role not null default 'backer',
  avatar_url  text,
  created_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Profiles: users can read any profile, only update their own
create policy "Profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can insert their own profile"
  on public.profiles for insert with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);

-- ─────────────────────────────────────────
-- CAMPAIGNS
-- ─────────────────────────────────────────
create table if not exists public.campaigns (
  id            uuid primary key default uuid_generate_v4(),
  creator_id    uuid not null references public.profiles(id) on delete cascade,
  title         text not null,
  description   text not null,
  category      text not null,
  goal_amount   numeric(12,2) not null check (goal_amount > 0),
  raised_amount numeric(12,2) not null default 0 check (raised_amount >= 0),
  image_url     text,
  deadline      timestamptz not null,
  status        campaign_status not null default 'pending',
  created_at    timestamptz not null default now()
);

alter table public.campaigns enable row level security;

-- Campaigns: everyone reads active ones, creators manage their own, admins manage all
create policy "Active campaigns are viewable by everyone"
  on public.campaigns for select using (
    status = 'active' or auth.uid() = creator_id or
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Campaigners can create campaigns"
  on public.campaigns for insert with check (
    auth.uid() = creator_id and
    exists (select 1 from public.profiles where id = auth.uid() and role in ('campaigner', 'admin'))
  );

create policy "Creators can update their own campaigns"
  on public.campaigns for update using (
    auth.uid() = creator_id or
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admins can delete campaigns"
  on public.campaigns for delete using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ─────────────────────────────────────────
-- REWARD TIERS
-- ─────────────────────────────────────────
create table if not exists public.reward_tiers (
  id             uuid primary key default uuid_generate_v4(),
  campaign_id    uuid not null references public.campaigns(id) on delete cascade,
  title          text not null,
  minimum_amount numeric(12,2) not null check (minimum_amount > 0),
  description    text not null,
  created_at     timestamptz not null default now()
);

alter table public.reward_tiers enable row level security;

create policy "Reward tiers are viewable by everyone"
  on public.reward_tiers for select using (true);

create policy "Campaign creators can manage reward tiers"
  on public.reward_tiers for insert with check (
    exists (
      select 1 from public.campaigns
      where id = campaign_id and creator_id = auth.uid()
    )
  );

create policy "Campaign creators can update reward tiers"
  on public.reward_tiers for update using (
    exists (
      select 1 from public.campaigns
      where id = campaign_id and creator_id = auth.uid()
    )
  );

create policy "Campaign creators can delete reward tiers"
  on public.reward_tiers for delete using (
    exists (
      select 1 from public.campaigns
      where id = campaign_id and creator_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────
-- DONATIONS
-- ─────────────────────────────────────────
create table if not exists public.donations (
  id                       uuid primary key default uuid_generate_v4(),
  backer_id                uuid not null references public.profiles(id) on delete cascade,
  campaign_id              uuid not null references public.campaigns(id) on delete cascade,
  reward_tier_id           uuid references public.reward_tiers(id) on delete set null,
  amount                   numeric(12,2) not null check (amount > 0),
  status                   donation_status not null default 'pending',
  stripe_payment_intent_id text unique,
  created_at               timestamptz not null default now()
);

alter table public.donations enable row level security;

create policy "Backers can view their own donations"
  on public.donations for select using (
    auth.uid() = backer_id or
    exists (
      select 1 from public.campaigns
      where id = campaign_id and creator_id = auth.uid()
    ) or
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Authenticated users can create donations"
  on public.donations for insert with check (
    auth.uid() = backer_id and auth.uid() is not null
  );

-- Service role updates donation status (via webhook)
create policy "Service role can update donations"
  on public.donations for update using (true);

-- ─────────────────────────────────────────
-- TRIGGER: Auto-create profile on signup
-- ─────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, role, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'backer'),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─────────────────────────────────────────
-- TRIGGER: Update raised_amount when donation completes
-- ─────────────────────────────────────────
create or replace function public.handle_donation_completed()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  -- Only act when status transitions to 'completed'
  if new.status = 'completed' and (old.status is null or old.status <> 'completed') then
    update public.campaigns
    set raised_amount = raised_amount + new.amount
    where id = new.campaign_id;
  end if;

  -- Reverse if previously completed and now failed
  if old.status = 'completed' and new.status = 'failed' then
    update public.campaigns
    set raised_amount = greatest(0, raised_amount - old.amount)
    where id = new.campaign_id;
  end if;

  return new;
end;
$$;

drop trigger if exists on_donation_status_change on public.donations;
create trigger on_donation_status_change
  after insert or update of status on public.donations
  for each row execute procedure public.handle_donation_completed();

-- ─────────────────────────────────────────
-- INDEXES for performance
-- ─────────────────────────────────────────
create index if not exists idx_campaigns_creator_id on public.campaigns(creator_id);
create index if not exists idx_campaigns_status on public.campaigns(status);
create index if not exists idx_campaigns_category on public.campaigns(category);
create index if not exists idx_campaigns_created_at on public.campaigns(created_at desc);
create index if not exists idx_reward_tiers_campaign_id on public.reward_tiers(campaign_id);
create index if not exists idx_donations_backer_id on public.donations(backer_id);
create index if not exists idx_donations_campaign_id on public.donations(campaign_id);
create index if not exists idx_donations_stripe_pi on public.donations(stripe_payment_intent_id);
