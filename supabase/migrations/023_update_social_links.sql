-- Migration: 023_update_social_links
-- Description: Populate verified GitHub and LinkedIn profile URLs if currently empty or placeholder

UPDATE profiles
SET
  github_url = COALESCE(NULLIF(TRIM(github_url), ''), 'https://github.com/shreyasjaradhya'),
  linkedin_url = CASE
    WHEN linkedin_url IS NULL OR TRIM(linkedin_url) = '' OR LOWER(TRIM(linkedin_url)) IN ('https://linkedin.com', 'https://www.linkedin.com')
      THEN 'https://www.linkedin.com/in/shreyas-aradhya-0b9592321'
    ELSE linkedin_url
  END,
  email = COALESCE(NULLIF(TRIM(email), ''), 'shreyasjaradhya@gmail.com'),
  updated_at = NOW();
