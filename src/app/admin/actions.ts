"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function revalidateHomepage() {
  const supabase = await createClient();
  
  // Verify authentication securely via the server-side Supabase client
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Unauthorized: Only authenticated admins can trigger cache invalidation.");
  }

  // Revalidate the root homepage
  revalidatePath("/", "page");
}
