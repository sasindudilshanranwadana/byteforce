-- ============================================================
-- Migration 010: Add rejection_reason to campaigns
-- ============================================================
-- Allows admins to record the reason when rejecting a campaign.
-- The campaigner sees this on their dashboard so they know
-- what to fix before resubmitting.
-- ============================================================

ALTER TABLE public.campaigns
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT CHECK (char_length(rejection_reason) <= 500);
