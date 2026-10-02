import * as motion from "framer-motion/client";
import styles from "./Experience.module.css";
import type { Experience } from "@/lib/supabase/types";

export default function ExperienceSection({ experiences }: { experiences: Experience[] }) {
  if (experiences.length === 0) return null;

  return (
    <section id="experience" className={styles.experienceSection}>
      <div className={styles.container}>
        <motion.div 
          className={styles.header}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <h2 className={styles.heading}>Experience.</h2>
        </motion.div>

        <div className={styles.timeline}>
          {experiences.map((exp, idx) => (
            <motion.div 
              key={exp.id}
              className={styles.timelineItem}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.1 * idx }}
            >
              <div className={styles.node}></div>
              <div className={styles.content}>
                <h3 className={styles.title}>{exp.title} — {exp.organization}</h3>
                <p className={styles.description}>
                  {exp.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}