"use client";

import * as motion from "framer-motion/client";
import styles from "./Achievements.module.css";
import type { Achievement } from "@/lib/supabase/types";

export default function Achievements({ achievements }: { achievements: Achievement[] }) {
  if (!achievements || achievements.length === 0) {
    return null;
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  return (
    <section id="achievements" className={styles.section}>
      <div className={styles.container}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <h2 className={styles.heading}>Achievements.</h2>
        </motion.div>

        <div className={styles.timeline}>
          {achievements.map((achievement, index) => (
            <motion.div
              key={achievement.id}
              className={styles.card}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className={styles.node} />
              <div className={styles.content}>
                <div className={styles.titleRow}>
                  <h3 className={styles.title}>{achievement.title}</h3>
                  {achievement.date && (
                    <span className={styles.date}>{formatDate(achievement.date)}</span>
                  )}
                </div>
                
                {achievement.description && (
                  <p className={styles.description}>{achievement.description}</p>
                )}
                
                {achievement.url && (
                  <a
                    href={achievement.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.linkBtn}
                  >
                    View details →
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
