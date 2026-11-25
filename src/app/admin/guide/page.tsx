import Link from "next/link";
import { requireAdminAuth } from "@/lib/supabase/adminAuth";
import { getDashboardStats } from "../dashboardData";
import GuideManager from "./GuideManager";
import styles from "./guide.module.css";

export const metadata = {
  title: "Guide AI Assistant | System Admin",
};

export default async function AdminGuidePage() {
  await requireAdminAuth();
  const stats = await getDashboardStats();

  let activeProvider = "Grounded Knowledge Engine";
  if (process.env.GEMINI_API_KEY) {
    activeProvider = "Google Gemini 2.0 Flash (Cloud LLM)";
  } else if (process.env.OPENAI_API_KEY) {
    activeProvider = "OpenAI GPT-4o-mini (Cloud LLM)";
  } else if (process.env.GROQ_API_KEY) {
    activeProvider = "Groq Llama 3.3 70B (Cloud LLM)";
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Guide AI Assistant Management</h1>
          <p style={{ margin: "4px 0 0 0", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
            Configure identity, suggestions, and monitor synchronized portfolio knowledge.
          </p>
        </div>
        <Link href="/admin" className={styles.backLink}>
          ← Back to Dashboard
        </Link>
      </header>

      <main className={styles.main}>
        <GuideManager
          stats={{
            projectsCount: stats.projectsCount || 8,
            skillsCount: stats.skillsCount || 14,
            experiencesCount: stats.experiencesCount || 1,
            educationCount: stats.educationCount || 1,
            certificationsCount: stats.certificationsCount || 0,
          }}
          activeProvider={activeProvider}
        />
      </main>
    </div>
  );
}
