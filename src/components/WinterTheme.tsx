"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import styles from "./WinterTheme.module.css";
import Switch from "./ui/sky-toggle";
import ASMRStaticBackground from "./ASMRStaticBackground";

interface Snowflake {
  x: number;
  y: number;
  size: number;
  depth: number; // 1 = distant soft powder (72%), 2 = mid crystal (20%), 3 = foreground 3D hero crystal (8%)
  alpha: number;
  baseAlpha: number;
  vy: number;
  vx: number;
  sway: number;
  swaySpeed: number;
  swayRadius: number;
  rotation: number;
  rotationSpeed: number;
  wobbleX: number;
  wobbleXSpeed: number;
  isCrystal: boolean;
  twinkle: number;
  twinkleSpeed: number;
}

export default function WinterTheme() {
  const [enabled, setEnabled] = useState<boolean>(true);
  const [mounted, setMounted] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameIdRef = useRef<number>(0);
  const mouseRef = useRef<{ x: number; y: number }>({ x: -9999, y: -9999 });
  const snowflakesRef = useRef<Snowflake[]>([]);
  const dimsRef = useRef<{ w: number; h: number }>({ w: 0, h: 0 });
  const isPausedRef = useRef<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Set default audio volume on mount
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.65;
    }
  }, []);

  // When winter mode is turned OFF (enabled === false), IMMEDIATELY pause and silence music
  useEffect(() => {
    if (!enabled && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, [enabled]);

  // Handle play / pause toggle (only callable in winter mode)
  const toggleMusic = () => {
    if (!enabled) return;
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => {
        console.warn("Audio playback error:", err);
      });
    }
  };

  // Sync with localStorage & custom events
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("winter_theme_active");
    if (saved !== null) {
      const isAct = saved === "true";
      setEnabled(isAct);
      if (isAct) {
        document.documentElement.setAttribute("data-winter", "true");
      } else {
        document.documentElement.removeAttribute("data-winter");
      }
    } else {
      document.documentElement.setAttribute("data-winter", "true");
    }

    const handleThemeChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ enabled: boolean }>;
      if (customEvent.detail && typeof customEvent.detail.enabled === "boolean") {
        const next = customEvent.detail.enabled;
        setEnabled(next);
        if (next) {
          document.documentElement.setAttribute("data-winter", "true");
        } else {
          document.documentElement.removeAttribute("data-winter");
        }
      }
    };

    window.addEventListener("winter-theme-change", handleThemeChange);
    return () => window.removeEventListener("winter-theme-change", handleThemeChange);
  }, []);

  const handleToggle = (next: boolean) => {
    setEnabled(next);
    localStorage.setItem("winter_theme_active", String(next));
    if (next) {
      document.documentElement.setAttribute("data-winter", "true");
    } else {
      document.documentElement.removeAttribute("data-winter");
    }
    window.dispatchEvent(
      new CustomEvent("winter-theme-change", { detail: { enabled: next } })
    );
  };

  const createSnowflake = useCallback(
    (w: number, h: number, startRandomY: boolean = true): Snowflake => {
      const roll = Math.random();
      let depth: number;
      let size: number;
      let vy: number;
      let baseAlpha: number;
      let isCrystal: boolean;

      if (roll < 0.72) {
        // Depth 1: Soft distant atmospheric powder (72% of total snowflakes)
        // Gentle, slow, dreamy float
        depth = 1;
        size = Math.random() * 1.8 + 1.2; // 1.2px - 3.0px
        vy = Math.random() * 0.28 + 0.24; // Slow, tranquil terminal velocity
        baseAlpha = Math.random() * 0.35 + 0.22;
        isCrystal = false;
      } else if (roll < 0.92) {
        // Depth 2: Mid-ground delicate 6-armed crystal snowflakes (20% of total)
        depth = 2;
        size = Math.random() * 6 + 9; // 9px - 15px
        vy = Math.random() * 0.35 + 0.42;
        baseAlpha = Math.random() * 0.28 + 0.55;
        isCrystal = true;
      } else {
        // Depth 3: Foreground hero crystals with 3D fluttering perspective (8% of total)
        depth = 3;
        size = Math.random() * 8 + 18; // 18px - 26px
        vy = Math.random() * 0.4 + 0.55;
        baseAlpha = Math.random() * 0.25 + 0.72;
        isCrystal = true;
      }

      return {
        x: Math.random() * w,
        y: startRandomY ? Math.random() * h : -size - 10,
        size,
        depth,
        alpha: baseAlpha,
        baseAlpha,
        vy,
        vx: (Math.random() - 0.5) * 0.18,
        sway: Math.random() * Math.PI * 2,
        swaySpeed: Math.random() * 0.012 + 0.006,
        swayRadius: Math.random() * 1.2 + 0.6,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.012,
        wobbleX: Math.random() * Math.PI * 2,
        wobbleXSpeed: Math.random() * 0.02 + 0.012,
        isCrystal,
        twinkle: Math.random() * Math.PI,
        twinkleSpeed: Math.random() * 0.03 + 0.015,
      };
    },
    []
  );

  // Initialize and run Canvas Snowfall when enabled
  useEffect(() => {
    if (!enabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    // Pre-render delicate 6-fold dendritic crystal snowflake matching reference geometry
    const makeDendriticCrystalCanvas = (dim: number) => {
      const off = document.createElement("canvas");
      off.width = dim;
      off.height = dim;
      const octx = off.getContext("2d");
      if (!octx) return off;

      const cx = dim / 2;
      const cy = dim / 2;
      const r = dim * 0.45;
      octx.strokeStyle = "rgba(240, 249, 255, 0.95)";
      octx.fillStyle = "rgba(255, 255, 255, 0.98)";
      octx.lineWidth = Math.max(1, dim * 0.026);
      octx.lineCap = "round";
      octx.lineJoin = "round";

      // 1. Central hexagonal hub
      const hubR = r * 0.16;
      octx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (i * Math.PI) / 3;
        const hx = cx + Math.cos(a) * hubR;
        const hy = cy + Math.sin(a) * hubR;
        if (i === 0) octx.moveTo(hx, hy);
        else octx.lineTo(hx, hy);
      }
      octx.closePath();
      octx.stroke();

      // 2. Inner star glint
      octx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (i * Math.PI) / 3;
        octx.moveTo(cx, cy);
        octx.lineTo(cx + Math.cos(a) * hubR, cy + Math.sin(a) * hubR);
      }
      octx.stroke();

      // 3. 6 Primary dendritic arms
      for (let i = 0; i < 6; i++) {
        const a = (i * Math.PI) / 3;
        const cos = Math.cos(a);
        const sin = Math.sin(a);
        const px = -sin;
        const py = cos;

        // Main arm line from hub to tip
        octx.beginPath();
        octx.moveTo(cx + cos * hubR, cy + sin * hubR);
        octx.lineTo(cx + cos * r, cy + sin * r);
        octx.stroke();

        // Inner small spurs at 30%
        const r1 = r * 0.32;
        const spurLen = r * 0.17;
        const b1x = cx + cos * r1;
        const b1y = cy + sin * r1;
        octx.beginPath();
        octx.moveTo(b1x, b1y);
        octx.lineTo(b1x + (cos * 0.5 + px * 0.866) * spurLen, b1y + (sin * 0.5 + py * 0.866) * spurLen);
        octx.moveTo(b1x, b1y);
        octx.lineTo(b1x + (cos * 0.5 - px * 0.866) * spurLen, b1y + (sin * 0.5 - py * 0.866) * spurLen);
        octx.stroke();

        // Main dendritic chevron branches at 58% (with secondary sub-barbs)
        const r2 = r * 0.58;
        const chevLen = r * 0.36;
        const b2x = cx + cos * r2;
        const b2y = cy + sin * r2;

        const armR_x = b2x + (cos * 0.5 + px * 0.866) * chevLen;
        const armR_y = b2y + (sin * 0.5 + py * 0.866) * chevLen;
        const armL_x = b2x + (cos * 0.5 - px * 0.866) * chevLen;
        const armL_y = b2y + (sin * 0.5 - py * 0.866) * chevLen;

        octx.beginPath();
        octx.moveTo(b2x, b2y);
        octx.lineTo(armR_x, armR_y);
        octx.moveTo(b2x, b2y);
        octx.lineTo(armL_x, armL_y);
        octx.stroke();

        // Sub-barbs on the chevron arms
        const subBarbLen = r * 0.12;
        octx.beginPath();
        octx.moveTo(b2x + (armR_x - b2x) * 0.45, b2y + (armR_y - b2y) * 0.45);
        octx.lineTo(
          b2x + (armR_x - b2x) * 0.45 + cos * subBarbLen,
          b2y + (armR_y - b2y) * 0.45 + sin * subBarbLen
        );
        octx.moveTo(b2x + (armL_x - b2x) * 0.45, b2y + (armL_y - b2y) * 0.45);
        octx.lineTo(
          b2x + (armL_x - b2x) * 0.45 + cos * subBarbLen,
          b2y + (armL_y - b2y) * 0.45 + sin * subBarbLen
        );
        octx.stroke();

        // Outer small chevron at 80%
        const r3 = r * 0.8;
        const chev3Len = r * 0.19;
        const b3x = cx + cos * r3;
        const b3y = cy + sin * r3;
        octx.beginPath();
        octx.moveTo(b3x, b3y);
        octx.lineTo(b3x + (cos * 0.5 + px * 0.866) * chev3Len, b3y + (sin * 0.5 + py * 0.866) * chev3Len);
        octx.moveTo(b3x, b3y);
        octx.lineTo(b3x + (cos * 0.5 - px * 0.866) * chev3Len, b3y + (sin * 0.5 - py * 0.866) * chev3Len);
        octx.stroke();

        // Diamond arrowhead spearhead tip
        const dTip = r * 1.0;
        const dBase = r * 0.85;
        const dMid = r * 0.92;
        const dWidth = r * 0.09;

        octx.beginPath();
        octx.moveTo(cx + cos * dTip, cy + sin * dTip);
        octx.lineTo(cx + cos * dMid + px * dWidth, cy + sin * dMid + py * dWidth);
        octx.lineTo(cx + cos * dBase, cy + sin * dBase);
        octx.lineTo(cx + cos * dMid - px * dWidth, cy + sin * dMid - py * dWidth);
        octx.closePath();
        octx.fill();
        octx.stroke();
      }

      // Center ice nucleus dot
      octx.beginPath();
      octx.arc(cx, cy, Math.max(1, dim * 0.018), 0, Math.PI * 2);
      octx.fill();

      return off;
    };

    const crystalCanvasMed = makeDendriticCrystalCanvas(48);
    const crystalCanvasLrg = makeDendriticCrystalCanvas(96);

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const initCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = window.innerWidth;
      const h = window.innerHeight;

      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      dimsRef.current = { w, h };

      // Reduced, elegant snowflake count: "make snow littel less"
      // 32 on mobile, 52 on tablet, 78 on desktop (peaceful, gentle snowfall)
      const count = w < 640 ? 32 : w < 1024 ? 52 : 78;
      snowflakesRef.current = [];
      for (let i = 0; i < count; i++) {
        snowflakesRef.current.push(createSnowflake(w, h, true));
      }
    };

    initCanvas();

    if (prefersReducedMotion) {
      const { w, h } = dimsRef.current;
      ctx.clearRect(0, 0, w, h);
      snowflakesRef.current.forEach((s) => {
        ctx.fillStyle = `rgba(255, 255, 255, ${s.baseAlpha * 0.7})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size * 0.5, 0, Math.PI * 2);
        ctx.fill();
      });
      return;
    }

    let lastTime = performance.now();

    const render = (now: number) => {
      if (isPausedRef.current) {
        animFrameIdRef.current = requestAnimationFrame(render);
        return;
      }

      const dt = Math.min((now - lastTime) / 16.66, 2.5);
      lastTime = now;

      const { w, h } = dimsRef.current;
      ctx.clearRect(0, 0, w, h);

      // Subtle, gentle winter breeze oscillating smoothly
      const wind = Math.sin(now * 0.0003) * 0.25 + 0.08;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const flakes = snowflakesRef.current;

      for (let i = 0; i < flakes.length; i++) {
        const flake = flakes[i];

        // 1. Natural sway and graceful descent
        flake.sway += flake.swaySpeed * dt;
        const currentSway = Math.sin(flake.sway) * flake.swayRadius;
        flake.x += (flake.vx + currentSway + wind * (flake.depth * 0.3)) * dt;
        flake.y += flake.vy * dt;

        // 2. Realistic 3D tumbling rotation and face-tilt
        flake.rotation += flake.rotationSpeed * dt;
        flake.wobbleX += flake.wobbleXSpeed * dt;

        // 3. Air turbulence on mouse proximity
        if (mx > -1000) {
          const dx = flake.x - mx;
          const dy = flake.y - my;
          const distSq = dx * dx + dy * dy;
          const mouseRadius = 120;

          if (distSq < mouseRadius * mouseRadius && distSq > 4) {
            const dist = Math.sqrt(distSq);
            const force = (mouseRadius - dist) / mouseRadius;
            flake.x += (dx / dist) * force * 2.8 * dt;
            flake.y += (dy / dist) * force * 1.5 * dt;
          }
        }

        // 4. Subtle crystal twinkle
        if (flake.isCrystal) {
          flake.twinkle += flake.twinkleSpeed * dt;
        }

        // 5. Boundary wrapping
        if (flake.y > h + flake.size + 15) {
          flake.y = -flake.size - 10;
          flake.x = Math.random() * w;
        } else if (flake.x > w + flake.size + 15) {
          flake.x = -flake.size - 10;
        } else if (flake.x < -flake.size - 15) {
          flake.x = w + flake.size + 10;
        }

        // 6. Realistic rendering by depth
        ctx.save();
        ctx.translate(flake.x, flake.y);

        if (!flake.isCrystal) {
          // Distant soft atmospheric flake (gently glowing ice bead)
          const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, flake.size);
          grad.addColorStop(0, `rgba(255, 255, 255, ${flake.alpha})`);
          grad.addColorStop(0.55, `rgba(224, 242, 254, ${flake.alpha * 0.6})`);
          grad.addColorStop(1, "rgba(186, 230, 253, 0)");
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(0, 0, flake.size, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // 6-armed dendritic crystal snowflake with 3D perspective tumbling
          ctx.rotate(flake.rotation);

          // Realistic 3D flutter/pitch: crystal appears to tilt in 3D air currents
          const tiltScale = Math.cos(flake.wobbleX);
          ctx.scale(tiltScale, 1.0);

          // Specular moonlight flash when face-on to camera
          const specular = Math.abs(tiltScale);
          const effectiveAlpha = Math.min(
            1,
            flake.alpha * (0.65 + specular * 0.35 + Math.sin(flake.twinkle) * 0.1)
          );
          ctx.globalAlpha = Math.max(0, effectiveAlpha);

          const s = flake.size;
          const sprite = s > 17 ? crystalCanvasLrg : crystalCanvasMed;
          ctx.drawImage(sprite, -s / 2, -s / 2, s, s);

          // Center specular diamond glint when directly face-on
          if (flake.depth === 3 && specular > 0.88) {
            ctx.fillStyle = `rgba(255, 255, 255, ${specular * 0.9})`;
            ctx.beginPath();
            ctx.arc(0, 0, Math.max(1, s * 0.05), 0, Math.PI * 2);
            ctx.fill();
          }
        }

        ctx.restore();
      }

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    animFrameIdRef.current = requestAnimationFrame(render);

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouseRef.current.x = -9999;
      mouseRef.current.y = -9999;
    };

    let resizeTimer: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(initCanvas, 150);
    };

    const handleVisibility = () => {
      isPausedRef.current = document.hidden;
      if (!document.hidden) {
        lastTime = performance.now();
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mouseleave", handleMouseLeave, { passive: true });
    window.addEventListener("resize", handleResize, { passive: true });
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      cancelAnimationFrame(animFrameIdRef.current);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibility);
      clearTimeout(resizeTimer);
    };
  }, [enabled, createSnowflake]);

  return (
    <>
      {enabled ? (
        <>
          {/* 1. Photorealistic Celestial Moon in upper sky */}
          <div className={styles.moonWrapper} aria-hidden="true">
            <div className={styles.moonHaloOuter} />
            <div className={styles.moonHaloMid} />
            <div className={styles.moonHaloInner} />
            <div className={styles.moonBody}>
              <img
                src="/images/realistic-moon.webp"
                alt="Photorealistic Moon"
                className={styles.moonImage}
                draggable={false}
              />
              <div className={styles.moonLimbGlow} />
              <div className={styles.moonFrostSheen} />
            </div>
          </div>

          {/* 2. Realistic 60FPS Dendritic Snowflake Canvas */}
          <canvas ref={canvasRef} className={styles.snowCanvas} aria-hidden="true" />

          {/* 3. Realistic Ground Snowdrifts & Frost Crests */}
          <div className={styles.groundSnowWrapper} aria-hidden="true">
            <div className={styles.groundMist} />
            <svg
              className={styles.snowbankSvg}
              viewBox="0 0 1440 95"
              preserveAspectRatio="none"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="snowDeepGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.22" />
                  <stop offset="50%" stopColor="#0284c7" stopOpacity="0.12" />
                  <stop offset="100%" stopColor="#0369a1" stopOpacity="0.04" />
                </linearGradient>

                <linearGradient id="snowMidGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#e0f2fe" stopOpacity="0.5" />
                  <stop offset="35%" stopColor="#bae6fd" stopOpacity="0.35" />
                  <stop offset="80%" stopColor="#38bdf8" stopOpacity="0.16" />
                  <stop offset="100%" stopColor="#0284c7" stopOpacity="0.06" />
                </linearGradient>

                <linearGradient id="snowForeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.92" />
                  <stop offset="20%" stopColor="#f0f9ff" stopOpacity="0.78" />
                  <stop offset="55%" stopColor="#bae6fd" stopOpacity="0.42" />
                  <stop offset="100%" stopColor="#0284c7" stopOpacity="0.12" />
                </linearGradient>

                <linearGradient id="crestGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.88" />
                  <stop offset="25%" stopColor="#bae6fd" stopOpacity="0.65" />
                  <stop offset="50%" stopColor="#ffffff" stopOpacity="0.92" />
                  <stop offset="75%" stopColor="#bae6fd" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0.88" />
                </linearGradient>
              </defs>

              <path
                d="M0 60 C240 32, 490 70, 740 42 C990 18, 1220 52, 1440 34 L1440 95 L0 95 Z"
                fill="url(#snowDeepGrad)"
              />
              <path
                d="M0 68 C190 46, 410 76, 640 52 C880 26, 1140 64, 1440 46 L1440 95 L0 95 Z"
                fill="url(#snowMidGrad)"
              />
              <path
                d="M0 76 C170 60, 360 82, 570 66 C790 50, 1070 76, 1280 60 C1370 54, 1415 58, 1440 55 L1440 95 L0 95 Z"
                fill="url(#snowForeGrad)"
              />
              <path
                d="M0 76 C170 60, 360 82, 570 66 C790 50, 1070 76, 1280 60 C1370 54, 1415 58, 1440 55"
                stroke="url(#crestGlow)"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>

            <div className={styles.sparkle} style={{ bottom: "46px", left: "12%" }} />
            <div className={styles.sparkle} style={{ bottom: "56px", left: "34%", animationDelay: "1.2s" }} />
            <div className={styles.sparkle} style={{ bottom: "50px", left: "58%", animationDelay: "0.6s" }} />
            <div className={styles.sparkle} style={{ bottom: "62px", left: "79%", animationDelay: "1.8s" }} />
            <div className={styles.sparkle} style={{ bottom: "48px", left: "91%", animationDelay: "2.4s" }} />
          </div>
        </>
      ) : (
        /* When Winter Theme is OFF: Normal portfolio interactive particle background */
        <ASMRStaticBackground />
      )}

      {/* Floating Animated Sky Toggle Switch at bottom-left */}
      {mounted && (
        <div className={styles.switchFloatCard}>
          <Switch
            checked={enabled}
            onChange={handleToggle}
            size={10}
            ariaLabel="Toggle Winter / Normal Mode"
          />
          <span className={enabled ? styles.switchLabelActive : styles.switchLabel}>
            {enabled ? "Winter" : "Normal"}
          </span>

          {/* Winter Music Player Button: ONLY visible and active in Winter Mode */}
          {enabled && (
            <>
              <div className={styles.musicDivider} aria-hidden="true" />
              <button
                type="button"
                className={`${styles.musicButton} ${isPlaying ? styles.musicButtonPlaying : ""}`}
                onClick={toggleMusic}
                aria-label={isPlaying ? "Pause Sia - Snowman" : "Play Sia - Snowman"}
                title={isPlaying ? "Pause Sia - Snowman" : "Play Sia - Snowman (Winter Soundtrack)"}
              >
                {isPlaying ? (
                  <span className={styles.equalizer} aria-hidden="true">
                    <span className={styles.eqBar} />
                    <span className={styles.eqBar} />
                    <span className={styles.eqBar} />
                    <span className={styles.eqBar} />
                  </span>
                ) : (
                  <svg className={styles.musicNoteIcon} width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                  </svg>
                )}
                <span className={styles.musicText}>
                  {isPlaying ? "Snowman" : "Music"}
                </span>
                <span className={styles.musicPlayState}>
                  {isPlaying ? "⏸" : "▶"}
                </span>
              </button>
            </>
          )}
        </div>
      )}

      {/* Hidden HTML5 Audio Element for Sia - Snowman (Main Line Chorus) */}
      <audio
        ref={audioRef}
        src="/audio/snowman.mp3?v=hook"
        loop
        preload="auto"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
      />
    </>
  );
}
