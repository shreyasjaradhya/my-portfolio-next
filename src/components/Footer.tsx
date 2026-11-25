import styles from "./Footer.module.css";
import { GitHubIcon, LinkedInIcon, EmailIcon } from "./SocialIcons";
import { getSocialLinks } from "@/lib/social";
import type { Profile } from "@/lib/supabase/types";

export default function Footer({ profile }: { profile: Profile | null }) {
  const currentYear = new Date().getFullYear();
  const name = profile?.name || "J Shreyas Aradhya";
  const { githubUrl, linkedinUrl, email } = getSocialLinks(profile);

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.info}>
          <h4 className={styles.name}>{name}</h4>
          <p className={styles.degree}>Electronics & Communication Engineering</p>
          <p className={styles.techLine}>VLSI • FPGA • Digital Hardware</p>
        </div>

        <div className={styles.socialLinks}>
          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.socialLink}
            aria-label="GitHub Profile"
          >
            <GitHubIcon size={17} />
            <span>GitHub</span>
          </a>
          <a
            href={linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.socialLink}
            aria-label="LinkedIn Profile"
          >
            <LinkedInIcon size={17} />
            <span>LinkedIn</span>
          </a>
          <a
            href={`mailto:${email}`}
            className={styles.socialLink}
            aria-label="Email"
          >
            <EmailIcon size={17} />
            <span>Email</span>
          </a>
        </div>

        <div className={styles.copyright}>
          <p>&copy; {currentYear} {name}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}