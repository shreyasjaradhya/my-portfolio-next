import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getSkills } from "@/lib/supabase/queries";
import SkillsManager from "./SkillsManager";
import styles from "./skills.module.css";

export const metadata = {
  title: "Manage Skills | System Admin",
};

export default async function AdminSkillsPage() {
  const supabase = await createClient();
  
  // Verify authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/admin/login");
  }

  // Fetch the existing skills data
  const { data: skills, error: skillsError } = await getSkills(supabase);

  if (skillsError) {
    return (
      <div className={styles.container}>
        <div className={styles.main}>
          <div className={styles.error} style={{ marginTop: "2rem" }}>
            Failed to load skills: {skillsError}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Skills Management</h1>
        <Link href="/admin" className={styles.backLink}>
          ← Back to Dashboard
        </Link>
      </header>

      <main className={styles.main}>
        <SkillsManager initialSkills={skills || []} />
      </main>
    </div>
  );
}

