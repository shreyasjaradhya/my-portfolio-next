import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireAdminAuth } from "@/lib/supabase/adminAuth";
import { getAllTestimonialsAdmin } from "@/lib/supabase/queries";
import TestimonialsManager from "./TestimonialsManager";
import styles from "./testimonials.module.css";

export const metadata = {
  title: "Manage Testimonials | System Admin",
};

export default async function AdminTestimonialsPage() {
  await requireAdminAuth();
  const supabase = await createClient();
  
  // Fetch all testimonials data for moderation (pending, approved, rejected)
  const { data: testimonials, error: fetchError } = await getAllTestimonialsAdmin(supabase);

  if (fetchError) {
    return (
      <div className={styles.container}>
        <div className={styles.main}>
          <div className={styles.error} style={{ marginTop: "2rem" }}>
            Failed to load testimonials: {fetchError}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Testimonials Management</h1>
        <Link href="/admin" className={styles.backLink}>
          ← Back to Dashboard
        </Link>
      </header>

      <main className={styles.main}>
        <TestimonialsManager initialTestimonials={testimonials || []} />
      </main>
    </div>
  );
}
