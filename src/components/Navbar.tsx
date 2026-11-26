"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Navbar.module.css";
import ThemeToggle from "./ThemeToggle";
import LiquidNavbar, {
  LiquidNavItem,
  NimbusIcons,
} from "./LiquidNavbar";
import SwarmRebuild from "./SwarmRebuild";
import { GitHubIcon, LinkedInIcon } from "./SocialIcons";
import { getSocialLinks } from "@/lib/social";
import type { Profile } from "@/lib/supabase/types";

const SECTION_IDS = [
  "home",
  "about",
  "skills",
  "projects",
  "experience",
  "contact",
];

export default function Navbar({ profile }: { profile: Profile | null }) {
  const pathname = usePathname();
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [isSwarmOpen, setIsSwarmOpen] = useState(false);
  const isNavigatingRef = useRef(false);

  // Sync theme with the portfolio's data-theme attribute
  useEffect(() => {
    const updateTheme = () => {
      const current = document.documentElement.getAttribute("data-theme") as
        | "light"
        | "dark"
        | null;
      if (current) {
        setTheme(current);
      } else {
        const isLight = window.matchMedia(
          "(prefers-color-scheme: light)"
        ).matches;
        setTheme(isLight ? "light" : "dark");
      }
    };

    updateTheme();

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "data-theme"
        ) {
          updateTheme();
        }
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => observer.disconnect();
  }, []);

  const isHome = pathname === "/";

  // Scroll spy to update the active liquid droplet position as the user scrolls on the homepage
  useEffect(() => {
    if (!isHome) return;

    const handleScroll = () => {
      if (isNavigatingRef.current) return;
      const scrollPosition = window.scrollY + 160;

      for (let i = SECTION_IDS.length - 1; i >= 0; i--) {
        const el = document.getElementById(SECTION_IDS[i]);
        if (el) {
          const top = el.offsetTop;
          if (scrollPosition >= top) {
            setActiveSectionIndex(i);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHome]);

  const handleNavChange = useCallback((index: number) => {
    setActiveSectionIndex(index);
    isNavigatingRef.current = true;
    setTimeout(() => {
      isNavigatingRef.current = false;
    }, 850);
  }, []);

  const hrefPrefix = isHome ? "" : "/";

  const navItems: LiquidNavItem[] = [
    { label: "Home", href: `${hrefPrefix}#home`, icon: NimbusIcons.home, fx: "glow" },
    { label: "About", href: `${hrefPrefix}#about`, icon: NimbusIcons.about, fx: "wave" },
    { label: "Skills", href: `${hrefPrefix}#skills`, icon: NimbusIcons.skills, fx: "drop" },
    { label: "Projects", href: `${hrefPrefix}#projects`, icon: NimbusIcons.projects, fx: "pop" },
    { label: "Experience", href: `${hrefPrefix}#experience`, icon: NimbusIcons.experience, fx: "spin" },
    { label: "Contact", href: `${hrefPrefix}#contact`, icon: NimbusIcons.contact, fx: "plane" },
  ];

  const effectiveActiveIndex =
    pathname && pathname.startsWith("/projects") ? 3 : activeSectionIndex;

  const { githubUrl, linkedinUrl } = getSocialLinks(profile);

  return (
    <header className={styles.navbarHeader}>
      <div className={styles.navbarContainer}>
        <div className={styles.mobileTopBar}>
          <div className={styles.logoBox}>
            <Link href={`${hrefPrefix}#home`} className={styles.logo}>
              <span className={styles.logoFull}>{profile?.name?.toUpperCase() || "J SHREYAS ARADHYA"}</span>
              <span className={styles.logoShort}>J. SHREYAS</span>
            </Link>
          </div>

          <div className={styles.actionsBox}>
            <button
              type="button"
              onClick={() => setIsSwarmOpen((prev) => !prev)}
              className={`${styles.motionBtn} ${isSwarmOpen ? styles.motionBtnActive : ""}`}
              title="Trigger Portfolio Motions Animation"
              aria-label="Toggle Portfolio Motions Animation"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
              <span>Motion</span>
            </button>

            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialBtn}
              title="GitHub Profile (shreyasjaradhya)"
              aria-label="View GitHub Profile"
            >
              <GitHubIcon size={15} />
              <span>GitHub</span>
            </a>

            <a
              href={linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialBtn}
              title="LinkedIn Profile (J Shreyas Aradhya)"
              aria-label="View LinkedIn Profile"
            >
              <LinkedInIcon size={15} />
              <span>LinkedIn</span>
            </a>

            {profile?.resume_url && (
              <a
                href={profile.resume_url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.resumeBtn}
              >
                Resume
              </a>
            )}
            <ThemeToggle />
          </div>
        </div>

        <div className={styles.navPillWrap}>
          <LiquidNavbar
            items={navItems}
            active={effectiveActiveIndex}
            onChange={handleNavChange}
            tone={theme}
            sound={true}
          />
        </div>
      </div>

      {/* Standalone Swarm Rebuild Motion Overlay */}
      <SwarmRebuild
        isOpen={isSwarmOpen}
        onClose={() => setIsSwarmOpen(false)}
        enableSound={true}
      />
    </header>
  );
}
