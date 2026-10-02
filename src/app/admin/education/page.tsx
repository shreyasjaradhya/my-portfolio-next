import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getEducation } from "@/lib/supabase/queries";
import EducationManager from "./EducationManager";
import styles from "./education.module.css";

export const metadata = {
  title: "Manage Education | System Admin",
};

export default async function AdminEducationPage() {
  const supabase = await createClient();
  
  // Verify authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/admin/login");
  }

  // Fetch the existing education data
  const { data: education, error: eduError } = await getEducation(supabase);

  if (eduError) {
    return (
      <div className={styles.container}>
        <div className={styles.main}>
          <div className={styles.error} style={{ marginTop: "2rem" }}>
            Failed to load education records: {eduError}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Education Management</h1>
        <Link href="/admin" className={styles.backLink}>
          ← Back to Dashboard
        </Link>
      </header>

      <main className={styles.main}>
        <EducationManager initialEducation={education || []} />
      </main>
    </div>
  );
}

