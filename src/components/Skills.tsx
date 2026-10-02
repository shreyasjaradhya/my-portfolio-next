import * as motion from "framer-motion/client";
import styles from "./Skills.module.css";
import type { Skill } from "@/lib/supabase/types";

export default function Skills({ skills }: { skills: Skill[] }) {
  // Group skills by category
  const groupedSkills = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  const categories = Object.keys(groupedSkills);

  if (categories.length === 0) return null;

  return (
    <section id="skills" className={styles.skillsSection}>
      <div className={styles.container}>
        <motion.div 
          className={styles.header}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <h2 className={styles.heading}>Technical Skills.</h2>
        </motion.div>

        <div className={styles.grid}>
          {categories.map((category, idx) => (
            <motion.div 
              key={category}
              className={styles.card}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.1 * idx }}
              whileHover={{ y: -5 }}
            >
              <h3 className={styles.cardTitle}>{category}</h3>
              <ul className={styles.list}>
                {groupedSkills[category].map(skill => (
                  <li key={skill.id} className={styles.listItem}>
                    <span className={styles.bullet}></span>
                    {skill.name}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}