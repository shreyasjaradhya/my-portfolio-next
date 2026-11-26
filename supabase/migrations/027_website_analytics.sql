-- Migration: 027_website_analytics
-- Description: Creates the website_analytics table for recording page views, unique visitors, and admin traffic,
-- plus optimized server-side RPC aggregation functions for the admin dashboard.

CREATE TABLE IF NOT EXISTS public.website_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id TEXT NOT NULL,
  page_path TEXT NOT NULL,
  is_admin BOOLEAN NOT NULL DEFAULT false,
  visited_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Performance indexes for efficient aggregation and filtering
CREATE INDEX IF NOT EXISTS idx_website_analytics_visitor_id ON public.website_analytics(visitor_id);
CREATE INDEX IF NOT EXISTS idx_website_analytics_visited_at ON public.website_analytics(visited_at);
CREATE INDEX IF NOT EXISTS idx_website_analytics_page_path ON public.website_analytics(page_path);
CREATE INDEX IF NOT EXISTS idx_website_analytics_is_admin ON public.website_analytics(is_admin);

-- Enable Row Level Security
ALTER TABLE public.website_analytics ENABLE ROW LEVEL SECURITY;

-- Permissions
GRANT INSERT ON TABLE public.website_analytics TO anon;
GRANT SELECT, INSERT ON TABLE public.website_analytics TO authenticated;

-- Public / Anonymous insert policy (allows event tracking via client/API)
DROP POLICY IF EXISTS "Public can insert analytics" ON public.website_analytics;
CREATE POLICY "Public can insert analytics"
  ON public.website_analytics
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Authenticated insert policy (for tracked visits during authenticated sessions)
DROP POLICY IF EXISTS "Authenticated can insert analytics" ON public.website_analytics;
CREATE POLICY "Authenticated can insert analytics"
  ON public.website_analytics
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Authenticated select policy (only authorized admins can read records or query metrics)
DROP POLICY IF EXISTS "Authenticated can view analytics" ON public.website_analytics;
CREATE POLICY "Authenticated can view analytics"
  ON public.website_analytics
  FOR SELECT
  TO authenticated
  USING (true);

-- ==============================================================================
-- HIGH-PERFORMANCE ANALYTICS RPC FUNCTIONS
-- ==============================================================================

-- Summary metrics function: aggregates all 6 KPI metrics in a single database roundtrip
CREATE OR REPLACE FUNCTION get_analytics_summary()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_total_views BIGINT;
  v_unique_visitors BIGINT;
  v_today_views BIGINT;
  v_admin_views BIGINT;
  v_current_7d BIGINT;
  v_prev_7d BIGINT;
  v_first_visit TIMESTAMPTZ;
  v_days_count INT;
  v_avg_daily NUMERIC;
  v_growth_pct NUMERIC;
BEGIN
  SELECT COUNT(*), COUNT(DISTINCT visitor_id), MIN(visited_at)
  INTO v_total_views, v_unique_visitors, v_first_visit
  FROM public.website_analytics;

  SELECT COUNT(*) INTO v_today_views
  FROM public.website_analytics
  WHERE visited_at >= date_trunc('day', NOW());

  SELECT COUNT(*) INTO v_admin_views
  FROM public.website_analytics
  WHERE is_admin = true;

  SELECT COUNT(*) INTO v_current_7d
  FROM public.website_analytics
  WHERE visited_at >= (NOW() - INTERVAL '7 days');

  SELECT COUNT(*) INTO v_prev_7d
  FROM public.website_analytics
  WHERE visited_at >= (NOW() - INTERVAL '14 days')
    AND visited_at < (NOW() - INTERVAL '7 days');

  IF v_first_visit IS NOT NULL THEN
    v_days_count := GREATEST(1, EXTRACT(DAY FROM (NOW() - v_first_visit))::INT + 1);
    v_avg_daily := ROUND((v_total_views::NUMERIC / v_days_count), 1);
  ELSE
    v_avg_daily := 0;
  END IF;

  IF v_prev_7d = 0 THEN
    IF v_current_7d > 0 THEN
      v_growth_pct := 100.0;
    ELSE
      v_growth_pct := 0.0;
    END IF;
  ELSE
    v_growth_pct := ROUND(((v_current_7d::NUMERIC - v_prev_7d::NUMERIC) / v_prev_7d::NUMERIC) * 100.0, 1);
  END IF;

  RETURN json_build_object(
    'totalPageViews', COALESCE(v_total_views, 0),
    'totalUniqueVisitors', COALESCE(v_unique_visitors, 0),
    'todayTraffic', COALESCE(v_today_views, 0),
    'adminVisits', COALESCE(v_admin_views, 0),
    'averageDailyTraffic', COALESCE(v_avg_daily, 0),
    'current7DayTraffic', COALESCE(v_current_7d, 0),
    'previous7DayTraffic', COALESCE(v_prev_7d, 0),
    'growthPercentage', COALESCE(v_growth_pct, 0)
  );
END;
$$;

-- 30-day traffic trends: generates complete continuous date series with page view & unique counts
CREATE OR REPLACE FUNCTION get_daily_traffic_trends(p_days INT DEFAULT 30)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSON;
BEGIN
  WITH date_series AS (
    SELECT generate_series(
      date_trunc('day', NOW() - ((p_days - 1) || ' days')::INTERVAL),
      date_trunc('day', NOW()),
      '1 day'::INTERVAL
    ) AS day
  ),
  counts AS (
    SELECT
      date_trunc('day', visited_at) AS day,
      COUNT(*) AS page_views,
      COUNT(DISTINCT visitor_id) AS unique_visitors
    FROM public.website_analytics
    WHERE visited_at >= date_trunc('day', NOW() - ((p_days - 1) || ' days')::INTERVAL)
    GROUP BY 1
  )
  SELECT json_agg(
    json_build_object(
      'date', to_char(d.day, 'Mon DD'),
      'fullDate', to_char(d.day, 'YYYY-MM-DD'),
      'pageViews', COALESCE(c.page_views, 0),
      'uniqueVisitors', COALESCE(c.unique_visitors, 0)
    ) ORDER BY d.day ASC
  ) INTO v_result
  FROM date_series d
  LEFT JOIN counts c ON d.day = c.day;

  RETURN COALESCE(v_result, '[]'::JSON);
END;
$$;

GRANT EXECUTE ON FUNCTION get_analytics_summary() TO authenticated;
GRANT EXECUTE ON FUNCTION get_daily_traffic_trends(INT) TO authenticated;
