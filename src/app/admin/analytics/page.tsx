import Link from "next/link";
import { requireAdminAuth } from "@/lib/supabase/adminAuth";
import { getAnalyticsDashboardData } from "@/lib/supabase/analytics";
import AnalyticsDashboard from "./AnalyticsDashboard";
import styles from "./analytics.module.css";

export const metadata = {
  title: "Website Analytics | System Admin",
  description: "Real-time visitor and traffic metrics dashboard for portfolio",
};

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  await requireAdminAuth();
  const initialData = await getAnalyticsDashboardData(30);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <div className={styles.titleBadgeRow}>
            <h1 className={styles.title}>Website Analytics</h1>
            <span className={styles.liveIndicator}>
              <span className={styles.liveDot} /> Live Tracking
            </span>
          </div>
          <p className={styles.subtitle}>
            Portfolio traffic trends, visitor counts, and audience growth analytics.
          </p>
        </div>
        <Link href="/admin" className={styles.backLink}>
          ← Back to Dashboard
        </Link>
      </header>

      <main className={styles.main}>
        <AnalyticsDashboard initialData={initialData} />
      </main>
    </div>
  );
}
