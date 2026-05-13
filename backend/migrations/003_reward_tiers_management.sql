-- SCRUM-22: Reward Tiers Management
-- Adds full CRUD support for reward tiers (insert/update/delete by campaign owner)

-- Ensure RLS policies exist for reward_tiers
ALTER TABLE reward_tiers ENABLE ROW LEVEL SECURITY;

-- Anyone can read reward tiers (public)
DROP POLICY IF EXISTS "reward_tiers_select_all" ON reward_tiers;
CREATE POLICY "reward_tiers_select_all"
  ON reward_tiers FOR SELECT
  USING (true);

-- Campaign owners can insert reward tiers for their own campaigns
DROP POLICY IF EXISTS "reward_tiers_insert_owner" ON reward_tiers;
CREATE POLICY "reward_tiers_insert_owner"
  ON reward_tiers FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = reward_tiers.campaign_id
        AND campaigns.creator_id = auth.uid()
    )
  );

-- Campaign owners can update their own reward tiers
DROP POLICY IF EXISTS "reward_tiers_update_owner" ON reward_tiers;
CREATE POLICY "reward_tiers_update_owner"
  ON reward_tiers FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = reward_tiers.campaign_id
        AND campaigns.creator_id = auth.uid()
    )
  );

-- Campaign owners can delete their own reward tiers
DROP POLICY IF EXISTS "reward_tiers_delete_owner" ON reward_tiers;
CREATE POLICY "reward_tiers_delete_owner"
  ON reward_tiers FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = reward_tiers.campaign_id
        AND campaigns.creator_id = auth.uid()
    )
  );

-- Index for fast lookup by campaign
CREATE INDEX IF NOT EXISTS reward_tiers_campaign_id_idx ON reward_tiers(campaign_id);

-- Constraint: minimum_amount must be positive
ALTER TABLE reward_tiers
  DROP CONSTRAINT IF EXISTS reward_tiers_minimum_amount_positive;
ALTER TABLE reward_tiers
  ADD CONSTRAINT reward_tiers_minimum_amount_positive CHECK (minimum_amount > 0);
