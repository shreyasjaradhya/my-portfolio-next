import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "./LogoutButton";
import styles from "./admin.module.css";
import type { Message } from "@/lib/supabase/types";

export const metadata = {
  title: "System Admin | Portfolio",
};

export default async function AdminDashboard() {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/admin/login");
  }

  // Fetch all counts securely in parallel
  const [
    { count: projectsCount },
    { count: skillsCount },
    { count: experiencesCount },
    { count: educationCount },
    { count: certificationsCount },
    { count: achievementsCount },
    { count: testimonialsCount },
    { count: totalMessagesCount },
    { count: unreadMessagesCount },
    { data: recentMessages }
  ] = await Promise.all([
    supabase.from("projects").select("*", { count: 'exact', head: true }),
    supabase.from("skills").select("*", { count: 'exact', head: true }),
    supabase.from("experiences").select("*", { count: 'exact', head: true }),
    supabase.from("education").select("*", { count: 'exact', head: true }),
    supabase.from("certifications").select("*", { count: 'exact', head: true }),
    supabase.from("achievements").select("*", { count: 'exact', head: true }),
    supabase.from("testimonials").select("*", { count: 'exact', head: true }),
    supabase.from("messages").select("*", { count: 'exact', head: true }),
    supabase.from("messages").select("*", { count: 'exact', head: true }).eq("status", "unread"),
    supabase.from("messages").select("*").order("created_at", { ascending: false }).limit(5)
  ]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const hasUnread = (unreadMessagesCount || 0) > 0;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>System Control</h1>
        <div className={styles.userInfo}>
          <span className={styles.email}>{user.email}</span>
          <LogoutButton />
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.welcome}>
          <h2>Welcome back.</h2>
          <p>System authorized. Overview of portfolio data structures.</p>
        </section>

        <div className={styles.dashboardGrid}>
          {/* Main Stats Grid */}
          <div className={styles.statsGrid}>
            <Link 
              href="/admin/messages" 
              className={`${styles.statCard} ${hasUnread ? styles.statCardUnread : ''}`}
            >
              <div className={styles.statHeader}>
                <span className={styles.statIcon} aria-hidden="true">✉</span>
                <span className={styles.statLabel}>Messages</span>
              </div>
              <div className={styles.statValueContainer}>
                <span className={styles.statValue}>{totalMessagesCount ?? '—'}</span>
                {hasUnread && (
                  <span className={styles.statSubtext}>{unreadMessagesCount} unread</span>
                )}
              </div>
            </Link>

            <Link href="/admin/projects" className={styles.statCard}>
              <div className={styles.statHeader}>
                <span className={styles.statIcon} aria-hidden="true">⚡</span>
                <span className={styles.statLabel}>Projects</span>
              </div>
              <span className={styles.statValue}>{projectsCount ?? '—'}</span>
            </Link>

            <Link href="/admin/skills" className={styles.statCard}>
              <div className={styles.statHeader}>
                <span className={styles.statIcon} aria-hidden="true">⚙</span>
                <span className={styles.statLabel}>Skills</span>
              </div>
              <span className={styles.statValue}>{skillsCount ?? '—'}</span>
            </Link>

            <Link href="/admin/experience" className={styles.statCard}>
              <div className={styles.statHeader}>
                <span className={styles.statIcon} aria-hidden="true">💼</span>
                <span className={styles.statLabel}>Experience</span>
              </div>
              <span className={styles.statValue}>{experiencesCount ?? '—'}</span>
            </Link>

            <Link href="/admin/education" className={styles.statCard}>
              <div className={styles.statHeader}>
                <span className={styles.statIcon} aria-hidden="true">🎓</span>
                <span className={styles.statLabel}>Education</span>
              </div>
              <span className={styles.statValue}>{educationCount ?? '—'}</span>
            </Link>

            <Link href="/admin/certifications" className={styles.statCard}>
              <div className={styles.statHeader}>
                <span className={styles.statIcon} aria-hidden="true">📄</span>
                <span className={styles.statLabel}>Certifications</span>
              </div>
              <span className={styles.statValue}>{certificationsCount ?? '—'}</span>
            </Link>

            <Link href="/admin/achievements" className={styles.statCard}>
              <div className={styles.statHeader}>
                <span className={styles.statIcon} aria-hidden="true">🏆</span>
                <span className={styles.statLabel}>Achievements</span>
              </div>
              <span className={styles.statValue}>{achievementsCount ?? '—'}</span>
            </Link>

            <Link href="/admin/testimonials" className={styles.statCard}>
              <div className={styles.statHeader}>
                <span className={styles.statIcon} aria-hidden="true">💬</span>
                <span className={styles.statLabel}>Testimonials</span>
              </div>
              <span className={styles.statValue}>{testimonialsCount ?? "-"}</span>
            </Link>
          </div>

          {/* Side Panel */}
          <div className={styles.sidePanel}>
            <section className={styles.panelSection}>
              <h3 className={styles.panelTitle}>
                <span aria-hidden="true">⚡</span> Quick Actions
              </h3>
              <div className={styles.quickActions}>
                <Link href="/admin/profile" className={styles.actionLink}>Edit Profile Overview</Link>
                <Link href="/admin/projects" className={styles.actionLink}>Manage Projects</Link>
                <Link href="/admin/skills" className={styles.actionLink}>Update Skills</Link>
                <Link href="/admin/experience" className={styles.actionLink}>Manage Experience</Link>
                <Link href="/admin/education" className={styles.actionLink}>Manage Education</Link>
                <Link href="/admin/certifications" className={styles.actionLink}>Manage Certifications</Link>
                <Link href="/admin/achievements" className={styles.actionLink}>Manage Achievements</Link>
                <Link href="/admin/testimonials" className={styles.actionLink}>Manage Testimonials</Link>
              </div>
            </section>

            <section className={styles.panelSection}>
              <h3 className={styles.panelTitle}>
                <span aria-hidden="true">💬</span> Recent Messages
              </h3>
              
              {(!recentMessages || recentMessages.length === 0) ? (
                <div className={styles.emptyState}>No messages received yet.</div>
              ) : (
                <div className={styles.recentMessages}>
                  {recentMessages.map((msg: Message) => (
                    <Link key={msg.id} href="/admin/messages" className={styles.recentMsgCard}>
                      <div className={styles.recentMsgHeader}>
                        <span className={styles.recentMsgName}>{msg.name}</span>
                        <span className={styles.recentMsgDate}>{formatDate(msg.created_at)}</span>
                      </div>
                      <div className={styles.recentMsgSubject}>
                        {msg.subject || "No subject"}
                      </div>
                      <span className={`${styles.recentMsgStatus} ${msg.status === 'unread' ? styles.statusUnread : styles.statusRead}`}>
                        {msg.status}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
