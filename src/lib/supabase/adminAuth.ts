import { redirect } from "next/navigation";
import { createClient } from "./server";

export interface AdminUser {
  id: string;
  email: string;
}

export const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "shreyasjaradhya@gmail.com").toLowerCase();

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return email.trim().toLowerCase() === ADMIN_EMAIL;
}

/**
 * Robust server-side admin authentication check for Server Components.
 * Strictly verifies the authenticated session via Supabase server client
 * and enforces that the caller's email matches the authorized administrator.
 * Redirects to /admin/login if unauthenticated or unauthorized.
 */
export async function requireAdminAuth(): Promise<AdminUser> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user || !user.email || !isAdminEmail(user.email)) {
    redirect("/admin/login");
  }

  return {
    id: user.id,
    email: user.email,
  };
}
