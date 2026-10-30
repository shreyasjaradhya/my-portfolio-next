/* eslint-disable */
"use client";

import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
} from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import type { Testimonial as DbTestimonial } from "@/lib/supabase/types";
import styles from "./Testimonials.module.css";

interface CircularItem {
  id: string;
  name: string;
  designation: string;
  quote: string;
  src: string;
  rating?: number | null;
}

function calculateGap(width: number) {
  if (width < 480) return Math.max(36, width * 0.12);
  if (width < 768) return Math.max(46, width * 0.14);
  const minWidth = 1024;
  const maxWidth = 1456;
  const minGap = 60;
  const maxGap = 86;
  if (width <= minWidth) return minGap;
  if (width >= maxWidth)
    return Math.max(minGap, maxGap + 0.06018 * (width - maxWidth));
  return minGap + (maxGap - minGap) * ((width - minWidth) / (maxWidth - minWidth));
}

function generateAvatarDataUri(name: string): string {
  const initials =
    (name || "Anonymous")
      .trim()
      .split(/\s+/)
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase() || "T";

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="100%" height="100%">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#090d16"/>
        <stop offset="50%" stop-color="#111827"/>
        <stop offset="100%" stop-color="#1e293b"/>
      </linearGradient>
      <linearGradient id="glow" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#38bdf8"/>
        <stop offset="100%" stop-color="#818cf8"/>
      </linearGradient>
    </defs>
    <rect width="600" height="600" rx="40" fill="url(#bg)"/>
    <circle cx="300" cy="300" r="160" fill="none" stroke="url(#glow)" stroke-width="6" opacity="0.35"/>
    <text x="50%" y="54%" font-family="system-ui, -apple-system, sans-serif" font-size="130" font-weight="700" fill="url(#glow)" text-anchor="middle" dominant-baseline="middle">${initials}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export default function Testimonials({
  testimonials,
  autoplay = true,
}: {
  testimonials: DbTestimonial[];
  autoplay?: boolean;
}) {
  // Map Supabase database records to component format
  const mappedTestimonials: CircularItem[] = useMemo(() => {
    if (!testimonials || testimonials.length === 0) return [];
    return testimonials.map((t) => {
      const parts = [t.role, t.company].filter(Boolean);
      const designation = parts.join(" • ") || t.role || t.company || "Collaborator";
      return {
        id: t.id,
        name: t.name,
        designation,
        quote: t.content,
        src: t.avatar_url || generateAvatarDataUri(t.name),
        rating: t.rating,
      };
    });
  }, [testimonials]);

  const displayLength = mappedTestimonials.length;

  const [activeIndex, setActiveIndex] = useState(0);
  const [hoverPrev, setHoverPrev] = useState(false);
  const [hoverNext, setHoverNext] = useState(false);
  const [containerWidth, setContainerWidth] = useState(1200);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const imageContainerRef = useRef<HTMLDivElement>(null);
  const autoplayIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Active testimonial for text display
  const activeTestimonial = useMemo(() => {
    if (displayLength === 0) return null;
    return mappedTestimonials[activeIndex] || mappedTestimonials[0];
  }, [mappedTestimonials, activeIndex, displayLength]);

  // Reduced motion preference
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Measure container width for responsive gap calculation
  useEffect(() => {
    function handleResize() {
      if (imageContainerRef.current) {
        setContainerWidth(imageContainerRef.current.offsetWidth);
      }
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Autoplay management
  const resetAutoplay = useCallback(() => {
    if (autoplayIntervalRef.current) {
      clearInterval(autoplayIntervalRef.current);
      autoplayIntervalRef.current = null;
    }
    if (autoplay && displayLength > 1 && !prefersReducedMotion) {
      autoplayIntervalRef.current = setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % displayLength);
      }, 5000);
    }
  }, [autoplay, displayLength, prefersReducedMotion]);

  useEffect(() => {
    resetAutoplay();
    return () => {
      if (autoplayIntervalRef.current) {
        clearInterval(autoplayIntervalRef.current);
      }
    };
  }, [resetAutoplay]);

  // Navigation handlers
  const handleNext = useCallback(() => {
    if (displayLength <= 1) return;
    setActiveIndex((prev) => (prev + 1) % displayLength);
    resetAutoplay();
  }, [displayLength, resetAutoplay]);

  const handlePrev = useCallback(() => {
    if (displayLength <= 1) return;
    setActiveIndex((prev) => (prev - 1 + displayLength) % displayLength);
    resetAutoplay();
  }, [displayLength, resetAutoplay]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handlePrev, handleNext]);

  // Safe 3D transform computation: Active center card is ALWAYS on top (zIndex: 10)
  function getImageStyle(index: number): React.CSSProperties {
    if (displayLength === 1) {
      return {
        zIndex: 10,
        opacity: 1,
        pointerEvents: "auto",
        transform: "translateX(0px) translateY(0px) scale(1) rotateY(0deg)",
        transition: prefersReducedMotion ? "opacity 0.3s ease" : "all 0.8s cubic-bezier(.4,2,.3,1)",
      };
    }

    const gap = calculateGap(containerWidth);
    const maxStickUp = gap * 0.8;

    // 2 Testimonials: Active is centered; the other sits nicely on the right (or left), avoiding cloning
    if (displayLength === 2) {
      if (index === activeIndex) {
        return {
          zIndex: 10,
          opacity: 1,
          pointerEvents: "auto",
          transform: "translateX(0px) translateY(0px) scale(1) rotateY(0deg)",
          boxShadow: "0 20px 45px rgba(0, 0, 0, 0.5), 0 0 25px rgba(56, 189, 248, 0.15)",
          transition: prefersReducedMotion ? "opacity 0.3s ease" : "all 0.8s cubic-bezier(.4,2,.3,1)",
        };
      }

      const isRight = activeIndex === 0 && index === 1;
      const isLeft = activeIndex === 1 && index === 0;

      if (isRight) {
        return {
          zIndex: 4,
          opacity: 0.85,
          cursor: "pointer",
          pointerEvents: "auto",
          transform: prefersReducedMotion
            ? `translateX(${gap}px)`
            : `translateX(${gap}px) translateY(-${maxStickUp}px) scale(0.85) rotateY(-15deg)`,
          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.3)",
          transition: prefersReducedMotion ? "opacity 0.3s ease" : "all 0.8s cubic-bezier(.4,2,.3,1)",
        };
      }

      if (isLeft) {
        return {
          zIndex: 4,
          opacity: 0.85,
          cursor: "pointer",
          pointerEvents: "auto",
          transform: prefersReducedMotion
            ? `translateX(-${gap}px)`
            : `translateX(-${gap}px) translateY(-${maxStickUp}px) scale(0.85) rotateY(15deg)`,
          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.3)",
          transition: prefersReducedMotion ? "opacity 0.3s ease" : "all 0.8s cubic-bezier(.4,2,.3,1)",
        };
      }
    }

    // 3 or more testimonials: Full 3-card circular arrangement
    const isActive = index === activeIndex;
    const isLeft = (activeIndex - 1 + displayLength) % displayLength === index;
    const isRight = (activeIndex + 1) % displayLength === index;

    if (isActive) {
      return {
        zIndex: 10,
        opacity: 1,
        pointerEvents: "auto",
        transform: "translateX(0px) translateY(0px) scale(1) rotateY(0deg)",
        boxShadow: "0 20px 45px rgba(0, 0, 0, 0.5), 0 0 25px rgba(56, 189, 248, 0.15)",
        transition: prefersReducedMotion ? "opacity 0.3s ease" : "all 0.8s cubic-bezier(.4,2,.3,1)",
      };
    }
    if (isLeft) {
      return {
        zIndex: 4,
        opacity: 0.85,
        cursor: "pointer",
        pointerEvents: "auto",
        transform: prefersReducedMotion
          ? `translateX(-${gap}px)`
          : `translateX(-${gap}px) translateY(-${maxStickUp}px) scale(0.85) rotateY(15deg)`,
        boxShadow: "0 10px 25px rgba(0, 0, 0, 0.3)",
        transition: prefersReducedMotion ? "opacity 0.3s ease" : "all 0.8s cubic-bezier(.4,2,.3,1)",
      };
    }
    if (isRight) {
      return {
        zIndex: 4,
        opacity: 0.85,
        cursor: "pointer",
        pointerEvents: "auto",
        transform: prefersReducedMotion
          ? `translateX(${gap}px)`
          : `translateX(${gap}px) translateY(-${maxStickUp}px) scale(0.85) rotateY(-15deg)`,
        boxShadow: "0 10px 25px rgba(0, 0, 0, 0.3)",
        transition: prefersReducedMotion ? "opacity 0.3s ease" : "all 0.8s cubic-bezier(.4,2,.3,1)",
      };
    }

    // Hide all other images in the stack
    return {
      zIndex: 1,
      opacity: 0,
      pointerEvents: "none",
      transform: `translateX(0px) translateY(-${maxStickUp}px) scale(0.7) rotateY(0deg)`,
      transition: prefersReducedMotion ? "opacity 0.3s ease" : "all 0.8s cubic-bezier(.4,2,.3,1)",
    };
  }

  // Framer Motion variants for quote container
  const quoteVariants: Variants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  // 1. Empty state handling
  if (displayLength === 0 || !activeTestimonial) {
    return (
      <section id="testimonials" className={styles.testimonialSection}>
        <div className={styles.container}>
          <div className={styles.header}>
            <p className={styles.sectionSubtitle}>Endorsements & Feedback</p>
            <h2 className={styles.sectionTitle}>
              Kind <span className={styles.titleAccent}>Words</span>
            </h2>
          </div>

          <div className={styles.emptyContainer}>
            <div className={styles.emptyIcon}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <h3 className={styles.emptyTitle}>No Testimonials Yet</h3>
            <p className={styles.emptyText}>
              Recommendations from mentors, teammates, and clients will appear here.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="testimonials" className={styles.testimonialSection} aria-label="Testimonials Section">
      <div className={styles.container}>
        {/* Section Header */}
        <div className={styles.header}>
          <p className={styles.sectionSubtitle}>Endorsements & Recommendations</p>
          <h2 className={styles.sectionTitle}>
            Kind <span className={styles.titleAccent}>Words</span>
          </h2>
        </div>

        {/* Circular Testimonials Layout */}
        <div className={styles.testimonialContainer}>
          <div className={styles.testimonialGrid}>
            {/* 3D Images Arrangement */}
            <div className={styles.imageContainer} ref={imageContainerRef}>
              {mappedTestimonials.map((testimonial, index) => {
                const isLeft = (activeIndex - 1 + displayLength) % displayLength === index || (displayLength === 2 && activeIndex === 1 && index === 0);
                const isRight = (activeIndex + 1) % displayLength === index || (displayLength === 2 && activeIndex === 0 && index === 1);

                return (
                  <img
                    key={testimonial.id || index}
                    src={testimonial.src}
                    alt={testimonial.name}
                    className={styles.testimonialImage}
                    data-index={index}
                    style={getImageStyle(index)}
                    onClick={() => {
                      if (isRight) handleNext();
                      else if (isLeft) handlePrev();
                    }}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = generateAvatarDataUri(testimonial.name);
                    }}
                  />
                );
              })}
            </div>

            {/* Content Column with Word-by-Word Text Animation */}
            <div className={styles.testimonialContent}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTestimonial.id || activeIndex}
                  variants={quoteVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <h3 className={styles.name}>{activeTestimonial.name}</h3>
                  <p className={styles.designation}>{activeTestimonial.designation}</p>

                  <motion.p className={styles.quote}>
                    {activeTestimonial.quote.split(" ").map((word, i) => (
                      <motion.span
                        key={`${activeTestimonial.id || activeIndex}-${i}`}
                        initial={{
                          filter: prefersReducedMotion ? "none" : "blur(10px)",
                          opacity: 0,
                          y: prefersReducedMotion ? 0 : 5,
                        }}
                        animate={{
                          filter: "blur(0px)",
                          opacity: 1,
                          y: 0,
                        }}
                        transition={{
                          duration: prefersReducedMotion ? 0.05 : 0.22,
                          ease: "easeInOut",
                          delay: prefersReducedMotion ? 0 : 0.025 * i,
                        }}
                        style={{ display: "inline-block" }}
                      >
                        {word}&nbsp;
                      </motion.span>
                    ))}
                  </motion.p>
                </motion.div>
              </AnimatePresence>

              {/* Navigation Circular Arrow Buttons */}
              <div className={styles.arrowButtons}>
                <button
                  type="button"
                  className={`${styles.arrowButton} ${styles.prevButton}`}
                  onClick={handlePrev}
                  disabled={displayLength <= 1}
                  onMouseEnter={() => setHoverPrev(true)}
                  onMouseLeave={() => setHoverPrev(false)}
                  aria-label="Previous testimonial"
                >
                  <svg viewBox="0 0 448 512" width="18" height="18" fill="currentColor">
                    <path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.2 288 416 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-306.7 0L214.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z" />
                  </svg>
                </button>
                <button
                  type="button"
                  className={`${styles.arrowButton} ${styles.nextButton}`}
                  onClick={handleNext}
                  disabled={displayLength <= 1}
                  onMouseEnter={() => setHoverNext(true)}
                  onMouseLeave={() => setHoverNext(false)}
                  aria-label="Next testimonial"
                >
                  <svg viewBox="0 0 448 512" width="18" height="18" fill="currentColor">
                    <path d="M438.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L338.8 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l306.7 0L233.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
