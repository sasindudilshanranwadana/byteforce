-- ─────────────────────────────────────────
-- 007_platform_stats.sql
-- Platform-wide aggregate metrics for the public landing page.
-- Exposed via a SECURITY DEFINER view + public select grant so unauthenticated
-- visitors can read the totals without bypassing RLS on the underlying tables.
-- ─────────────────────────────────────────

create or replace view public.platform_stats
with (security_invoker = false) as
select
  (select count(*) from public.campaigns where status in ('active', 'closed')) as campaigns_funded,
  (select count(distinct backer_id) from public.donations where status = 'completed') as backers_count,
  (select coalesce(sum(amount), 0) from public.donations where status = 'completed') as total_raised,
  (select count(*) from public.campaigns where status = 'active') as active_campaigns,
  (select count(*) from public.donations where status = 'completed') as donations_count;

grant select on public.platform_stats to anon, authenticated;
