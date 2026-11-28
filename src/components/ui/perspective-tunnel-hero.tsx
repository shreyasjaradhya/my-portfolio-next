"use client";

import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  motion,
  useSpring,
  useTransform,
  useMotionValue,
  type MotionValue,
} from "framer-motion";
import styles from "./perspective-tunnel-hero.module.css";
import { getSocialLinks } from "@/lib/social";
import type { Profile } from "@/lib/supabase/types";

export interface TunnelCardItem {
  src: string;
  title: string;
  category: string;
}

export const ENGINEERING_CARDS: TunnelCardItem[] = [
  {
    src: "/images/tunnel/card-1.jpg",
    title: "VLSI DESIGN",
    category: "Hardware",
  },
  {
    src: "/images/tunnel/card-2.jpg",
    title: "FPGA DEVELOPMENT",
    category: "Architecture",
  },
  {
    src: "/images/tunnel/card-3.jpg",
    title: "DIGITAL SYSTEMS",
    category: "Logic Design",
  },
  {
    src: "/images/tunnel/card-4.jpg",
    title: "EMBEDDED SYSTEMS",
    category: "Firmware & MCU",
  },
  {
    src: "/images/tunnel/card-5.jpg",
    title: "HARDWARE DESIGN",
    category: "Silicon & PCB",
  },
  {
    src: "/images/tunnel/card-6.jpg",
    title: "INTELLIGENT SYSTEMS",
    category: "Edge Computing",
  },
  {
    src: "/images/tunnel/card-7.jpg",
    title: "SIGNAL PROCESSING",
    category: "DSP & Comms",
  },
  {
    src: "/images/tunnel/card-8.jpg",
    title: "ENGINEERING PROJECTS",
    category: "R&D Systems",
  },
  {
    src: "/images/tunnel/card-9.jpg",
    title: "INNOVATION",
    category: "Next-Gen Tech",
  },
];

interface ComputedCard {
  item: TunnelCardItem;
  angleCos: number;
  angleSin: number;
  radiusFactorX: number;
  radiusFactorY: number;
  rotationZ: number;
  index: number;
}

interface StageDimensions {
  width: number;
  height: number;
  isMobile: boolean;
}

const SPRING_PARALLAX = { stiffness: 60, damping: 25, mass: 0.5 };

