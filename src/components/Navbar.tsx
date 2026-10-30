"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import styles from "./Navbar.module.css";
import ThemeToggle from "./ThemeToggle";
import LiquidNavbar, {
  LiquidNavItem,
  NimbusIcons,
} from "./LiquidNavbar";
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
    </header>
  );
}
