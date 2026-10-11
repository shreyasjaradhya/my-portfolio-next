/* eslint-disable */
import * as motion from "framer-motion/client";
import styles from "./About.module.css";
import type { Profile, Education, Experience } from "@/lib/supabase/types";

interface AboutProps {
  profile: Profile | null;
  education: Education[];
  experiences?: Experience[];
  projectsCount?: number;
}

export default function About({ 
  profile, 
  education,
  experiences = [],
  projectsCount = 0
}: AboutProps) {
  // 1. Experience Card Data (from verified Supabase data)
  const primaryExp = experiences.length > 0 ? experiences[0] : null;
  const experienceTitle = primaryExp 
    ? primaryExp.title 
    : "Hardware & VLSI";
  const experienceSubtitle = primaryExp 
    ? primaryExp.organization 
    : "Academic & Projects";

  // 2. Education Card Data (from verified Supabase data)
  const primaryEdu = education.length > 0 ? education[0] : null;
  const educationDegree = primaryEdu 
    ? `${primaryEdu.degree} Degree` 
    : "B.Tech Degree";
  const educationInstitution = primaryEdu 
    ? primaryEdu.institution 
    : "NMAM Institute of Technology";

  // 3. Projects Card Data (from verified Supabase data)
  const projectsPrimary = projectsCount > 0 
    ? `${projectsCount}+ Completed` 
    : "Engineering Projects";
  const projectsSecondary = "Hardware & Software";

  // 4. Bio Paragraphs (from verified profile data)
  const defaultBio = `I'm an Electronics and Communication Engineering student at NMAM Institute of Technology with a strong interest in VLSI design, FPGA development, digital electronics, and embedded systems. I enjoy exploring how hardware and intelligent computing work together to solve real-world engineering problems.

My technical journey involves working with Verilog, C, Python, MATLAB, and FPGA development tools such as Xilinx Vivado. Through academic projects and hands-on engineering experience, I've explored digital system design, hardware implementation, control systems, and embedded applications.

My long-term goal is to build a career in VLSI and hardware engineering, developing efficient, reliable, and innovative electronic systems. I'm always eager to learn, collaborate with others, and take on challenging projects that help me grow as an engineer.`;

  // Use dynamic profile bio from database; if empty or matching the legacy placeholder, use the updated biography
  const isLegacyBio = !profile?.bio || profile.bio.includes("hardware and intelligent computing. My interests span VLSI design, FPGA development, digital systems, embedded systems and hardware-oriented programming");
  const rawBio = isLegacyBio ? defaultBio : (profile?.bio ?? defaultBio);
  const bioParagraphs = rawBio.split(/\n\s*\n/).filter(Boolean);

  return (
    <section id="about" className={styles.aboutSection}>
      <div className={styles.container}>
        {/* Section Heading: Centered */}
        <motion.div 
          className={styles.header}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <p className={styles.subtitle}>Get to know more</p>
          <h2 className={styles.heading}>About Me</h2>
        </motion.div>

        {/* Two-Column Layout */}
        <div className={styles.aboutWrapper}>
          {/* Left Column: Portrait Profile Photo */}
          <motion.div 
            className={styles.imageColumn}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <div className={styles.imageFrame}>
              {profile?.profile_image_url ? (
                <img 
                  src={profile.profile_image_url} 
                  alt={profile.name || "Profile Photo"} 
                  className={styles.profileImage} 
                  loading="lazy"
                />
              ) : (
                <div className={styles.placeholderPhoto}>
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="8" r="5" />
                    <path d="M20 21a8 8 0 1 0-16 0" />
                  </svg>
                  <span>Profile Photo</span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Right Column: Three Information Cards & Biography */}
          <div className={styles.contentColumn}>
            {/* Three Cards in a Horizontal Row */}
            <motion.div 
              className={styles.cardsGrid}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {/* Card 1: Experience */}
              <div className={styles.card}>
                <div className={styles.cardIcon}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="8" r="6" />
                    <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
                  </svg>
                </div>
                <h3 className={styles.cardTitle}>Experience</h3>
                <p className={styles.cardPrimaryText}>{experienceTitle}</p>
                <p className={styles.cardSecondaryText}>{experienceSubtitle}</p>
              </div>

              {/* Card 2: Education */}
              <div className={styles.card}>
                <div className={styles.cardIcon}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                    <path d="M6 12v5c3 3 9 3 12 0v-5" />
                  </svg>
                </div>
                <h3 className={styles.cardTitle}>Education</h3>
                <p className={styles.cardPrimaryText}>{educationDegree}</p>
                <p className={styles.cardSecondaryText}>{educationInstitution}</p>
              </div>

              {/* Card 3: Projects */}
              <div className={styles.card}>
                <div className={styles.cardIcon}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
                  </svg>
                </div>
                <h3 className={styles.cardTitle}>Projects</h3>
                <p className={styles.cardPrimaryText}>{projectsPrimary}</p>
                <p className={styles.cardSecondaryText}>{projectsSecondary}</p>
              </div>
            </motion.div>

            {/* Biography Under Cards */}
            <motion.div 
              className={styles.bioWrapper}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              {bioParagraphs.map((paragraph, idx) => (
                <p key={idx} className={styles.bioParagraph}>
                  {paragraph}
                </p>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
