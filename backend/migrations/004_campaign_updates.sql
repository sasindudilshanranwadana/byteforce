-- SCRUM-23: Post Campaign Updates
-- Creates the campaign_updates table — used by campaigners to post progress
-- notes for backers. Also defines RLS policies.

CREATE TABLE IF NOT EXISTS campaign_updates (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id   UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  author_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title         TEXT NOT NULL CHECK (char_length(title) BETWEEN 1 AND 140),
  body          TEXT NOT NULL CHECK (char_length(body) BETWEEN 1 AND 5000),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS campaign_updates_campaign_id_idx
  ON campaign_updates(campaign_id, created_at DESC);

ALTER TABLE campaign_updates ENABLE ROW LEVEL SECURITY;

-- Reads: public (anyone can see updates for any campaign)
DROP POLICY IF EXISTS "campaign_updates_select_all" ON campaign_updates;
CREATE POLICY "campaign_updates_select_all"
  ON campaign_updates FOR SELECT
  USING (true);

-- Writes: only the campaign creator can post updates
DROP POLICY IF EXISTS "campaign_updates_insert_owner" ON campaign_updates;
CREATE POLICY "campaign_updates_insert_owner"
  ON campaign_updates FOR INSERT
  WITH CHECK (
    author_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = campaign_updates.campaign_id
        AND campaigns.creator_id = auth.uid()
    )
  );

-- Author can update/delete their own updates
DROP POLICY IF EXISTS "campaign_updates_update_owner" ON campaign_updates;
CREATE POLICY "campaign_updates_update_owner"
  ON campaign_updates FOR UPDATE
  USING (author_id = auth.uid());

DROP POLICY IF EXISTS "campaign_updates_delete_owner" ON campaign_updates;
CREATE POLICY "campaign_updates_delete_owner"
  ON campaign_updates FOR DELETE
  USING (author_id = auth.uid());

-- Trigger to keep updated_at fresh
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS campaign_updates_set_updated_at ON campaign_updates;
CREATE TRIGGER campaign_updates_set_updated_at
  BEFORE UPDATE ON campaign_updates
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
