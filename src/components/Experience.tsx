/* eslint-disable */
"use client";

import { useState } from "react";
import * as motion from "framer-motion/client";
import styles from "./Experience.module.css";
import type { Experience } from "@/lib/supabase/types";

export default function ExperienceSection({ experiences }: { experiences: Experience[] }) {
  const [showAll, setShowAll] = useState(false);

  if (!experiences || experiences.length === 0) return null;

  // Show first 2 experiences by default, or all when toggled
  const displayedExperiences = showAll ? experiences : experiences.slice(0, 2);

  return (
    <section id="experience" className={styles.experienceSection}>
      <div className={styles.container}>
        {/* Section Heading: Centered */}
        <motion.div 
          className={styles.header}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <p className={styles.subtitle}>My Professional Journey</p>
          <h2 className={styles.heading}>Experiences</h2>
        </motion.div>

        {/* Experiences Grid: Centered when single, 2-column when multiple */}
        <div className={displayedExperiences.length === 1 ? styles.singleGrid : styles.grid}>
          {displayedExperiences.map((exp, idx) => {
            const roleType = exp.title.toLowerCase().includes("intern") ? "Internship" : "Experience";
            const badgeLabel = exp.organization || roleType;

            return (
              <motion.div 
                key={exp.id}
                className={styles.card}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: 0.1 * (idx % 2) }}
                whileHover={{ y: -6 }}
              >
                {/* Top Image Banner */}
                <div className={styles.imageWrapper}>
                  {/* Category / Role Pill Badge inside card top-left */}
                  <div className={styles.categoryBadge}>
                    <span className={styles.badgeDot} />
                    <span>{badgeLabel}</span>
                  </div>

                  {exp.image_url ? (
                    <img 
                      src={exp.image_url} 
                      alt={exp.title} 
                      className={styles.experienceImage} 
                      loading="lazy" 
                    />
                  ) : (
                    <div className={styles.placeholderImage}>
                      <svg className={styles.placeholderIcon} width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                      </svg>
                    </div>
                  )}

                  {/* Gradient Overlay with Experience Title */}
                  <div className={styles.imageOverlay}>
                    <h3 className={styles.cardTitle}>{exp.title}</h3>
                    {exp.organization && exp.organization !== badgeLabel && (
                      <span className={styles.cardOrg}>{exp.organization}</span>
                    )}
                  </div>
                </div>

                {/* Card Body: Centered Description & Pill Tags */}
                <div className={styles.cardBody}>
                  <p className={styles.cardDesc}>{exp.description}</p>
                  
                  {exp.technologies && exp.technologies.length > 0 && (
                    <div className={styles.tags}>
                      {exp.technologies.map(tag => (
                        <span key={tag} className={styles.tag}>{tag}</span>
                      ))}
                    </div>
                  )}

                  {/* Explore Pill Link */}
                  <div className={styles.buttonWrapper}>
                    <a href="#contact" className={styles.exploreBtn}>
                      Explore Details →
                    </a>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom Actions: View more button when > 2 experiences */}
        {experiences.length > 2 && (
          <div className={styles.bottomActions}>
            <button 
              type="button" 
              onClick={() => setShowAll(prev => !prev)} 
              className={styles.viewMoreBtn}
            >
              {showAll ? "View less" : "View more"}
            </button>

            <div className={styles.chevronIndicator} aria-hidden="true">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="7 9 12 14 17 9" />
                <polyline points="7 13 12 18 17 13" />
              </svg>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
