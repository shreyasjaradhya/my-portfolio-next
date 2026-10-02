import * as motion from "framer-motion/client";
import styles from "./Hero.module.css";
import Link from "next/link";
import type { Profile } from "@/lib/supabase/types";

export default function Hero({ profile }: { profile: Profile | null }) {
  if (!profile) return null;

  return (
    <section id="home" className={styles.heroSection}>
      {/* Background visual element */}
      <div className={styles.backgroundVisual}>
         <div className={styles.grid}></div>
         <div className={styles.glow}></div>
      </div>

      <div className={styles.content}>
        <motion.div 
          className={styles.eyebrow}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {profile.title.toUpperCase()}
        </motion.div>

        <motion.h1 
          className={styles.mainHeading}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Building the <br/>
          <span className={styles.highlight}>hardware</span> of <br/>
          the future.
        </motion.h1>

        <motion.p 
          className={styles.description}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {profile.bio}
        </motion.p>

        <motion.div 
          className={styles.buttonGroup}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Link href="#projects" className={styles.primaryBtn}>
            View My Work
          </Link>
          <Link href="#about" className={styles.secondaryBtn}>
            About Me
          </Link>
        </motion.div>

        <motion.div 
          className={styles.techLine}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          VLSI • FPGA • VERILOG • DIGITAL DESIGN • EMBEDDED SYSTEMS
        </motion.div>
      </div>
    </section>
  );
}