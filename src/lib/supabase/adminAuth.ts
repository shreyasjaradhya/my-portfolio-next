import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "./server";

export interface AdminUser {
  id: string;
  email: string;
}

/**
 * Fast-path admin authentication check for Server Components.
 * Reads verified headers passed from proxy.ts (0ms latency, zero network calls).
 * Falls back to secure Supabase server client if headers are missing.
 */
export async function requireAdminAuth(): Promise<AdminUser> {
  const headersList = await headers();
  const isVerified = headersList.get("x-admin-verified");
  const userId = headersList.get("x-user-id");
  const userEmail = headersList.get("x-user-email");

  if (isVerified === "true" && userId && userEmail) {
    return {
      id: userId,
      email: userEmail,
    };
  }

  // Fallback: verify directly with Supabase server client
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user || !user.email) {
    redirect("/admin/login");
  }

  return {
    id: user.id,
    email: user.email,
  };
}
