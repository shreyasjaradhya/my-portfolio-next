import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getAchievements } from "@/lib/supabase/queries";
import AchievementsManager from "./AchievementsManager";
import styles from "./achievements.module.css";

export const metadata = {
  title: "Manage Achievements | System Admin",
};

export default async function AdminAchievementsPage() {
  const supabase = await createClient();
  
  // Verify authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/admin/login");
  }

  // Fetch the existing achievements data
  const { data: achievements, error: fetchError } = await getAchievements(supabase);

  if (fetchError) {
    return (
      <div className={styles.container}>
        <div className={styles.main}>
          <div className={styles.error} style={{ marginTop: "2rem" }}>
            Failed to load achievements: {fetchError}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Achievements Management</h1>
        <Link href="/admin" className={styles.backLink}>
          ← Back to Dashboard
        </Link>
      </header>

      <main className={styles.main}>
        <AchievementsManager initialAchievements={achievements || []} />
      </main>
    </div>
  );
}

