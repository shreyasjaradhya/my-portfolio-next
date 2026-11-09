import styles from "./AdminSkeleton.module.css";

interface AdminSkeletonProps {
  mode?: "dashboard" | "manager" | "profile";
  pageTitle?: string;
}

export default function AdminSkeleton({ mode = "dashboard", pageTitle }: AdminSkeletonProps) {
  if (mode === "dashboard") {
    return (
      <div className={styles.skeletonContainer} aria-busy="true" aria-live="polite">
        <header className={styles.skeletonHeader}>
          <div className={`${styles.shimmer} ${styles.skeletonTitle}`} />
          <div className={`${styles.shimmer} ${styles.skeletonUserPill}`} />
        </header>

        <main className={styles.skeletonMain}>
          <div className={styles.skeletonWelcome}>
            <div className={`${styles.shimmer} ${styles.skeletonWelcomeTitle}`} />
            <div className={`${styles.shimmer} ${styles.skeletonWelcomeSub}`} />
          </div>

          <div className={styles.dashboardGrid}>
            <div className={styles.statsGrid}>
              {[...Array(8)].map((_, i) => (
                <div key={i} className={styles.statCard}>
                  <div className={styles.statHeader}>
                    <div className={`${styles.shimmer} ${styles.statIcon}`} />
                    <div className={`${styles.shimmer} ${styles.statLabel}`} />
                  </div>
                  <div className={`${styles.shimmer} ${styles.statValue}`} />
                </div>
              ))}
            </div>

            <div className={styles.sidePanel}>
              <div className={styles.panelBox}>
                <div className={`${styles.shimmer} ${styles.panelTitle}`} />
                <div className={styles.actionGrid}>
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className={`${styles.shimmer} ${styles.actionItem}`} />
                  ))}
                </div>
              </div>

              <div className={styles.panelBox}>
                <div className={`${styles.shimmer} ${styles.panelTitle}`} />
                {[...Array(3)].map((_, i) => (
                  <div key={i} className={`${styles.shimmer} ${styles.recentMsgItem}`} />
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Manager skeleton (Projects, Skills, Experience, Education, Certs, etc.)
  return (
    <div className={styles.skeletonContainer} aria-busy="true" aria-live="polite">
      <header className={styles.skeletonHeader}>
        {pageTitle ? (
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0 }}>{pageTitle}</h1>
        ) : (
          <div className={`${styles.shimmer} ${styles.skeletonTitle}`} />
        )}
        <div className={`${styles.shimmer} ${styles.skeletonBackLink}`} />
      </header>

      <main className={styles.skeletonMain}>
        <div className={styles.managerToolbar}>
          <div className={`${styles.shimmer} ${styles.managerTitle}`} />
          <div className={`${styles.shimmer} ${styles.managerAddBtn}`} />
        </div>

        <div className={styles.managerGrid}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className={styles.managerCard}>
              <div className={`${styles.shimmer} ${styles.cardHeader}`} />
              <div className={`${styles.shimmer} ${styles.cardBody}`} />
              <div className={styles.cardFooter}>
                <div className={`${styles.shimmer} ${styles.cardPill}`} />
                <div className={styles.cardActions}>
                  <div className={`${styles.shimmer} ${styles.cardActionBtn}`} />
                  <div className={`${styles.shimmer} ${styles.cardActionBtn}`} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
