import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getProjects } from "@/lib/supabase/queries";
import ProjectsManager from "./ProjectsManager";
import styles from "./projects.module.css";

export const metadata = {
  title: "Manage Projects | System Admin",
};

export default async function AdminProjectsPage() {
  const supabase = await createClient();
  
  // Verify authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/admin/login");
  }

  // Fetch the existing projects data
  const { data: projects, error: projectsError } = await getProjects(supabase);

  if (projectsError) {
    return (
      <div className={styles.container}>
        <div className={styles.main}>
          <div className={styles.error} style={{ marginTop: "2rem" }}>
            Failed to load projects: {projectsError}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Project Management</h1>
        <Link href="/admin" className={styles.backLink}>
          ← Back to Dashboard
        </Link>
      </header>

      <main className={styles.main}>
        <ProjectsManager initialProjects={projects || []} />
      </main>
    </div>
  );
}

