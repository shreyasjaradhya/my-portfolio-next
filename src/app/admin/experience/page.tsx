import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireAdminAuth } from "@/lib/supabase/adminAuth";
import { getExperiences } from "@/lib/supabase/queries";
import ExperienceManager from "./ExperienceManager";
import styles from "./experience.module.css";

export const metadata = {
  title: "Manage Experience | System Admin",
};

export default async function AdminExperiencePage() {
  await requireAdminAuth();
  const supabase = await createClient();
  
  // Fetch the existing experience data
  const { data: experiences, error: expError } = await getExperiences(supabase);

  if (expError) {
    return (
      <div className={styles.container}>
        <div className={styles.main}>
          <div className={styles.error} style={{ marginTop: "2rem" }}>
            Failed to load experience records: {expError}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Experience Management</h1>
        <Link href="/admin" className={styles.backLink}>
          ← Back to Dashboard
        </Link>
      </header>

      <main className={styles.main}>
        <ExperienceManager initialExperiences={experiences || []} />
      </main>
    </div>
  );
}
