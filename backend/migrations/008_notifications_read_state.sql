-- ─────────────────────────────────────────
-- 008_notifications_read_state.sql
-- Add user-read state (separate from email delivery status).
-- ─────────────────────────────────────────

alter table public.notifications
  add column if not exists read_at timestamptz;

create index if not exists notifications_unread_idx
  on public.notifications(user_id, created_at desc)
  where read_at is null;

-- Allow users to update only the read_at column on their own notifications.
drop policy if exists "notifications_update_self_read" on public.notifications;
create policy "notifications_update_self_read"
  on public.notifications for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Mark every unread notification for the current user as read.
create or replace function public.mark_all_notifications_read()
returns void
language sql
security definer set search_path = public
as $$
  update public.notifications
  set read_at = now()
  where user_id = auth.uid() and read_at is null;
$$;

grant execute on function public.mark_all_notifications_read() to authenticated;
