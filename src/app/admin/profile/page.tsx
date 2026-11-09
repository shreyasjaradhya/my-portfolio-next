import Link from "next/link";
import { createPublicClient } from "@/lib/supabase/server";
import { requireAdminAuth } from "@/lib/supabase/adminAuth";
import { getProfile } from "@/lib/supabase/queries";
import ProfileForm from "./ProfileForm";
import styles from "./profile.module.css";

export const metadata = {
  title: "Manage Profile | System Admin",
};

export default async function AdminProfilePage() {
  await requireAdminAuth();
  const publicSupabase = createPublicClient();
  
  // Fetch the existing profile data using the public client
  const { data: profile, error: profileError } = await getProfile(publicSupabase);

  if (profileError || !profile) {
    return (
      <div className={styles.container}>
        <div className={styles.main}>
          <div className={styles.error}>
            Failed to load profile data: {profileError || "Profile not found"}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Profile Management</h1>
        <Link href="/admin" className={styles.backLink}>
          ← Back to Dashboard
        </Link>
      </header>

      <main className={styles.main}>
        <ProfileForm initialProfile={profile} />
      </main>
    </div>
  );
}
