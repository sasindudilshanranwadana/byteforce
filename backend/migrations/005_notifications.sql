-- SCRUM-24: Email Notifications
-- Creates the notifications table (audit log of every email sent) and a
-- trigger that queues a notification row for every backer of a campaign
-- whenever a new campaign_update is posted.

CREATE TABLE IF NOT EXISTS notifications (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  campaign_id   UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  type          TEXT NOT NULL CHECK (type IN ('campaign_update', 'donation_receipt', 'campaign_funded')),
  subject       TEXT NOT NULL,
  body          TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending', 'sent', 'failed')),
  sent_at       TIMESTAMPTZ,
  error         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS notifications_user_id_idx
  ON notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS notifications_pending_idx
  ON notifications(status) WHERE status = 'pending';

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can read their own notifications
DROP POLICY IF EXISTS "notifications_select_self" ON notifications;
CREATE POLICY "notifications_select_self"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

-- Inserts handled by service role only (via DB triggers + worker) — no
-- public/anon insert policy.

-- ─── Trigger: fan out notifications on new campaign_update ───────────────────
-- When a campaigner posts an update, queue one notification per unique
-- backer who has at least one completed donation to that campaign.

CREATE OR REPLACE FUNCTION queue_campaign_update_notifications()
RETURNS TRIGGER AS $$
DECLARE
  v_campaign_title TEXT;
BEGIN
  SELECT title INTO v_campaign_title FROM campaigns WHERE id = NEW.campaign_id;

  INSERT INTO notifications (user_id, campaign_id, type, subject, body)
  SELECT DISTINCT
    d.backer_id,
    NEW.campaign_id,
    'campaign_update',
    'Update from ' || coalesce(v_campaign_title, 'a campaign you backed') || ': ' || NEW.title,
    NEW.body
  FROM donations d
  WHERE d.campaign_id = NEW.campaign_id
    AND d.status = 'completed';

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS campaign_update_notify ON campaign_updates;
CREATE TRIGGER campaign_update_notify
  AFTER INSERT ON campaign_updates
  FOR EACH ROW EXECUTE FUNCTION queue_campaign_update_notifications();
