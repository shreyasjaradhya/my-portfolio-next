/* eslint-disable */
"use client";

import { useState } from "react";
import * as motion from "framer-motion/client";
import styles from "./Certifications.module.css";
import type { Certification } from "@/lib/supabase/types";

// Genuine reference certificates matching the layout and achievements
const FALLBACK_CERTIFICATES: Certification[] = [
  {
    id: "fallback-1",
    name: "MY Bharat Budget Quest 2026 – Final Round",
    issuer: "Ministry of Youth Affairs & Sports",
    issue_date: "2026-04-12",
    credential_url: "#experience",
    certificate_url: "",
    description: "Shortlisted out of over 12 lakh participants for the Final Round of MY Bharat Budget Quest 2026—a prestigious National-Level Virtual Dialogue with the Hon'ble Prime Minister of India, Shri Narendra Modi ji.",
    tags: ["National Round", "Virtual Dialogue", "Public Policy"],
    issuer_logo_url: "/logos/emblem_india.svg",
    callout: "Organized by Ministry of Youth Affairs & Sports",
    action_label: "View Experience →",
    display_order: 1,
    created_at: new Date().toISOString()
  },
  {
    id: "fallback-2",
    name: "Certificate of Presentation – AIDE 2026",
    issuer: "IEEE & NMAMIT",
    issue_date: "2026-02-01",
    credential_url: "#projects",
    certificate_url: "",
    description: "Presented the research paper on machine learning for marketing prediction at the IEEE AIDE 2026 International Conference.",
    tags: ["Paper Presentation", "Research"],
    issuer_logo_url: "/logos/ieee.svg",
    callout: "Organized by IEEE & NMAMIT",
    action_label: "View Project →",
    display_order: 2,
    created_at: new Date().toISOString()
  },
  {
    id: "fallback-3",
    name: "AIC Nitte Internship",
    issuer: "Atal Incubation Centre Nitte",
    issue_date: "2025-05-01",
    credential_url: "#experience",
    certificate_url: "",
    description: "Completed a hands-on internship at Atal Incubation Centre Nitte, gaining practical experience in tech innovation, startup incubation processes, and entrepreneurship.",
    tags: ["1 Event Photos", "Tech Innovation"],
    issuer_logo_url: "/logos/aim.svg",
    callout: "Completed in under 4 months.",
    action_label: "View Experience →",
    display_order: 3,
    created_at: new Date().toISOString()
  }
];

export default function Certifications({ certifications }: { certifications: Certification[] }) {
  const [showAll, setShowAll] = useState(false);

  // If database contains real certificates (excluding dummy cms test), use them.
  // Otherwise use the verified reference certificate entries.
  const activeCerts = (certifications && certifications.length > 0 && !certifications.every(c => c.name.toLowerCase().includes("test")))
    ? certifications
    : FALLBACK_CERTIFICATES;

  const displayedCerts = showAll ? activeCerts : activeCerts.slice(0, 3);

  const formatDisplayDate = (cert: Certification) => {
    if (!cert.issue_date) return null;
    if (cert.id === "fallback-1") return "Completed: April 12-13, 2026";
    try {
      const d = new Date(cert.issue_date);
      if (isNaN(d.getTime())) return `Completed: ${cert.issue_date}`;
      const monthYear = d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
      return `Completed: ${monthYear}`;
    } catch {
      return `Completed: ${cert.issue_date}`;
    }
  };

  return (
    <section id="certifications" className={styles.section}>
      <div className={styles.container}>
        {/* Section Heading: Centered */}
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <p className={styles.subtitle}>My Achievements</p>
          <h2 className={styles.heading}>Certificates</h2>
        </motion.div>

        {/* 3-Column Certificates Grid */}
        <div className={styles.grid}>
          {displayedCerts.map((cert, index) => {
            const tags = cert.tags && cert.tags.length > 0
              ? cert.tags
              : (cert.description && cert.description.includes("c programming") ? ["C", "Programming"] : []);

            return (
              <motion.div
                key={cert.id}
                className={styles.card}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -6 }}
              >
                {/* Options 3-dot icon top-right */}
                <div className={styles.optionsButton} aria-label="Certificate options">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="5" r="1.8" />
                    <circle cx="12" cy="12" r="1.8" />
                    <circle cx="12" cy="19" r="1.8" />
                  </svg>
                </div>

                {/* Organization / Issuer Logo in clean white container */}
                <div className={styles.logoWrapper}>
                  {cert.issuer_logo_url ? (
                    <img
                      src={cert.issuer_logo_url}
                      alt={cert.issuer || cert.name}
                      className={styles.logoImg}
                      loading="lazy"
                    />
                  ) : (
                    <div className={styles.placeholderLogo}>
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="8" r="6" />
                        <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Title */}
                <h3 className={styles.title}>{cert.name}</h3>

                {/* Completed Date */}
                {cert.issue_date && (
                  <p className={styles.dateText}>{formatDisplayDate(cert)}</p>
                )}

                {/* Description */}
                {cert.description && (
                  <p className={styles.description}>{cert.description}</p>
                )}

                {/* Pill Badges / Tags */}
                {tags.length > 0 && (
                  <div className={styles.tags}>
                    {tags.map(tag => {
                      const isPhotoBadge = tag.toLowerCase().includes("photo") || tag.toLowerCase().includes("event");
                      return (
                        <span
                          key={tag}
                          className={`${styles.tag} ${isPhotoBadge ? styles.photoTag : ""}`}
                        >
                          {isPhotoBadge && (
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              className={styles.photoIcon}
                            >
                              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                              <circle cx="12" cy="13" r="4" />
                            </svg>
                          )}
                          {tag}
                        </span>
                      );
                    })}
                  </div>
                )}

                {/* Blue Italicized Callout Note */}
                <p className={styles.callout}>
                  {cert.callout || (cert.issuer ? `Organized by ${cert.issuer}` : "")}
                </p>

                {/* Footer Action Row: View link & Certificate button */}
                <div className={styles.actions}>
                  {cert.credential_url ? (
                    <a href={cert.credential_url} className={styles.linkAction}>
                      {cert.action_label || "View Experience →"}
                    </a>
                  ) : (
                    <span className={styles.linkAction}>
                      {cert.action_label || "View Experience →"}
                    </span>
                  )}

                  {cert.certificate_url ? (
                    <a
                      href={cert.certificate_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.certBtn}
                    >
                      Certificate
                    </a>
                  ) : (
                    <button type="button" className={styles.certBtn}>
                      Certificate
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom Actions: View more button & Down chevron */}
        <div className={styles.bottomActions}>
          {activeCerts.length > 3 && (
            <button
              type="button"
              onClick={() => setShowAll(prev => !prev)}
              className={styles.viewMoreBtn}
            >
              {showAll ? "View less" : "View more"}
            </button>
          )}

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
    </section>
  );
}
