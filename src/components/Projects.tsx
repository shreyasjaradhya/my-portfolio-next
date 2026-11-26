/* eslint-disable */
"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import * as motion from "framer-motion/client";
import styles from "./Projects.module.css";
import { GitHubIcon } from "./SocialIcons";
import { DEFAULT_GITHUB_URL } from "@/lib/social";
import { getProjectReport } from "@/data/projectReports";
import ProjectReportContent from "./ProjectReportContent";
import type { Project } from "@/lib/supabase/types";

export default function Projects({ projects }: { projects: Project[] }) {
  const [showAll, setShowAll] = useState(false);
  const [activeProject, setActiveProject] = useState<Project | null>(null);

  useEffect(() => {
    if (!activeProject) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveProject(null);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeProject]);

  if (projects.length === 0) return null;

  const displayedProjects = showAll ? projects : projects.slice(0, 3);
  const activeIndex = activeProject
    ? projects.findIndex((p) => p.id === activeProject.id)
    : -1;

  const navigateModalProject = (delta: number) => {
    if (activeIndex < 0 || projects.length <= 1) return;
    const nextIdx = (activeIndex + delta + projects.length) % projects.length;
    setActiveProject(projects[nextIdx]);
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
            const report = getProjectReport(project);
            const isCollection =
              project.title.toLowerCase().includes("collection") ||
              project.title.toLowerCase().includes("college");
            const actionLabel = isCollection
              ? "View Collection \u2192"
              : report
              ? "View Report \u2192"
              : "Read More \u2192";

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
                {/* Top Image Banner (Clickable to open full report) */}
                <div
                  className={`${styles.imageWrapper} ${styles.clickableImage}`}
                  onClick={() => setActiveProject(project)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setActiveProject(project);
                    }
                  }}
                  aria-label={`Open full report for ${project.title}`}
                >
                  {report && (
                    <span className={styles.reportPill}>Full Report</span>
                  )}

                  {/* Options three-dot icon */}
                  <div className={styles.optionsButton} aria-label="Open project report">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                      <circle cx="12" cy="5" r="1.8" />
                      <circle cx="12" cy="12" r="1.8" />
                      <circle cx="12" cy="19" r="1.8" />
                    </svg>
                  </div>

                  {project.image_url ? (
                    <>
                      <div className={styles.imageSkeleton} aria-hidden="true" />
                      <Image
                        src={project.image_url}
                        alt={project.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1100px) 50vw, 380px"
                        className={styles.projectImage}
                        priority={idx < 3}
                        quality={75}
                      />
                    </>
                  ) : (
                    <div className={styles.placeholderImage}>
                      <svg
                        className={styles.placeholderIcon}
                        width="38"
                        height="38"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
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
                      {project.technologies.map((tag) => (
                        <span key={tag} className={styles.tag}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card Footer: Open Report Modal + External Links */}
                <div className={styles.cardFooter}>
                  <button
                    type="button"
                    onClick={() => setActiveProject(project)}
                    className={styles.readMoreLink}
                  >
                    {actionLabel}
                  </button>

                  <div className={styles.footerRightActions}>
                    {(project.github_url || getProjectReport(project)?.repoUrl) && (
                      <a
                        href={project.github_url || getProjectReport(project)?.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.liveDemoBtn}
                        aria-label={`View ${project.title} on GitHub`}
                      >
                        Code
                      </a>
                    )}
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
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom Actions: View more button & Down chevron */}
        <div className={styles.bottomActions}>
          <div className={styles.actionButtonsRow}>
            {projects.length > 3 && (
              <button
                type="button"
                onClick={() => setShowAll((prev) => !prev)}
                className={styles.viewMoreBtn}
              >
                {showAll ? "View less" : `View all ${projects.length} projects`}
              </button>
            )}

            <a
              href={DEFAULT_GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.githubMoreBtn}
            >
              <GitHubIcon size={16} />
              <span>View All on GitHub ↗</span>
            </a>
          </div>

          <div className={styles.chevronIndicator} aria-hidden="true">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="7 9 12 14 17 9" />
              <polyline points="7 13 12 18 17 13" />
            </svg>
          </div>
        </div>
      </div>

      {/* Interactive Full Project Report Modal rendered via Portal above fixed header */}
      {activeProject &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className={styles.reportModalBackdrop}
            onClick={() => setActiveProject(null)}
            role="dialog"
            aria-modal="true"
            aria-label={`${activeProject.title} Project Report`}
          >
            <div
              className={styles.reportModalPanel}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.reportModalTopBar}>
                <div className={styles.modalNavGroup}>
                  <button
                    type="button"
                    onClick={() => navigateModalProject(-1)}
                    className={styles.modalNavBtn}
                    aria-label="Previous project report"
                  >
                    ← Prev
                  </button>
                  <span className={styles.modalCounter}>
                    {activeIndex + 1} / {projects.length}
                  </span>
                  <button
                    type="button"
                    onClick={() => navigateModalProject(1)}
                    className={styles.modalNavBtn}
                    aria-label="Next project report"
                  >
                    Next →
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveProject(null)}
                  className={styles.modalCloseBtn}
                  aria-label="Close project report modal"
                >
                  ✕ Close
                </button>
              </div>

              <div className={styles.reportModalScrollBody}>
                <ProjectReportContent
                  project={activeProject}
                  report={getProjectReport(activeProject)}
                  mode="modal"
                />
              </div>
            </div>
          </div>,
          document.body
        )}
    </section>
  );
}
