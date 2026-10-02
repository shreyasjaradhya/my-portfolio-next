import * as motion from "framer-motion/client";
import styles from "./Projects.module.css";
import type { Project } from "@/lib/supabase/types";

export default function Projects({ projects }: { projects: Project[] }) {
  if (projects.length === 0) return null;

  return (
    <section id="projects" className={styles.projectsSection}>
      <div className={styles.container}>
        <motion.div 
          className={styles.header}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <h2 className={styles.heading}>Selected Projects.</h2>
        </motion.div>

        <div className={styles.grid}>
          {projects.map((project, idx) => (
            <motion.div 
              key={project.id}
              className={styles.card}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.1 * idx }}
              whileHover={{ y: -5 }}
            >
              <div className={styles.cardNumber}>
                {(idx + 1).toString().padStart(2, '0')}
              </div>
              <h3 className={styles.cardTitle}>{project.title}</h3>
              <p className={styles.cardDesc}>{project.description}</p>
              
              <div className={styles.tags}>
                {project.technologies?.map(tag => (
                  <span key={tag} className={styles.tag}>{tag}</span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}