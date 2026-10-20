"use client";

import { useEffect, useRef, useCallback } from "react";
import styles from "./ASMRStaticBackground.module.css";

/**
 * ASMRStaticBackground
 *
 * Cinematic high-density interactive particle canvas:
 * - Charcoal-dust & glass-shard aesthetic
 * - Reactive magnetic vortex & friction glow on mouse/touch hover
 * - Adaptive particle density & DPR scaling for peak performance
 * - Dark & light theme responsive via CSS data-theme observer
 * - Page-visibility and prefers-reduced-motion aware
 * - pointer-events: none with fixed viewport layer behind portfolio content
 */

interface ParticleState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  colorR: number;
  colorG: number;
  colorB: number;
  isAccent: boolean;
  rotation: number;
  rotationSpeed: number;
  frictionGlow: number;
}

function getActiveTheme(): "dark" | "light" {
  if (typeof document === "undefined") return "dark";
  return (
    (document.documentElement.getAttribute("data-theme") as "dark" | "light") ||
    "dark"
  );
}

function getAdaptiveParticleCount(): number {
  if (typeof window === "undefined") return 250;
  const w = window.innerWidth;
  if (w < 640) return 100;   // Mobile
  if (w < 1024) return 190;  // Tablet
  return 300;                // Desktop
}

