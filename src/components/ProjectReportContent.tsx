"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./ProjectReport.module.css";
import type { Project } from "@/lib/supabase/types";
import type { ProjectReport } from "@/data/projectReports";
import { GitHubIcon } from "./SocialIcons";

type ReportTab = "all" | "architecture" | "specs" | "testing";

interface ProjectReportContentProps {
  project: Project;
  report: ProjectReport | null;
  mode?: "modal" | "page";
}

/**
 * Shared structured engineering report viewer rendered inside both the
 * homepage project modal and dedicated `/projects/[slug]` route.
 */
export default function ProjectReportContent({
  project,
  report,
  mode = "modal",
}: ProjectReportContentProps) {
  const [activeTab, setActiveTab] = useState<ReportTab>("all");

  const showOverview = activeTab === "all";
  const showArchitecture = activeTab === "all" || activeTab === "architecture";
  const showSpecs = activeTab === "all" || activeTab === "specs";
  const showTesting = activeTab === "all" || activeTab === "testing";

  // Split any admin-entered custom detailed notes cleanly for display
  const customNotes = project.detailed_description
    ? project.detailed_description.split(/\n\s*\n/).filter(Boolean)
    : [];

  return (
    <article className={`${styles.reportWrapper} ${mode === "page" ? styles.pageMode : ""}`}>
      {/* Hero Banner Header */}
      <header className={styles.reportHero}>
        {project.image_url && (
          <div className={styles.bannerImageWrap}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={project.image_url}
              alt={project.title}
              className={styles.bannerImage}
            />
            <div className={styles.bannerOverlay} />
          </div>
        )}

        <div className={styles.heroMetaRow}>
          <span className={styles.categoryBadge}>
            {report?.category || "Engineering Project"}
          </span>
          {report?.documentType && (
            <span className={styles.docTypeBadge}>{report.documentType}</span>
          )}
          {report?.dateLabel && (
            <span className={styles.dateBadge}>{report.dateLabel}</span>
          )}
        </div>

        <h1 className={styles.reportTitle}>{project.title}</h1>
        <p className={styles.reportSubtitle}>
          {report?.subtitle || project.description}
        </p>

        {/* Course / Authors / Mentor strip */}
        {report && (
          <div className={styles.attributionBox}>
            <div className={styles.attributionItem}>
              <span className={styles.attrLabel}>Context</span>
              <span className={styles.attrValue}>{report.courseOrContext}</span>
            </div>
            <div className={styles.attributionItem}>
              <span className={styles.attrLabel}>Team / Authors</span>
              <span className={styles.attrValue}>{report.authors.join(" • ")}</span>
            </div>
            {report.mentorOrDept && (
              <div className={styles.attributionItem}>
                <span className={styles.attrLabel}>Department / Guide</span>
                <span className={styles.attrValue}>{report.mentorOrDept}</span>
              </div>
            )}
          </div>
        )}

        {/* Technologies */}
        {project.technologies && project.technologies.length > 0 && (
          <div className={styles.techTags}>
            {project.technologies.map((tech) => (
              <span key={tech} className={styles.techTag}>
                {tech}
              </span>
            ))}
          </div>
        )}

        {/* Action Toolbar */}
        <div className={styles.actionToolbar}>
          {mode === "modal" && (
            <Link
              href={`/projects/${project.slug}`}
              className={styles.primaryActionBtn}
            >
              Open Full Report Page ↗
            </Link>
          )}
          <button
            type="button"
            onClick={() => window.print()}
            className={styles.secondaryActionBtn}
          >
            Print / Save PDF
          </button>
          {project.github_url && (
            <a
              href={project.github_url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.secondaryActionBtn}
            >
              <GitHubIcon size={15} />
              <span>Source Code ↗</span>
            </a>
          )}
          {project.live_url && (
            <a
              href={project.live_url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.secondaryActionBtn}
            >
              Live Demo ↗
            </a>
          )}
        </div>
      </header>

      {/* Filter Tabs (Only shown when structured report exists) */}
      {report && (
        <div className={styles.tabsRow} role="tablist" aria-label="Report Sections">
          {(
            [
              { id: "all", label: "Full Report" },
              { id: "architecture", label: "Block Architecture" },
              { id: "specs", label: "Design & Calculations" },
              { id: "testing", label: "Simulations & Results" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`${styles.tabBtn} ${activeTab === tab.id ? styles.tabBtnActive : ""}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Structured Report Body */}
      {report ? (
        <div className={styles.reportBody}>
          {/* Metadata Quick Grid */}
          {showOverview && (
            <>
              <div className={styles.metaGrid}>
                {report.metadata.map((item) => (
                  <div key={item.label} className={styles.metaCard}>
                    <span className={styles.metaLabel}>{item.label}</span>
                    <span className={styles.metaValue}>{item.value}</span>
                  </div>
                ))}
              </div>

              {/* Abstract & Aim */}
              <div className={styles.dualGrid}>
                <section className={styles.sectionCard}>
                  <h2 className={styles.sectionHeading}>Abstract</h2>
                  <p className={styles.bodyText}>{report.abstract}</p>
                </section>
                <section className={styles.sectionCard}>
                  <h2 className={styles.sectionHeading}>Aim & Problem Statement</h2>
                  <p className={styles.bodyText}>{report.aimOrProblem}</p>
                </section>
              </div>
            </>
          )}

          {/* System Block Diagram / Stage Flow */}
          {showArchitecture && (
            <section className={styles.sectionCard}>
              <h2 className={styles.sectionHeading}>System Block Architecture & Workflow</h2>
              <div className={styles.stagesList}>
                {report.architectureStages.map((stage) => (
                  <div key={stage.step} className={styles.stageCard}>
                    <div className={styles.stageBadge}>{stage.step}</div>
                    <div className={styles.stageContent}>
                      <h3 className={styles.stageTitle}>{stage.title}</h3>
                      <p className={styles.stageDetail}>{stage.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Design Calculations / Formulas / Specs Table */}
          {showSpecs && (
            <>
              {report.designSpecs && (
                <section className={styles.sectionCard}>
                  <h2 className={styles.sectionHeading}>{report.designSpecs.title}</h2>
                  <div className={styles.tableWrap}>
                    <table className={styles.specTable}>
                      <thead>
                        <tr>
                          <th>Parameter / Stage</th>
                          <th>Formula / Method</th>
                          <th>Selected / Target Value</th>
                          <th>Engineering Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {report.designSpecs.rows.map((row) => (
                          <tr key={row.parameter}>
                            <td className={styles.cellStrong}>{row.parameter}</td>
                            <td className={styles.cellMono}>{row.formulaOrMethod || "—"}</td>
                            <td className={styles.cellAccent}>{row.targetValue}</td>
                            <td>{row.notes || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              {/* Components & Tech Stack Breakdown */}
              <section className={styles.sectionCard}>
                <h2 className={styles.sectionHeading}>Components & Technical Modules</h2>
                <div className={styles.componentsGrid}>
                  {report.componentsOrStack.map((comp) => (
                    <div key={comp.name} className={styles.componentCard}>
                      <h3 className={styles.componentName}>{comp.name}</h3>
                      <p className={styles.componentPurpose}>{comp.purpose}</p>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}

          {/* Simulations, Hardware Testing & Verification */}
          {showTesting && report.testAndSimulation && (
            <section className={styles.sectionCard}>
              <div className={styles.sectionHeaderRow}>
                <h2 className={styles.sectionHeading}>{report.testAndSimulation.title}</h2>
                <div className={styles.toolsList}>
                  {report.testAndSimulation.tools.map((tool) => (
                    <span key={tool} className={styles.toolChip}>
                      {tool}
                    </span>
                  ))}
                </div>
              </div>

              <div className={styles.tableWrap}>
                <table className={styles.specTable}>
                  <thead>
                    <tr>
                      <th>Test Case / Scenario</th>
                      <th>Input / Stimulus</th>
                      <th>Expected Behavior</th>
                      <th>Observed Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.testAndSimulation.cases.map((tc) => (
                      <tr key={tc.name}>
                        <td className={styles.cellStrong}>{tc.name}</td>
                        <td>{tc.inputCondition}</td>
                        <td>{tc.expectedOutcome}</td>
                        <td className={styles.cellSuccess}>{tc.observedResult}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {report.testAndSimulation.observations.length > 0 && (
                <div className={styles.observationsBox}>
                  <h3 className={styles.subHeading}>Key Experimental Observations</h3>
                  <ul className={styles.bulletList}>
                    {report.testAndSimulation.observations.map((obs) => (
                      <li key={obs}>{obs}</li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          )}

          {/* Deep-Dive Sections, Outcomes, Future Scope, References (visible in Full Report) */}
          {showOverview && (
            <>
              {report.deepDiveSections.map((sec) => (
                <section key={sec.heading} className={styles.sectionCard}>
                  <h2 className={styles.sectionHeading}>{sec.heading}</h2>
                  {sec.summary && <p className={styles.bodyText}>{sec.summary}</p>}
                  {sec.bullets && (
                    <ul className={styles.bulletList}>
                      {sec.bullets.map((b) => (
                        <li key={b}>{b}</li>
                      ))}
                    </ul>
                  )}
                </section>
              ))}

              <div className={styles.dualGrid}>
                <section className={styles.sectionCard}>
                  <h2 className={styles.sectionHeading}>Conclusion & Key Outcomes</h2>
                  <ul className={styles.bulletList}>
                    {report.achievementsOrOutcomes.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </section>
                <section className={styles.sectionCard}>
                  <h2 className={styles.sectionHeading}>Future Enhancements</h2>
                  <ul className={styles.bulletList}>
                    {report.futureScope.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </section>
              </div>

              {report.references && report.references.length > 0 && (
                <section className={styles.sectionCard}>
                  <h2 className={styles.sectionHeading}>References</h2>
                  <ul className={styles.bulletList}>
                    {report.references.map((ref) => (
                      <li key={ref.label}>
                        <strong>{ref.label}:</strong> {ref.detail}{" "}
                        {ref.url && (
                          <a
                            href={ref.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.inlineLink}
                          >
                            [Link ↗]
                          </a>
                        )}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Admin-provided notes if customized beyond default brief */}
              {customNotes.length > 0 && (
                <section className={styles.sectionCard}>
                  <h2 className={styles.sectionHeading}>Portfolio Summary Notes</h2>
                  {customNotes.map((para, i) => (
                    <p key={i} className={styles.bodyText}>
                      {para}
                    </p>
                  ))}
                </section>
              )}
            </>
          )}
        </div>
      ) : (
        /* Clean fallback for any newly added CMS project without a custom file report yet */
        <div className={styles.reportBody}>
          <section className={styles.sectionCard}>
            <h2 className={styles.sectionHeading}>Project Overview</h2>
            <p className={styles.bodyText}>{project.description}</p>
            {customNotes.map((para, i) => (
              <p key={i} className={styles.bodyText}>
                {para}
              </p>
            ))}
          </section>
        </div>
      )}
    </article>
  );
}
