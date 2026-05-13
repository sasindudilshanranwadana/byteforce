-- SCRUM-25: Campaigner Analytics Dashboard
-- Creates a database VIEW that aggregates per-campaign analytics so the
-- frontend doesn't have to assemble multiple queries client-side.

CREATE OR REPLACE VIEW campaign_analytics AS
SELECT
  c.id                              AS campaign_id,
  c.creator_id,
  c.title,
  c.goal_amount,
  c.raised_amount,
  c.status,
  CASE
    WHEN c.goal_amount > 0 THEN ROUND((c.raised_amount / c.goal_amount) * 100)::INT
    ELSE 0
  END                               AS goal_percent,
  COUNT(DISTINCT d.id) FILTER (WHERE d.status = 'completed')      AS donation_count,
  COUNT(DISTINCT d.backer_id) FILTER (WHERE d.status = 'completed') AS unique_backer_count,
  COALESCE(AVG(d.amount) FILTER (WHERE d.status = 'completed'), 0)  AS average_donation,
  COALESCE(MAX(d.amount) FILTER (WHERE d.status = 'completed'), 0)  AS largest_donation,
  COUNT(d.id) FILTER (WHERE d.status = 'completed' AND d.created_at > now() - INTERVAL '7 days') AS donations_last_7d,
  COALESCE(SUM(d.amount) FILTER (WHERE d.status = 'completed' AND d.created_at > now() - INTERVAL '7 days'), 0) AS raised_last_7d,
  MAX(d.created_at) FILTER (WHERE d.status = 'completed')          AS last_donation_at
FROM campaigns c
LEFT JOIN donations d ON d.campaign_id = c.id
GROUP BY c.id;

-- Underlying RLS on campaigns + donations already restricts visibility;
-- the view inherits those policies (Postgres applies them to base tables).

-- Daily totals function — for the 30-day chart on the dashboard
CREATE OR REPLACE FUNCTION campaign_daily_totals(p_campaign_id UUID, p_days INT DEFAULT 30)
RETURNS TABLE (date DATE, total NUMERIC, count BIGINT) AS $$
  WITH day_series AS (
    SELECT generate_series(
      current_date - (p_days - 1),
      current_date,
      INTERVAL '1 day'
    )::DATE AS date
  )
  SELECT
    ds.date,
    COALESCE(SUM(d.amount), 0)::NUMERIC AS total,
    COUNT(d.id) AS count
  FROM day_series ds
  LEFT JOIN donations d
    ON d.campaign_id = p_campaign_id
    AND d.status = 'completed'
    AND d.created_at::DATE = ds.date
  GROUP BY ds.date
  ORDER BY ds.date;
$$ LANGUAGE sql STABLE;
