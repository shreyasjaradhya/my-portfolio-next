import type { Profile } from "@/lib/supabase/types";

export const DEFAULT_GITHUB_URL = "https://github.com/shreyasjaradhya";
export const DEFAULT_LINKEDIN_URL = "https://www.linkedin.com/in/shreyas-aradhya-0b9592321";
export const DEFAULT_EMAIL = "shreyasjaradhya@gmail.com";

function isGenericDomainPlaceholder(url: string | undefined | null, domains: string[]): boolean {
  if (!url) return true;
  const normalized = url.trim().replace(/\/+$/, "").toLowerCase();
  return !normalized || domains.includes(normalized);
}

/**
 * Resolves social and contact URLs from a profile record with verified fallbacks
 * so links remain active even when optional database fields are empty or unset.
 */
export function getSocialLinks(profile: Profile | null | undefined) {
  const githubUrl = isGenericDomainPlaceholder(profile?.github_url, [
    "https://github.com",
    "http://github.com",
  ])
    ? DEFAULT_GITHUB_URL
    : profile!.github_url!.trim();

  const linkedinUrl = isGenericDomainPlaceholder(profile?.linkedin_url, [
    "https://linkedin.com",
    "https://www.linkedin.com",
    "http://linkedin.com",
    "http://www.linkedin.com",
  ])
    ? DEFAULT_LINKEDIN_URL
    : profile!.linkedin_url!.trim();

  const email = profile?.email?.trim() || DEFAULT_EMAIL;

  return { githubUrl, linkedinUrl, email };
}
