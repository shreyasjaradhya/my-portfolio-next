"use client";

import * as motion from "framer-motion/client";
import type { Testimonial } from "@/lib/supabase/types";
import styles from "./Testimonials.module.css";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5 }
  },
};

export default function Testimonials({ testimonials }: { testimonials: Testimonial[] }) {
  if (!testimonials || testimonials.length === 0) return null;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const renderStars = (rating: number) => {
    return (
      <div className={styles.rating} aria-label={`Rating: ${rating} out of 5 stars`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} style={{ opacity: star <= rating ? 1 : 0.3 }}>
            ★
          </span>
        ))}
      </div>
    );
  };

  return (
    <section id="testimonials" className={styles.section}>
      <div className={styles.container}>
        <motion.h2 
          className={styles.title}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          People <span className={styles.titleAccent}>Say</span>
        </motion.h2>

        <motion.div 
          className={styles.grid}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {testimonials.map((t) => (
            <motion.div key={t.id} className={styles.card} variants={cardVariants}>
              <div className={styles.header}>
                <div className={styles.avatarContainer}>
                  {t.avatar_url ? (
                    <img 
                      src={t.avatar_url} 
                      alt={`${t.name}'s avatar`} 
                      className={styles.avatarImage}
                      loading="lazy"
                    />
                  ) : (
                    <div className={styles.avatarFallback}>
                      {getInitials(t.name)}
                    </div>
                  )}
                </div>
                
                <div className={styles.authorInfo}>
                  <div className={styles.name}>{t.name}</div>
                  {(t.role || t.company) && (
                    <div className={styles.roleCompany}>
                      {t.role} {t.role && t.company && "at "} {t.company}
                    </div>
                  )}
                  {t.rating && renderStars(t.rating)}
                </div>
              </div>

              <div className={styles.content}>
                {t.content}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
