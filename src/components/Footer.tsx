import styles from "./Footer.module.css";
import type { Profile } from "@/lib/supabase/types";

export default function Footer({ profile }: { profile: Profile | null }) {
  const currentYear = new Date().getFullYear();
  const name = profile?.name || "J Shreyas Aradhya";
  
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.info}>
          <h4 className={styles.name}>{name}</h4>
          <p className={styles.degree}>Electronics & Communication Engineering</p>
          <p className={styles.techLine}>VLSI • FPGA • Digital Hardware</p>
        </div>
        <div className={styles.copyright}>
          <p>&copy; {currentYear} {name}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}