"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./ScrollToTop.module.css";

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // Show button once the user has scrolled past 380px
      if (window.scrollY > 380) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility, { passive: true });
    // Check initial position on mount
    toggleVisibility();

    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          type="button"
          onClick={scrollToTop}
          className={styles.scrollToTopBtn}
          aria-label="Scroll to top of page"
          title="Back to top"
          initial={{ opacity: 0, scale: 0.75, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.75, y: 12 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
        >
          <svg
            className={styles.icon}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 19V5" />
            <path d="M5 12l7-7 7 7" />
          </svg>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
