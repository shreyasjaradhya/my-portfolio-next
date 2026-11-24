"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import styles from "./Navbar.module.css";
import ThemeToggle from "./ThemeToggle";
import LiquidNavbar, {
  LiquidNavItem,
  NimbusIcons,
} from "./LiquidNavbar";
import SwarmRebuild from "./SwarmRebuild";
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

  // Scroll spy to update the active liquid droplet position as the user scrolls
  useEffect(() => {
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
  }, []);

  const handleNavChange = useCallback((index: number) => {
    setActiveSectionIndex(index);
    isNavigatingRef.current = true;
    setTimeout(() => {
      isNavigatingRef.current = false;
    }, 850);
  }, []);

  const navItems: LiquidNavItem[] = [
    { label: "Home", href: "#home", icon: NimbusIcons.home, fx: "glow" },
    { label: "About", href: "#about", icon: NimbusIcons.about, fx: "wave" },
    { label: "Skills", href: "#skills", icon: NimbusIcons.skills, fx: "drop" },
    { label: "Projects", href: "#projects", icon: NimbusIcons.projects, fx: "pop" },
    { label: "Experience", href: "#experience", icon: NimbusIcons.experience, fx: "spin" },
    { label: "Contact", href: "#contact", icon: NimbusIcons.contact, fx: "plane" },
  ];

  return (
    <header className={styles.navbarHeader}>
      <div className={styles.navbarContainer}>
        <div className={styles.mobileTopBar}>
          <div className={styles.logoBox}>
            <Link href="#home" className={styles.logo}>
              {profile?.name?.toUpperCase() || "J SHREYAS ARADHYA"}
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
              href={profile?.github_url || "https://github.com/shreyasjaradhya"}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.githubBtn}
              title="GitHub Profile (shreyasjaradhya)"
              aria-label="View GitHub Profile"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              <span>GitHub</span>
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
            active={activeSectionIndex}
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
