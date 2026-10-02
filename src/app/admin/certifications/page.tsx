import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCertifications } from "@/lib/supabase/queries";
import CertificationsManager from "./CertificationsManager";
import styles from "./certifications.module.css";

export const metadata = {
  title: "Manage Certifications | System Admin",
};

export default async function AdminCertificationsPage() {
  const supabase = await createClient();
  
  // Verify authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/admin/login");
  }

  // Fetch the existing certifications data
  const { data: certifications, error: certsError } = await getCertifications(supabase);

  if (certsError) {
    return (
      <div className={styles.container}>
        <div className={styles.main}>
          <div className={styles.error} style={{ marginTop: "2rem" }}>
            Failed to load certifications: {certsError}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Certifications Management</h1>
        <Link href="/admin" className={styles.backLink}>
          ← Back to Dashboard
        </Link>
      </header>

      <main className={styles.main}>
        <CertificationsManager initialCertifications={certifications || []} />
      </main>
    </div>
  );
}

