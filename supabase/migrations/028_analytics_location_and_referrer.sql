-- Migration: 028_analytics_location_and_referrer
-- Description: Adds location, referrer, and device tracking columns to website_analytics for detailed audience insights.

ALTER TABLE public.website_analytics 
  ADD COLUMN IF NOT EXISTS referrer TEXT DEFAULT 'Direct',
  ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'Unknown',
  ADD COLUMN IF NOT EXISTS city TEXT DEFAULT 'Unknown',
  ADD COLUMN IF NOT EXISTS device_type TEXT DEFAULT 'Desktop';

-- Performance indexes for analytics filters
CREATE INDEX IF NOT EXISTS idx_website_analytics_country ON public.website_analytics(country);
CREATE INDEX IF NOT EXISTS idx_website_analytics_referrer ON public.website_analytics(referrer);
CREATE INDEX IF NOT EXISTS idx_website_analytics_device_type ON public.website_analytics(device_type);
