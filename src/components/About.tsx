import * as motion from "framer-motion/client";
import styles from "./About.module.css";
import type { Profile, Education } from "@/lib/supabase/types";

export default function About({ 
  profile, 
  education 
}: { 
  profile: Profile | null;
  education: Education[];
}) {
  const primaryEdu = education.length > 0 ? education[0] : null;
  const eduValue = primaryEdu 
    ? `${primaryEdu.degree} ${primaryEdu.field} \u2014 ${primaryEdu.institution}`
    : 'B.Tech Electronics & Communication Engineering \u2014 NMAM Institute of Technology';

  return (
    <section id="about" className={styles.aboutSection}>
      <div className={styles.container}>
        <motion.div 
          className={styles.header}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <h2 className={styles.heading}>About Me.</h2>
        </motion.div>

        <div className={styles.aboutWrapper}>
          {profile?.profile_image_url && (
            <motion.div 
              className={styles.imageColumn}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
            >
              <div className={styles.imageFrame}>
                <img 
                  src={profile.profile_image_url} 
                  alt={profile.name || "Profile"} 
                  className={styles.profileImage} 
                  loading="lazy"
                />
              </div>
            </motion.div>
          )}

          <div className={styles.content}>
            <motion.div 
              className={styles.textContent}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {profile?.bio ? (
                <p>{profile.bio}</p>
              ) : (
                <>
                  <p>
                    I am an Electronics and Communication Engineering student interested in the intersection of hardware and intelligent computing. My interests span VLSI design, FPGA development, digital systems, embedded systems and hardware-oriented programming.
                  </p>
                  <p>
                    I enjoy turning concepts into working systems, from digital logic and FPGA implementations to embedded prototypes and hardware acceleration.
                  </p>
                </>
              )}
            </motion.div>

            <motion.div 
              className={styles.infoCard}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Degree</span>
                <span className={styles.infoValue}>{eduValue}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Focus</span>
                <span className={styles.infoValue}>VLSI • FPGA • Digital Hardware</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Tools</span>
                <span className={styles.infoValue}>Vivado • MATLAB • KiCad • LTSpice</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Languages</span>
                <span className={styles.infoValue}>Python • C • Verilog</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}