"use client";

import * as motion from "framer-motion/client";
import styles from "./Certifications.module.css";
import type { Certification } from "@/lib/supabase/types";

export default function Certifications({ certifications }: { certifications: Certification[] }) {
  if (!certifications || certifications.length === 0) {
    return null;
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long"
    });
  };

  return (
    <section id="certifications" className={styles.section}>
      <div className={styles.container}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <h2 className={styles.heading}>Certifications.</h2>
        </motion.div>

        <div className={styles.grid}>
          {certifications.map((cert, index) => (
            <motion.div
              key={cert.id}
              className={styles.card}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className={styles.cardHeader}>
                <h3 className={styles.title}>{cert.name}</h3>
                <div className={styles.issuer}>{cert.issuer}</div>
                {cert.issue_date && (
                  <div className={styles.date}>Issued: {formatDate(cert.issue_date)}</div>
                )}
              </div>
              
              {cert.description && (
                <p className={styles.description}>{cert.description}</p>
              )}
              
              <div className={styles.actions}>
                {cert.certificate_url && (
                  <a
                    href={cert.certificate_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${styles.btn} ${styles.primaryBtn}`}
                  >
                    View Certificate
                  </a>
                )}
                {cert.credential_url && (
                  <a
                    href={cert.credential_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.btn}
                  >
                    View Credential
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