function useCameraParallax(enabled: boolean) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const smoothX = useSpring(x, SPRING_PARALLAX);
  const smoothY = useSpring(y, SPRING_PARALLAX);

  useEffect(() => {
    if (!enabled) return;

    const onMove = (e: PointerEvent) => {
      x.set(((e.clientX / window.innerWidth) - 0.5) * 2);
      y.set(((e.clientY / window.innerHeight) - 0.5) * 2);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [enabled, x, y]);

  return { x: smoothX, y: smoothY };
}

function TunnelCard({
  card,
  progress,
  pointer,
  total,
  stage,
}: {
  card: ComputedCard;
  progress: MotionValue<number>;
  pointer: { x: MotionValue<number>; y: MotionValue<number> };
  total: number;
  stage: StageDimensions;
}) {
  // Sequential progression: Each photo opens from the 1st card to the last card
  const startWindow = (card.index / total) * 0.45;
  const endWindow = startWindow + 0.55;
  const localProgress = useTransform(progress, [startWindow, endWindow], [0, 1]);

  // Starts deep in the center vanishing point (-1750px)
  // Flies forward toward and past the camera (+480px)
  const startZ = stage.isMobile ? -1200 : -1750;
  const endZ = stage.isMobile ? 320 : 480;
  const currZ = useTransform(localProgress, [0, 1], [startZ, endZ]);

  // Opacity: 0 at the deep vanishing point -> emerges smoothly (0 to 0.16) -> solid (0.16 to 0.82) -> dissolves as it flies past camera (0.82 to 0.98)
  const opacity = useTransform(localProgress, [0, 0.16, 0.82, 0.98], [0, 1, 1, 0]);

  // Only allow pointer clicks when the card is actively visible and emerging
  const cardPointerEvents = useTransform(localProgress, (p) => (p > 0.12 && p < 0.88 ? "auto" : "none"));

  const cardWidth = stage.isMobile
    ? Math.max(120, Math.min(160, stage.width * 0.35))
    : Math.max(170, Math.min(250, stage.width * 0.17));

  const posX = card.angleCos * (stage.width * card.radiusFactorX);
  const posY = card.angleSin * (stage.height * card.radiusFactorY);
  const parallaxStrength = stage.isMobile ? 16 : 34;

  const transform = useTransform(
    [currZ, pointer.x, pointer.y],
    ([z, pX, pY]) => {
      const q = posX - (pX as number) * parallaxStrength;
      const et = posY - (pY as number) * parallaxStrength;
      return `translate3d(calc(-50% + ${q}px), calc(-50% + ${et}px), ${z}px) rotateZ(${card.rotationZ}deg)`;
    }
  );

  return (
    <motion.div
      style={{
        width: cardWidth,
        transform,
        opacity,
        pointerEvents: cardPointerEvents,
        zIndex: card.index + 1,
      }}
      className={styles.tunnelCardWrapper}
    >
      <Link href="#projects" className={styles.tunnelCard} aria-label={`View project for ${card.item.title}`}>
        <img
          src={card.item.src}
          alt=""
          draggable={false}
          className={styles.cardImage}
          onError={(e) => {
            (e.currentTarget as HTMLElement).style.display = "none";
          }}
        />
        <div className={styles.cardOverlay}>
          <span className={styles.cardCategory}>{card.item.category}</span>
          <span className={styles.cardTitle}>{card.item.title}</span>
        </div>
      </Link>
    </motion.div>
  );
}

export default function PerspectiveTunnelHero({
  profile,
}: {
  profile?: Profile | null;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState<StageDimensions>({
    width: 1440,
    height: 900,
    isMobile: false,
  });
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  // Interactive motion progress value (0 to 1)
  const rawProgress = useMotionValue(0);
  const smoothProgress = useSpring(rawProgress, {
    stiffness: 85,
    damping: 24,
    restDelta: 0.0005,
  });

  useEffect(() => {
    const reducedMotionMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotionMq.matches) {
      setIsReducedMotion(true);
    }

    const updateDimensions = () => {
      setStage({
        width: window.innerWidth,
        height: window.innerHeight,
        isMobile: window.innerWidth < 768,
      });
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // Smooth wheel & touch scroll handler
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let touchStartY = 0;

    const onWheel = (e: WheelEvent) => {
      if (stage.isMobile || window.innerWidth < 1024) return;
      const current = rawProgress.get();

      if (e.deltaY > 0) {
        // Scrolling down
        if (current < 0.96) {
          e.preventDefault();
          const step = Math.min(e.deltaY * 0.003, 0.15);
          rawProgress.set(Math.min(1, current + step));
        }
      } else if (e.deltaY < 0) {
        // Scrolling up
        if (window.scrollY <= 10 && current > 0.02) {
          e.preventDefault();
          const step = Math.min(Math.abs(e.deltaY) * 0.003, 0.15);
          rawProgress.set(Math.max(0, current - step));
        }
      }
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches[0]) {
        touchStartY = e.touches[0].clientY;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!e.touches[0] || stage.isMobile || window.innerWidth < 1024) return;
      const current = rawProgress.get();
      const deltaY = touchStartY - e.touches[0].clientY;

      if (deltaY > 0 && current < 0.96 && window.scrollY <= 10) {
        e.preventDefault();
        const step = deltaY * 0.002;
        rawProgress.set(Math.min(1, current + step));
        touchStartY = e.touches[0].clientY;
      } else if (deltaY < 0 && window.scrollY <= 10 && current > 0.02) {
        e.preventDefault();
        const step = Math.abs(deltaY) * 0.002;
        rawProgress.set(Math.max(0, current - step));
        touchStartY = e.touches[0].clientY;
      }
    };

    const onWindowScroll = () => {
      const scrollY = window.scrollY;
      const isMobile = stage.isMobile || window.innerWidth < 1024;
      if (isMobile) {
        const heroHeight = window.innerHeight || 800;
        const progress = Math.min(1, Math.max(0, scrollY / (heroHeight * 0.4)));
        rawProgress.set(progress);
        return;
      }
      if (scrollY > 80 && rawProgress.get() < 0.98) {
        rawProgress.set(1);
      } else if (scrollY === 0 && rawProgress.get() > 0.98) {
        rawProgress.set(0);
      }
    };

    container.addEventListener("wheel", onWheel, { passive: false });
    container.addEventListener("touchstart", onTouchStart, { passive: true });
    container.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("scroll", onWindowScroll, { passive: true });

    return () => {
      container.removeEventListener("wheel", onWheel);
      container.removeEventListener("touchstart", onTouchStart);
      container.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("scroll", onWindowScroll);
    };
  }, [rawProgress, stage.isMobile]);

  const pointer = useCameraParallax(!isReducedMotion && !stage.isMobile);

  // Center Content Transitions as you fly through
  const contentScale = useTransform(smoothProgress, [0, 0.5, 1], [1, 1.12, 1.25]);
  const contentOpacity = useTransform(smoothProgress, [0, 0.22, 0.55], [1, 0.7, 0]);
  const contentPointerEvents = useTransform(smoothProgress, (p) => (p > 0.45 ? "none" : "auto"));
  const hintOpacity = useTransform(smoothProgress, [0, 0.12], [1, 0]);

  // Precompute Golden Angle Distribution for the 9 cards
  const computedCards: ComputedCard[] = useMemo(() => {
    return ENGINEERING_CARDS.map((item, index) => {
      const angle = index * 137.5 * (Math.PI / 180); // Golden angle formula
      const radiusX = 0.32 + (index % 3) * 0.07;
      const radiusY = 0.28 + (index % 2) * 0.08;
      return {
        item,
        angleCos: Math.cos(angle),
        angleSin: Math.sin(angle),
        radiusFactorX: radiusX,
        radiusFactorY: radiusY,
        rotationZ: (index % 2 === 0 ? 1 : -1) * (3 + (index % 5) * 2),
        index,
      };
    });
  }, []);

  const smoothNavigateTo = useCallback((sectionId: string) => {
    rawProgress.set(1);
    const elem = document.getElementById(sectionId);
    if (elem) {
      const navOffset = 70;
      const elementPosition = elem.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    } else {
      window.location.hash = sectionId;
    }
  }, [rawProgress, stage.isMobile]);

  const handleProjectsClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    smoothNavigateTo("projects");
  }, [smoothNavigateTo]);

  const handleContactClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    smoothNavigateTo("contact");
  }, [smoothNavigateTo]);

  const handleAboutClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    smoothNavigateTo("about");
  }, [smoothNavigateTo]);

  return (
    <section
      id="home"
      ref={containerRef}
      className={styles.tunnelHeroContainer}
      aria-label="Home perspective tunnel hero"
    >
      <div className={styles.stickyViewport}>
        {/* 3D Scene Layer (cards, rings, depth grid only) */}
        <div
          className={styles.tunnelScene}
          style={{
            perspective: stage.isMobile ? "800px" : "1200px",
            transformStyle: "preserve-3d",
          }}
        >
          {/* Background grid & radial depth */}
          <div className={styles.backgroundGrid} />
          <div className={styles.ambientGlow} />

          {/* Depth Concentric Rings */}
          <div className={styles.innerRing} />
          <div className={styles.outerRing} />

          {/* Floating 3D Cards Tunnel Layer */}
          <div className={styles.cardsTunnel}>
            {computedCards.map((card) => (
              <TunnelCard
                key={card.index}
                card={card}
                progress={smoothProgress}
                pointer={pointer}
                total={computedCards.length}
                stage={stage}
              />
            ))}
          </div>
        </div>

        {/* 2D Overlay: Center Identity & Primary Call to Action */}
        <motion.div
          style={{
            scale: contentScale,
            opacity: contentOpacity,
            pointerEvents: contentPointerEvents,
          }}
          className={styles.centerContent}
        >
          <div className={styles.eyebrow}>
            <span className={styles.eyebrowDot} />
            ELECTRONICS &amp; COMMUNICATION ENGINEERING
          </div>

          <h1 className={styles.mainHeading}>J. SHREYAS ARADHYA</h1>

          <p className={styles.description}>
            Electronics and Communication Engineering student exploring VLSI design, FPGA development, and intelligent hardware systems.
          </p>

          <div className={styles.buttonGroup}>
            <Link
              href="#projects"
              onClick={handleProjectsClick}
              className={styles.primaryBtn}
              aria-label="Explore My Work"
            >
              Explore My Work
            </Link>
            <a
              href={getSocialLinks(profile).githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.secondaryBtn} ${styles.desktopOnlyHeroBtn}`}
              aria-label="GitHub Profile"
            >
              GitHub ↗
            </a>
            <a
              href={getSocialLinks(profile).linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.secondaryBtn} ${styles.desktopOnlyHeroBtn}`}
              aria-label="LinkedIn Profile"
            >
              LinkedIn ↗
            </a>
            <Link
              href="#contact"
              onClick={handleContactClick}
              className={styles.secondaryBtn}
              aria-label="Let's Connect"
            >
              Let&apos;s Connect ↗
            </Link>
            {profile?.resume_url ? (
              <a
                href={profile.resume_url}
                target="_blank"
                rel="noopener noreferrer"
                className={`${styles.secondaryBtn} ${styles.desktopOnlyHeroBtn}`}
                aria-label="View Resume"
              >
                Resume ↗
              </a>
            ) : (
              <Link
                href="#about"
                onClick={handleAboutClick}
                className={`${styles.secondaryBtn} ${styles.desktopOnlyHeroBtn}`}
                aria-label="View About Section"
              >
                Resume ↗
              </Link>
            )}
          </div>
        </motion.div>

        {/* Minimal Scroll Hint with click to About */}
        <motion.a
          href="#about"
          onClick={handleAboutClick}
          style={{ opacity: hintOpacity }}
          className={styles.scrollHint}
          aria-label="Scroll down to About section"
        >
          <span>SCROLL TO EXPLORE</span>
          <div className={styles.scrollIndicatorLine} />
        </motion.a>
      </div>
    </section>
  );
}

export { PerspectiveTunnelHero };
