/* eslint-disable */
"use client";

import { useState } from "react";
import * as motion from "framer-motion/client";
import styles from "./Projects.module.css";
import type { Project } from "@/lib/supabase/types";

export default function Projects({ projects }: { projects: Project[] }) {
  const [showAll, setShowAll] = useState(false);

  if (projects.length === 0) return null;

  // Show first 3 projects by default as in the reference design, or all when toggled
  const displayedProjects = showAll ? projects : projects.slice(0, 3);

  // Helper for ribbon badge matching reference screenshot (Collection, Completed, In Progress)
  const getRibbon = (project: Project, idx: number) => {
    if (project.title.toLowerCase().includes("collection") || project.title.toLowerCase().includes("college")) {
      return { label: "Collection", className: styles.ribbonCollection };
    }
    const badges = [
      { label: "Collection", className: styles.ribbonCollection },
      { label: "Completed", className: styles.ribbonCompleted },
      { label: "In Progress", className: styles.ribbonInProgress },
    ];
    return badges[idx % badges.length];
  };

  return (
    <section id="projects" className={styles.projectsSection}>
      <div className={styles.container}>
        {/* Section Header: Centered */}
        <motion.div 
          className={styles.header}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <p className={styles.subtitle}>Browse My Recent</p>
          <h2 className={styles.heading}>Projects</h2>
        </motion.div>

        {/* 3-Column Projects Grid */}
        <div className={styles.grid}>
          {displayedProjects.map((project, idx) => {
            const ribbon = getRibbon(project, idx);
            const isCollection = project.title.toLowerCase().includes("collection") || project.title.toLowerCase().includes("college");
            const leftActionText = isCollection ? "View Collection \u2192" : "Read More \u2192";
            const leftActionHref = project.github_url || project.live_url || "#";

            return (
              <motion.div 
                key={project.id}
                className={styles.card}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: 0.1 * (idx % 3) }}
                whileHover={{ y: -6 }}
              >
                {/* Diagonal Corner Ribbon */}
                <div className={styles.ribbonContainer}>
                  <span className={`${styles.ribbon} ${ribbon.className}`}>
                    {ribbon.label}
                  </span>
                </div>

                {/* Top Image Banner with 3-dot options & Title Inside Overlay */}
                <div className={styles.imageWrapper}>
                  {/* Options three-dot icon */}
                  <div className={styles.optionsButton} aria-label="Project options">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                      <circle cx="12" cy="5" r="1.8" />
                      <circle cx="12" cy="12" r="1.8" />
                      <circle cx="12" cy="19" r="1.8" />
                    </svg>
                  </div>

                  {project.image_url ? (
                    <img 
                      src={project.image_url} 
                      alt={project.title} 
                      className={styles.projectImage} 
                      loading="lazy" 
                    />
                  ) : (
                    <div className={styles.placeholderImage}>
                      <svg className={styles.placeholderIcon} width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                        <line x1="8" y1="21" x2="16" y2="21" />
                        <line x1="12" y1="17" x2="12" y2="21" />
                      </svg>
                    </div>
                  )}

                  {/* Gradient Overlay with Project Title Inside */}
                  <div className={styles.imageOverlay}>
                    <h3 className={styles.cardTitle}>{project.title}</h3>
                  </div>
                </div>

                {/* Card Body: Centered Description & Pill Tags */}
                <div className={styles.cardBody}>
                  <p className={styles.cardDesc}>{project.description}</p>
                  
                  {project.technologies && project.technologies.length > 0 && (
                    <div className={styles.tags}>
                      {project.technologies.map(tag => (
                        <span key={tag} className={styles.tag}>{tag}</span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card Footer: Read More Link & Live Demo Pill Button */}
                <div className={styles.cardFooter}>
                  <a 
                    href={leftActionHref} 
                    target={leftActionHref !== "#" ? "_blank" : undefined}
                    rel="noopener noreferrer" 
                    className={styles.readMoreLink}
                  >
                    {leftActionText}
                  </a>

                  {project.live_url && (
                    <a 
                      href={project.live_url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className={styles.liveDemoBtn}
                    >
                      Live Demo
                    </a>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom Actions: View more button & Down chevron */}
        <div className={styles.bottomActions}>
          {projects.length > 3 && (
            <button 
              type="button" 
              onClick={() => setShowAll(prev => !prev)} 
              className={styles.viewMoreBtn}
            >
              {showAll ? "View less" : "View more"}
            </button>
          )}

          <div className={styles.chevronIndicator} aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="7 9 12 14 17 9" />
              <polyline points="7 13 12 18 17 13" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}