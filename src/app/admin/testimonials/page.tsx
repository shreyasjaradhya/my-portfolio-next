import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getTestimonials } from "@/lib/supabase/queries";
import TestimonialsManager from "./TestimonialsManager";
import styles from "./testimonials.module.css";

export const metadata = {
  title: "Manage Testimonials | System Admin",
};

export default async function AdminTestimonialsPage() {
  const supabase = await createClient();
  
  // Verify authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/admin/login");
  }

  // Fetch the existing testimonials data
  const { data: testimonials, error: fetchError } = await getTestimonials(supabase);

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
