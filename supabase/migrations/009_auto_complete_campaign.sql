-- ============================================================
-- Migration 009: Auto-close campaign when goal is reached
-- ============================================================
-- Extends handle_donation_completed() to set status = 'closed'
-- when raised_amount reaches or exceeds goal_amount.
-- 'closed' is reused as the "successfully funded & completed" state.
-- ============================================================

create or replace function public.handle_donation_completed()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  -- Only act when status transitions to 'completed'
  if new.status = 'completed' and (old.status is null or old.status <> 'completed') then
    update public.campaigns
    set
      raised_amount = raised_amount + new.amount,
      -- Auto-close if goal is now met
      status = case
        when (raised_amount + new.amount) >= goal_amount and status = 'active'
          then 'closed'
        else status
      end
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