export default function ASMRStaticBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameIdRef = useRef<number>(0);
  const mouseRef = useRef<{ x: number; y: number }>({ x: -9999, y: -9999 });
  const particlesRef = useRef<ParticleState[]>([]);
  const dimsRef = useRef<{ w: number; h: number }>({ w: 0, h: 0 });
  const themeRef = useRef<"dark" | "light">("dark");
  const isPausedRef = useRef<boolean>(false);

  const MAGNETIC_RADIUS = 260;
  const VORTEX_STRENGTH = 0.065;
  const PULL_STRENGTH = 0.11;

  const createParticle = useCallback(
    (w: number, h: number): ParticleState => {
      const isDark = themeRef.current === "dark";
      const roll = Math.random();
      const isGlass = roll > 0.65 && roll <= 0.88;
      const isAccent = roll > 0.88; // 12% subtle ECE electric-blue particles

      let r: number, g: number, b: number;
      let alpha: number;

      if (isDark) {
        if (isAccent) {
          // Soft cyan / ECE electric blue (#38bdf8)
          r = 56;
          g = 189;
          b = 248;
          alpha = Math.random() * 0.45 + 0.15;
        } else if (isGlass) {
          // Cool glass shards (silver / ice white)
          r = 225 + Math.random() * 30;
          g = 235 + Math.random() * 20;
          b = 250 + Math.random() * 5;
          alpha = Math.random() * 0.4 + 0.12;
        } else {
          // Charcoal / graphite dust
          const base = 70 + Math.random() * 25;
          r = base;
          g = base;
          b = base + 5;
          alpha = Math.random() * 0.35 + 0.08;
        }
      } else {
        // Light Mode
        if (isAccent) {
          // Deep accent blue (#0284c7)
          r = 2;
          g = 132;
          b = 199;
          alpha = Math.random() * 0.35 + 0.12;
        } else if (isGlass) {
          // Pale slate / glass shards
          r = 90 + Math.random() * 30;
          g = 120 + Math.random() * 30;
          b = 160 + Math.random() * 30;
          alpha = Math.random() * 0.3 + 0.1;
        } else {
          // Muted charcoal dust on light
          const base = 120 + Math.random() * 35;
          r = base;
          g = base;
          b = base + 8;
          alpha = Math.random() * 0.25 + 0.06;
        }
      }

      return {
        x: Math.random() * w,
        y: Math.random() * h,
        size: Math.random() * 1.5 + 0.5,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        colorR: r,
        colorG: g,
        colorB: b,
        isAccent,
        alpha,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.045,
        frictionGlow: 0,
      };
    },
    []
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    // Check prefers-reduced-motion
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotionQuery.matches) {
      const renderStaticFallback = () => {
        themeRef.current = getActiveTheme();
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        const w = window.innerWidth;
        const h = window.innerHeight;
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        canvas.style.width = `${w}px`;
        canvas.style.height = `${h}px`;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        ctx.clearRect(0, 0, w, h);
        const isDark = themeRef.current === "dark";
        for (let i = 0; i < 70; i++) {
          const x = Math.random() * w;
          const y = Math.random() * h;
          const size = Math.random() * 1.5 + 0.5;
          ctx.fillStyle = isDark
            ? `rgba(220, 230, 245, ${Math.random() * 0.15 + 0.04})`
            : `rgba(100, 120, 150, ${Math.random() * 0.12 + 0.03})`;
          ctx.beginPath();
          ctx.moveTo(x, y - size * 2);
          ctx.lineTo(x + size, y);
          ctx.lineTo(x, y + size * 2);
          ctx.lineTo(x - size, y);
          ctx.closePath();
          ctx.fill();
        }
      };

      renderStaticFallback();
      window.addEventListener("resize", renderStaticFallback);
      return () => window.removeEventListener("resize", renderStaticFallback);
    }

    const initCanvas = () => {
      themeRef.current = getActiveTheme();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = window.innerWidth;
      const h = window.innerHeight;

      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      dimsRef.current = { w, h };
      const count = getAdaptiveParticleCount();
      particlesRef.current = [];
      for (let i = 0; i < count; i++) {
        particlesRef.current.push(createParticle(w, h));
      }
    };

    initCanvas();

    const render = () => {
      if (isPausedRef.current) {
        animFrameIdRef.current = requestAnimationFrame(render);
        return;
      }

      const { w, h } = dimsRef.current;
      const isDark = themeRef.current === "dark";
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const particles = particlesRef.current;

      // Soft kinetic motion blur trail
      ctx.fillStyle = isDark
        ? "rgba(5, 5, 5, 0.18)"
        : "rgba(248, 250, 252, 0.20)";
      ctx.fillRect(0, 0, w, h);

      const magRadSq = MAGNETIC_RADIUS * MAGNETIC_RADIUS;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Magnetic vector calculation
        const dx = mx - p.x;
        const dy = my - p.y;
        const distSq = dx * dx + dy * dy;

        if (distSq > 0.2 && distSq < magRadSq) {
          const dist = Math.sqrt(distSq);
          const force = (MAGNETIC_RADIUS - dist) / MAGNETIC_RADIUS;
          const invDist = 1 / dist;

          // Pull inward
          p.vx += dx * invDist * force * PULL_STRENGTH;
          p.vy += dy * invDist * force * PULL_STRENGTH;

          // Swirl vortex perpendicular to radius
          p.vx += dy * invDist * force * VORTEX_STRENGTH * 8.5;
          p.vy -= dx * invDist * force * VORTEX_STRENGTH * 8.5;

          // Friction glow based on proximity & acceleration
          p.frictionGlow = force * 0.75;
        } else {
          p.frictionGlow *= 0.92;
        }

        p.x += p.vx;
        p.y += p.vy;

        // Damping / Friction
        p.vx *= 0.945;
        p.vy *= 0.945;

        // Subtle organic Brownian jitter (static feeling)
        p.vx += (Math.random() - 0.5) * 0.035;
        p.vy += (Math.random() - 0.5) * 0.035;

        p.rotation +=
          p.rotationSpeed +
          (Math.abs(p.vx) + Math.abs(p.vy)) * 0.04;

        // Boundary wrapping
        if (p.x < -20) p.x = w + 20;
        else if (p.x > w + 20) p.x = -20;
        if (p.y < -20) p.y = h + 20;
        else if (p.y > h + 20) p.y = -20;

        // Render particle
        const finalAlpha = Math.min(p.alpha + p.frictionGlow, 0.9);

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = `rgba(${p.colorR | 0},${p.colorG | 0},${p.colorB | 0},${finalAlpha})`;

        // Kinetic glow when accelerated
        if (p.frictionGlow > 0.35) {
          const glowAlpha = p.frictionGlow * 0.6;
          ctx.shadowBlur = 8 * p.frictionGlow;
          ctx.shadowColor = p.isAccent
            ? `rgba(56, 189, 248, ${glowAlpha})`
            : isDark
            ? `rgba(180, 220, 255, ${glowAlpha})`
            : `rgba(2, 132, 199, ${glowAlpha})`;
        }

        // Geometric diamond shard
        const s = p.size;
        ctx.beginPath();
        ctx.moveTo(0, -s * 2.4);
        ctx.lineTo(s, 0);
        ctx.lineTo(0, s * 2.4);
        ctx.lineTo(-s, 0);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
      }

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    animFrameIdRef.current = requestAnimationFrame(render);

    // Event Listeners: clientX and clientY match the fixed viewport canvas
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouseRef.current.x = -9999;
      mouseRef.current.y = -9999;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) {
        mouseRef.current.x = e.touches[0].clientX;
        mouseRef.current.y = e.touches[0].clientY;
      }
    };

    const handleTouchEnd = () => {
      mouseRef.current.x = -9999;
      mouseRef.current.y = -9999;
    };

    const handleVisibilityChange = () => {
      isPausedRef.current = document.hidden;
    };

    let resizeTimer: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(initCanvas, 150);
    };

    // Observer for dark/light mode toggle
    const themeObserver = new MutationObserver(() => {
      const current = getActiveTheme();
      if (current !== themeRef.current) {
        themeRef.current = current;
        const { w, h } = dimsRef.current;
        particlesRef.current = particlesRef.current.map(() =>
          createParticle(w, h)
        );
      }
    });

    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mouseleave", handleMouseLeave, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    window.addEventListener("touchcancel", handleTouchEnd, { passive: true });
    window.addEventListener("resize", handleResize, { passive: true });
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      cancelAnimationFrame(animFrameIdRef.current);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("touchcancel", handleTouchEnd);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      themeObserver.disconnect();
      clearTimeout(resizeTimer);
    };
  }, [createParticle]);

  return (
    <div className={styles.container} aria-hidden="true">
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  );
}
