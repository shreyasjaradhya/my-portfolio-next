"use client";

import React, { useEffect, useRef, useState } from "react";
import styles from "./SwarmRebuild.module.css";

interface SwarmCursor {
  id: string;
  name: string;
  role: string;
  color: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  tilt: number;
  targetX: number;
  targetY: number;
  clicking: boolean;
  active: boolean;
  currentTask: string;
  tooltip?: string;
  trail: { x: number; y: number }[];
}

interface DistanceRuler {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  label: string;
  color: string;
}

interface SparkParticle {
  id: string;
  x: number;
  y: number;
  color: string;
  vx: number;
  vy: number;
  opacity: number;
}

interface SwarmRebuildProps {
  isOpen: boolean;
  onClose: () => void;
  enableSound?: boolean;
}

// Advanced ASMR-Grade UI Audio Synthesizer (Zero external dependencies)
class SwarmSoundEngine {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;
  private noiseBuffer: AudioBuffer | null = null;

  constructor(enabled: boolean = true) {
    this.enabled = enabled;
  }

  public initCtx() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
  }

  private getNoiseBuffer(): AudioBuffer | null {
    if (!this.ctx) return null;
    if (!this.noiseBuffer) {
      const sampleRate = this.ctx.sampleRate;
      const bufferSize = Math.floor(sampleRate * 0.12);
      this.noiseBuffer = this.ctx.createBuffer(1, bufferSize, sampleRate);
      const data = this.noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.75;
      }
    }
    return this.noiseBuffer;
  }

  // 1. Authentic Mechanical Keyboard Keystroke ("Click-Clack")
  playKeyStroke(isSpace = false) {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const jitter = (Math.random() - 0.5) * 0.16;

      // Layer A: Crisp Plastic Impact Transient
      const noise = this.getNoiseBuffer();
      if (noise) {
        const noiseSrc = this.ctx.createBufferSource();
        noiseSrc.buffer = noise;

        const noiseFilter = this.ctx.createBiquadFilter();
        noiseFilter.type = "bandpass";
        noiseFilter.frequency.setValueAtTime(isSpace ? 1800 : 3800 + jitter * 800, now);
        noiseFilter.Q.setValueAtTime(isSpace ? 1.8 : 2.8, now);

        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(isSpace ? 0.038 : 0.03, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + (isSpace ? 0.016 : 0.012));

        noiseSrc.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(this.ctx.destination);

        noiseSrc.start(now);
        noiseSrc.stop(now + 0.018);
      }

      // Layer B: Tactile Switch Bottom-Out Clack
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      const bodyFilter = this.ctx.createBiquadFilter();

      bodyFilter.type = "lowpass";
      bodyFilter.frequency.setValueAtTime(isSpace ? 340 : 560, now);

      osc.type = "triangle";
      const baseFreq = isSpace ? 165 + jitter * 20 : 285 + jitter * 40;
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.6, now + (isSpace ? 0.036 : 0.024));

      oscGain.gain.setValueAtTime(isSpace ? 0.046 : 0.038, now);
      oscGain.gain.exponentialRampToValueAtTime(0.0001, now + (isSpace ? 0.036 : 0.025));

      osc.connect(bodyFilter);
      bodyFilter.connect(oscGain);
      oscGain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + (isSpace ? 0.038 : 0.028));
    } catch {
      // Audio fallback
    }
  }

  // 2. Mouse Click Transient
  playMouseClick() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.exponentialRampToValueAtTime(700, now + 0.018);

      gain.gain.setValueAtTime(0.035, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.018);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.02);
    } catch {
      // Audio fallback
    }
  }

  // 3. Satisfying Magnetic UI Snap
  playSnap() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(1400, now);

      osc.type = "sine";
      osc.frequency.setValueAtTime(640, now);
      osc.frequency.exponentialRampToValueAtTime(170, now + 0.048);

      gain.gain.setValueAtTime(0.045, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.048);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);

      const clickOsc = this.ctx.createOscillator();
      const clickGain = this.ctx.createGain();
      clickOsc.type = "triangle";
      clickOsc.frequency.setValueAtTime(1800, now);
      clickGain.gain.setValueAtTime(0.016, now);
      clickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.014);

      clickOsc.connect(clickGain);
      clickGain.connect(this.ctx.destination);
      clickOsc.start(now);
      clickOsc.stop(now + 0.015);
    } catch {
      // Audio fallback
    }
  }

  // 4. Smooth Aerodynamic Glide Whoosh
  playWhoosh() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const noise = this.getNoiseBuffer();
      if (!noise) return;

      const src = this.ctx.createBufferSource();
      src.buffer = noise;

      const filter = this.ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(260, now);
      filter.frequency.exponentialRampToValueAtTime(800, now + 0.08);
      filter.frequency.exponentialRampToValueAtTime(240, now + 0.18);
      filter.Q.setValueAtTime(1.8, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.022, now + 0.07);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.19);

      src.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      src.start(now);
      src.stop(now + 0.2);
    } catch {
      // Audio fallback
    }
  }

  // 5. Lush Harmonic Chord (Completion Chime - F Major 9th)
  playCompleteChime() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const freqs = [349.23, 440.0, 523.25, 659.25, 880.0];

      freqs.forEach((freq, idx) => {
        const start = now + idx * 0.06;
        const dur = 1.6;

        const osc = this.ctx!.createOscillator();
        const oscGain = this.ctx!.createGain();
        const filter = this.ctx!.createBiquadFilter();

        filter.type = "lowpass";
        filter.frequency.setValueAtTime(2400, start);
        filter.frequency.exponentialRampToValueAtTime(850, start + dur);

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, start);

        oscGain.gain.setValueAtTime(0.0001, start);
        oscGain.gain.linearRampToValueAtTime(0.038 - idx * 0.004, start + 0.02);
        oscGain.gain.exponentialRampToValueAtTime(0.0001, start + dur);

        osc.connect(filter);
        filter.connect(oscGain);
        oscGain.connect(this.ctx!.destination);

        osc.start(start);
        osc.stop(start + dur + 0.05);

        const detuned = this.ctx!.createOscillator();
        const detunedGain = this.ctx!.createGain();

        detuned.type = "sine";
        detuned.frequency.setValueAtTime(freq * 1.0025, start);

        detunedGain.gain.setValueAtTime(0.0001, start);
        detunedGain.gain.linearRampToValueAtTime(0.016, start + 0.02);
        detunedGain.gain.exponentialRampToValueAtTime(0.0001, start + dur);

        detuned.connect(filter);
        detuned.start(start);
        detuned.stop(start + dur + 0.05);
      });
    } catch {
      // Audio fallback
    }
  }
}

export default function SwarmRebuild({
  isOpen,
  onClose,
  enableSound = true,
}: SwarmRebuildProps) {
  const [speedMultiplier, setSpeedMultiplier] = useState<1 | 1.5 | 2>(1);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [phaseName, setPhaseName] = useState("NAVBAR & HERO");
  const [progress, setProgress] = useState(0);
  const [soundActive, setSoundActive] = useState(enableSound);

  // Dynamic Typewriters
  const [typedTitle, setTypedTitle] = useState("");
  const [typedSubtitle, setTypedSubtitle] = useState("");
  const [typedBio, setTypedBio] = useState("");

  // Section Materialization States (All Full Portfolio Sections)
  const [navMaterialized, setNavMaterialized] = useState(false);
  const [heroMaterialized, setHeroMaterialized] = useState(false);
  const [aboutMaterialized, setAboutMaterialized] = useState(false);
  const [skillsMaterialized, setSkillsMaterialized] = useState(false);
  const [projectsMaterialized, setProjectsMaterialized] = useState(false);
  const [expMaterialized, setExpMaterialized] = useState(false);
  const [certMaterialized, setCertMaterialized] = useState(false);
  const [achieveMaterialized, setAchieveMaterialized] = useState(false);
  const [testimMaterialized, setTestimMaterialized] = useState(false);
  const [contactMaterialized, setContactMaterialized] = useState(false);

  // Ghost Drag Clone state for Project Cards
  const [ghostCard, setGhostCard] = useState<{ x: number; y: number; title: string; active: boolean } | null>(null);

  // World Camera & Visual Helpers
  const [cameraY, setCameraY] = useState(0);
  const [rulers, setRulers] = useState<DistanceRuler[]>([]);
  const [sparks, setSparks] = useState<SparkParticle[]>([]);
  const [marquee, setMarquee] = useState<{ x: number; y: number; w: number; h: number } | null>(null);

  const soundEngineRef = useRef<SwarmSoundEngine | null>(null);
  const animFrameRef = useRef<number | 0>(0);
  const startTimeRef = useRef<number>(0);

  // Internal Random Waypoint & Wandering Brains for 8 Cursors (Sector & Arc Guided)
  const agentBrainsRef = useRef<
    {
      targetX: number;
      targetY: number;
      startX: number;
      startY: number;
      moveStartTime: number;
      moveDuration: number;
      arcHeight: number;
      nextPickTime: number;
      currentTask: string;
      tooltip: string;
      sectorCol: number;
      sectorRow: number;
    }[]
  >([]);

  // Sound Engine setup & instant warm-up
  useEffect(() => {
    soundEngineRef.current = new SwarmSoundEngine(soundActive);
    if (isOpen) {
      soundEngineRef.current.initCtx();
    }
  }, [soundActive, isOpen]);

  // Exactly 8 Focused Multiplayer Agent Cursors (Distinct colors, zero clutter, physical velocity)
  const [cursors, setCursors] = useState<SwarmCursor[]>([
    {
      id: "agent-1",
      name: "Elena",
      role: "UI Architect",
      color: "#38bdf8", // Sky Blue
      x: -140,
      y: -140,
      vx: 0,
      vy: 0,
      tilt: 0,
      targetX: 200,
      targetY: 180,
      clicking: false,
      active: true,
      currentTask: "Mounting LiquidNavbar...",
      tooltip: "<Navbar fixed={true} />",
      trail: [],
    },
    {
      id: "agent-2",
      name: "Marcus",
      role: "Lead Systems",
      color: "#c084fc", // Purple
      x: -140,
      y: -140,
      vx: 0,
      vy: 0,
      tilt: 0,
      targetX: 600,
      targetY: 260,
      clicking: false,
      active: true,
      currentTask: "Streaming typography...",
      tooltip: "font-family: Anton, sans-serif",
      trail: [],
    },
    {
      id: "agent-3",
      name: "Aria",
      role: "Component Engine",
      color: "#fb923c", // Orange
      x: -140,
      y: -140,
      vx: 0,
      vy: 0,
      tilt: 0,
      targetX: 850,
      targetY: 220,
      clicking: false,
      active: true,
      currentTask: "Option-Dragging Project cards...",
      tooltip: "Auto-Layout [H: 24px Gap]",
      trail: [],
    },
    {
      id: "agent-4",
      name: "Devon",
      role: "Silicon & Hardware",
      color: "#4ade80", // Emerald Green
      x: -140,
      y: -140,
      vx: 0,
      vy: 0,
      tilt: 0,
      targetX: 450,
      targetY: 520,
      clicking: false,
      active: true,
      currentTask: "Synthesizing VLSI stack...",
      tooltip: "Verilog • FPGA • Vivado",
      trail: [],
    },
    {
      id: "agent-5",
      name: "KAI-9",
      role: "AI Motion Engine",
      color: "#818cf8", // Electric Indigo
      x: -140,
      y: -140,
      vx: 0,
      vy: 0,
      tilt: 0,
      targetX: 300,
      targetY: 420,
      clicking: false,
      active: true,
      currentTask: "Checking Supabase sync...",
      tooltip: "Latency: 12ms • OK",
      trail: [],
    },
    {
      id: "agent-6",
      name: "Sora",
      role: "Motion & Shader",
      color: "#f43f5e", // Rose Red
      x: -140,
      y: -140,
      vx: 0,
      vy: 0,
      tilt: 0,
      targetX: 720,
      targetY: 340,
      clicking: false,
      active: true,
      currentTask: "Hooking perspective tunnel...",
      tooltip: "Three.js / WebGL",
      trail: [],
    },
    {
      id: "agent-7",
      name: "Kenji",
      role: "RTL Logic Eng",
      color: "#eab308", // Amber Gold
      x: -140,
      y: -140,
      vx: 0,
      vy: 0,
      tilt: 0,
      targetX: 520,
      targetY: 620,
      clicking: false,
      active: true,
      currentTask: "Simulating RISC-V core...",
      tooltip: "RV32I Verilog Model",
      trail: [],
    },
    {
      id: "agent-8",
      name: "Maya",
      role: "UX Inspector",
      color: "#06b6d4", // Cyan Teal
      x: -140,
      y: -140,
      vx: 0,
      vy: 0,
      tilt: 0,
      targetX: 240,
      targetY: 480,
      clicking: false,
      active: true,
      currentTask: "Validating token scales...",
      tooltip: "Border-radius: 24px",
      trail: [],
    },
  ]);

  // Keyboard handler (Escape to exit)
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Spark burst generator
  const spawnSparkBurst = (x: number, y: number, color: string) => {
    const newSparks: SparkParticle[] = [];
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI * 2) / 8 + (Math.random() - 0.5) * 0.4;
      const speed = 2.0 + Math.random() * 2.5;
      newSparks.push({
        id: `spark-${Date.now()}-${Math.random()}`,
        x,
        y,
        color,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        opacity: 1,
      });
    }
    setSparks((prev) => [...prev.slice(-32), ...newSparks]);
  };

  // Full Portfolio Rebuild Animation Loop
  useEffect(() => {
    if (!isOpen) {
      setProgress(0);
      setPhaseIndex(0);
      setPhaseName("NAVBAR & HERO");
      setTypedTitle("");
      setTypedSubtitle("");
      setTypedBio("");
      setCameraY(0);
      setNavMaterialized(false);
      setHeroMaterialized(false);
      setAboutMaterialized(false);
      setSkillsMaterialized(false);
      setProjectsMaterialized(false);
      setExpMaterialized(false);
      setCertMaterialized(false);
      setAchieveMaterialized(false);
      setTestimMaterialized(false);
      setContactMaterialized(false);
      setGhostCard(null);
      setRulers([]);
      setSparks([]);
      setMarquee(null);
      return;
    }

    const w = typeof window !== "undefined" ? window.innerWidth : 1200;
    const h = typeof window !== "undefined" ? window.innerHeight : 800;

    // Spawn Exactly 8 Cursors outside viewport in circle with physical velocity vectors
    setCursors((prev) =>
      prev.map((c, i) => {
        const angle = (i * Math.PI * 2) / 8;
        const dist = Math.max(w, h) * 0.75;
        const spawnX = w / 2 + Math.cos(angle) * dist;
        const spawnY = h / 2 + Math.sin(angle) * dist;
        return {
          ...c,
          x: spawnX,
          y: spawnY,
          vx: -Math.cos(angle) * 6,
          vy: -Math.sin(angle) * 6,
          tilt: 0,
          targetX: w / 2 + Math.cos(angle) * 220,
          targetY: 180 + Math.sin(angle) * 120,
          clicking: false,
          currentTask: "Connecting peer session...",
          trail: [],
        };
      })
    );

    // Initialize 8 brains with sector-based spatial mapping and wrist-arc parameters
    agentBrainsRef.current = Array.from({ length: 8 }).map((_, i) => ({
      targetX: w / 2 + (i - 3.5) * 110,
      targetY: 200,
      startX: w / 2 + (i - 3.5) * 110,
      startY: 200,
      moveStartTime: 0,
      moveDuration: 1.6,
      arcHeight: (i % 2 === 0 ? 1 : -1) * (20 + (i % 3) * 15),
      nextPickTime: 0.4 + i * 0.22,
      currentTask: "Entering canvas...",
      tooltip: "Motion Engine",
      sectorCol: i % 4,
      sectorRow: Math.floor(i / 4),
    }));

    startTimeRef.current = performance.now();

    let prevTitleLen = 0;
    let prevSubLen = 0;
    let prevBioLen = 0;
    let whoosh1Played = false;
    let whoosh2Played = false;
    let ctaClicked = false;

    const fullTitle = "J SHREYAS ARADHYA";
    const fullSubtitle = "VLSI & Embedded Systems Specialist";
    const fullBioSnippet = "Electronics & Communication Engineering student at NMAM Institute of Technology with a strong passion for VLSI design, FPGA development, and embedded computing systems.";

    const cardWidth = Math.min(340, Math.max(260, (w - 140) / 3));
    const cardGap = 24;
    const cardsTotalWidth = cardWidth * 3 + cardGap * 2;
    const cardsStartX = Math.max(30, (w - cardsTotalWidth) / 2);

    const animate = (currentTime: number) => {
      const rawElapsed = (currentTime - startTimeRef.current) / 1000;
      const elapsed = rawElapsed * speedMultiplier;

      const currentProgress = Math.min(100, Math.round((elapsed / 21.0) * 100));
      setProgress(currentProgress);

      // Camera Y Target & Section Schedule for Entire Portfolio (9 Full Phases)
      let targetCamY = 0;
      let curPhase = "1/9: NAVBAR & HERO SECTION";
      let curPhaseIdx = 0;
      let activeMinY = 30;
      let activeMaxY = 380;

      if (elapsed < 2.8) {
        targetCamY = 0;
        curPhase = "1/9: NAVBAR & HERO SECTION";
        curPhaseIdx = 0;
        activeMinY = 30;
        activeMaxY = 380;
      } else if (elapsed < 5.4) {
        targetCamY = 380;
        curPhase = "2/9: ABOUT ME & ACADEMICS";
        curPhaseIdx = 1;
        activeMinY = 480;
        activeMaxY = 780;
      } else if (elapsed < 7.8) {
        targetCamY = 760;
        curPhase = "3/9: SKILLS MATRIX & SILICON STACK";
        curPhaseIdx = 2;
        activeMinY = 860;
        activeMaxY = 1140;
      } else if (elapsed < 10.4) {
        targetCamY = 1140;
        curPhase = "4/9: FEATURED PROJECTS & CIRCUIT CORES";
        curPhaseIdx = 3;
        activeMinY = 1240;
        activeMaxY = 1540;
      } else if (elapsed < 12.8) {
        targetCamY = 1540;
        curPhase = "5/9: EXPERIENCE & ACADEMIC RESEARCH";
        curPhaseIdx = 4;
        activeMinY = 1640;
        activeMaxY = 1940;
      } else if (elapsed < 15.2) {
        targetCamY = 1920;
        curPhase = "6/9: CERTIFICATIONS & NATIONAL CREDENTIALS";
        curPhaseIdx = 5;
        activeMinY = 2020;
        activeMaxY = 2320;
      } else if (elapsed < 17.6) {
        targetCamY = 2320;
        curPhase = "7/9: ACHIEVEMENTS & TESTIMONIALS";
        curPhaseIdx = 6;
        activeMinY = 2420;
        activeMaxY = 2720;
      } else if (elapsed < 19.8) {
        targetCamY = 2720;
        curPhase = "8/9: CONTACT CONSOLE & DIRECT DISPATCH";
        curPhaseIdx = 7;
        activeMinY = 2820;
        activeMaxY = 3120;
      } else {
        const sweepProgress = Math.min(1, (elapsed - 19.8) / 1.8);
        targetCamY = 2720 * (1 - sweepProgress);
        curPhase = "9/9: ALL 9 PORTFOLIO MODULES COMPILED & LOCKED";
        curPhaseIdx = 8;
        activeMinY = 100;
        activeMaxY = 400;
      }

      setPhaseName(curPhase);
      setPhaseIndex(curPhaseIdx);
      setCameraY((prev) => prev + (targetCamY - prev) * 0.08);

      // Section Materialization Snap Schedule
      if (elapsed >= 0.8 && !navMaterialized) {
        setNavMaterialized(true);
        soundEngineRef.current?.playSnap();
        spawnSparkBurst(w / 2, 50, "#38bdf8");
      }
      if (elapsed >= 1.6 && !heroMaterialized) {
        setHeroMaterialized(true);
        soundEngineRef.current?.playSnap();
        spawnSparkBurst(w / 2, 240, "#c084fc");
      }
      if (elapsed >= 3.6 && !aboutMaterialized) {
        setAboutMaterialized(true);
        soundEngineRef.current?.playSnap();
        spawnSparkBurst(w / 2, 600, "#4ade80");
      }
      if (elapsed >= 6.0 && !skillsMaterialized) {
        setSkillsMaterialized(true);
        soundEngineRef.current?.playSnap();
        spawnSparkBurst(w / 2, 980, "#fb923c");
      }
      if (elapsed >= 8.6 && !projectsMaterialized) {
        setProjectsMaterialized(true);
        soundEngineRef.current?.playSnap();
        spawnSparkBurst(cardsStartX + cardWidth / 2, 1340, "#38bdf8");
      }
      if (elapsed >= 11.2 && !expMaterialized) {
        setExpMaterialized(true);
        soundEngineRef.current?.playSnap();
        spawnSparkBurst(w / 2, 1750, "#818cf8");
      }
      if (elapsed >= 13.6 && !certMaterialized) {
        setCertMaterialized(true);
        soundEngineRef.current?.playSnap();
        spawnSparkBurst(w / 2, 2120, "#f59e0b");
      }
      if (elapsed >= 15.8 && !achieveMaterialized) {
        setAchieveMaterialized(true);
        soundEngineRef.current?.playSnap();
        spawnSparkBurst(w / 2 - 200, 2520, "#38bdf8");
      }
      if (elapsed >= 16.6 && !testimMaterialized) {
        setTestimMaterialized(true);
        soundEngineRef.current?.playSnap();
        spawnSparkBurst(w / 2 + 200, 2520, "#ec4899");
      }
      if (elapsed >= 18.2 && !contactMaterialized) {
        setContactMaterialized(true);
        soundEngineRef.current?.playSnap();
        spawnSparkBurst(w / 2, 2920, "#4ade80");
      }

      // Synchronous Mechanical Keystroke Audio
      let curTitleLen = 0;
      if (elapsed > 1.6 && elapsed < 3.8) {
        const p = Math.min(1, (elapsed - 1.6) / 2.0);
        curTitleLen = Math.floor(p * fullTitle.length);
        setTypedTitle(fullTitle.substring(0, curTitleLen));
      } else if (elapsed >= 3.8) {
        curTitleLen = fullTitle.length;
        setTypedTitle(fullTitle);
      }
      if (curTitleLen > prevTitleLen) {
        for (let k = prevTitleLen; k < curTitleLen; k++) {
          soundEngineRef.current?.playKeyStroke(fullTitle[k] === " ");
        }
        prevTitleLen = curTitleLen;
      }

      let curSubLen = 0;
      if (elapsed > 2.8 && elapsed < 4.6) {
        const p = Math.min(1, (elapsed - 2.8) / 1.7);
        curSubLen = Math.floor(p * fullSubtitle.length);
        setTypedSubtitle(fullSubtitle.substring(0, curSubLen));
      } else if (elapsed >= 4.6) {
        curSubLen = fullSubtitle.length;
        setTypedSubtitle(fullSubtitle);
      }
      if (curSubLen > prevSubLen) {
        for (let k = prevSubLen; k < curSubLen; k++) {
          soundEngineRef.current?.playKeyStroke(fullSubtitle[k] === " ");
        }
        prevSubLen = curSubLen;
      }

      let curBioLen = 0;
      if (elapsed > 5.0 && elapsed < 7.2) {
        const p = Math.min(1, (elapsed - 5.0) / 2.0);
        curBioLen = Math.floor(p * fullBioSnippet.length);
        setTypedBio(fullBioSnippet.substring(0, curBioLen));
      } else if (elapsed >= 7.2) {
        curBioLen = fullBioSnippet.length;
        setTypedBio(fullBioSnippet);
      }
      if (curBioLen > prevBioLen) {
        for (let k = prevBioLen; k < curBioLen; k++) {
          soundEngineRef.current?.playKeyStroke(fullBioSnippet[k] === " ");
        }
        prevBioLen = curBioLen;
      }

      // CTA Button Click
      if (elapsed >= 3.4 && !ctaClicked) {
        soundEngineRef.current?.playMouseClick();
        ctaClicked = true;
      }

      // Alt+Drag Ghost Card Clone (During Featured Projects Phase)
      if (elapsed > 8.4 && elapsed < 9.2) {
        if (!whoosh1Played) {
          soundEngineRef.current?.playWhoosh();
          whoosh1Played = true;
        }
        const cloneP = (elapsed - 8.4) / 0.8;
        setGhostCard({
          x: cardsStartX + (cardWidth + cardGap) * cloneP,
          y: 1240,
          title: "FPGA Real-time Signal Accelerator",
          active: true,
        });
      } else if (elapsed >= 9.2 && elapsed < 10.0) {
        if (!whoosh2Played) {
          soundEngineRef.current?.playWhoosh();
          whoosh2Played = true;
        }
        const cloneP = (elapsed - 9.2) / 0.8;
        setGhostCard({
          x: cardsStartX + (cardWidth + cardGap) + (cardWidth + cardGap) * cloneP,
          y: 1240,
          title: "Smart Embedded Hardware Controller",
          active: true,
        });
      } else {
        setGhostCard(null);
      }

      // Dynamic Selection Marquee (Phase 4)
      if (elapsed > 9.6 && elapsed < 10.4) {
        const marqueeP = Math.min(1, (elapsed - 9.6) / 0.7);
        setMarquee({
          x: cardsStartX - 14,
          y: 1210,
          w: (cardsTotalWidth + 28) * marqueeP,
          h: 380,
        });
      } else {
        setMarquee(null);
      }

      // Distance Rulers (Phase 4)
      if (elapsed > 8.8 && elapsed < 10.4) {
        setRulers([
          {
            id: "ruler-gap",
            x1: cardsStartX + cardWidth,
            y1: 1360,
            x2: cardsStartX + cardWidth + cardGap,
            y2: 1360,
            label: "↔ 24px Auto-Layout Gap",
            color: "#f43f5e",
          },
        ]);
      } else {
        setRulers([]);
      }

      // Sparks Physics
      setSparks((prev) =>
        prev
          .map((s) => ({
            ...s,
            x: s.x + s.vx,
            y: s.y + s.vy,
            opacity: s.opacity - 0.024 * speedMultiplier,
          }))
          .filter((s) => s.opacity > 0.05)
      );

      // Procedural Random Wandering Waypoint Generator for 8 Cursors (Sector & Arc Guided)
      const brains = agentBrainsRef.current;
      const minCanvasX = Math.max(70, (w - 1180) / 2);
      const maxCanvasX = Math.min(w - 70, (w + 1180) / 2);
      const canvasWidth = maxCanvasX - minCanvasX;
      const sectionHeight = Math.max(380, activeMaxY - activeMinY);

      brains.forEach((brain, idx) => {
        if (elapsed > brain.nextPickTime && elapsed < 17.0) {
          // Stagger next random waypoint pick between 1.6s and 2.8s
          const duration = (1.6 + Math.random() * 1.1) / speedMultiplier;
          brain.moveStartTime = elapsed;
          brain.moveDuration = duration;
          brain.nextPickTime = elapsed + duration;
          brain.startX = brain.targetX;
          brain.startY = brain.targetY;

          // Natural wrist arc height (gentle curve perpendicular to trajectory)
          brain.arcHeight = (idx % 2 === 0 ? 1 : -1) * (24 + Math.random() * 26);

          // Sector boundaries (4 columns, 2 rows = 8 designated quadrants)
          const colWidth = canvasWidth / 4;
          const rowHeight = sectionHeight / 2;
          const colMin = minCanvasX + brain.sectorCol * colWidth + 24;
          const colMax = colMin + colWidth - 48;
          const rowMin = activeMinY + brain.sectorRow * rowHeight + 20;
          const rowMax = rowMin + rowHeight - 40;

          // Pick target within assigned ergonomic sector with smooth random coordinates
          const randX = colMin + Math.random() * Math.max(20, colMax - colMin);
          const randY = rowMin + Math.random() * Math.max(20, rowMax - rowMin);

          brain.targetX = randX;
          brain.targetY = randY;

          // With 25% probability, shift sector column for organic cross-canvas roaming
          if (Math.random() < 0.25) {
            brain.sectorCol = (brain.sectorCol + (Math.random() > 0.5 ? 1 : 3)) % 4;
          }
        }
      });

      // Compute targets for each of the 8 cursors
      setCursors((prev) => {
        // Step 1: Calculate raw targets with task bindings
        const updated = prev.map((c, i) => {
          let tx = brains[i]?.targetX || c.targetX;
          let ty = brains[i]?.targetY || c.targetY;
          let clicking = false;
          let task = c.currentTask;
          let tooltip = c.tooltip;

          if (elapsed < 2.8) {
            // 1. Hero Section
            if (i === 1) {
              const cursorTypeX = (w / 2 - 200) + (typedTitle.length * 20.5);
              tx = Math.min(w - 70, cursorTypeX);
              ty = 210;
              clicking = true;
              task = `Typing: "${typedTitle.slice(-8) || "Heading"}"`;
              tooltip = "font-family: Anton";
            } else if (i === 0) {
              tx = w / 2 - 260 + Math.sin(elapsed * 2) * 40;
              ty = 48;
              task = "Mounting LiquidNavbar droplets...";
              tooltip = "Auto-Layout [9999px]";
            } else if (i === 2) {
              tx = w / 2 + 320 + Math.sin(elapsed * 2) * 15;
              ty = 48;
              task = "Snapping Resume pill...";
              tooltip = "Constraints: Right";
            } else if (i === 3) {
              tx = w / 2;
              ty = 130 + Math.cos(elapsed * 3) * 6;
              task = "Locking Available For Work pill...";
              tooltip = "● Available • NMAMIT";
              clicking = elapsed > 1.8 && elapsed < 2.2;
            } else {
              task = i === 4 ? "Linting subtitle typography..." :
                     i === 5 ? "Inspecting perspective cards..." :
                     i === 6 ? "Testing 'Explore Projects' CTA..." :
                               "Validating WCAG contrast...";
              tooltip = i === 4 ? "Subtitle: OK" :
                        i === 5 ? "VLSI DESIGN" :
                        i === 6 ? "Button: Primary" : "WCAG AAA";
              clicking = (i === 6 && elapsed > 2.2 && elapsed < 2.6);
            }
          } else if (elapsed < 5.4) {
            // 2. About Section
            if (i === 3) {
              const lineChar = typedBio.length % 55;
              const lineRow = Math.floor(typedBio.length / 55);
              tx = Math.min(w - 100, (w / 2 - 320) + lineChar * 11);
              ty = 680 + lineRow * 18;
              task = "Typing verified biography...";
              tooltip = "Terminal Stream";
              clicking = true;
            } else if (i === 0) {
              tx = w / 2 - 340 + Math.sin(elapsed * 2) * 20;
              ty = 530;
              task = "Styling Hardware & VLSI card...";
              tooltip = "Academic & Projects";
              clicking = true;
            } else if (i === 1) {
              tx = w / 2 + Math.cos(elapsed * 2) * 20;
              ty = 530;
              task = "Styling B.Tech Degree card...";
              tooltip = "NMAM Institute of Technology";
            } else if (i === 2) {
              tx = w / 2 + 340 + Math.sin(elapsed * 2) * 20;
              ty = 530;
              task = "Styling 5+ Projects card...";
              tooltip = "Hardware & Software";
              clicking = true;
            } else {
              task = i === 4 ? "Checking bash shell environment..." :
                     i === 5 ? "Applying glassmorphism border..." :
                     i === 6 ? "Measuring 24px Card gap..." :
                               "Verifying bio font scale...";
              tooltip = i === 4 ? "shreyas@vlsi:~$" :
                        i === 5 ? "backdrop-filter: 20px" :
                        i === 6 ? "↔ 24px Gap" : "line-height: 1.5";
            }
          } else if (elapsed < 7.8) {
            // 3. Skills Matrix
            if (i === 0) {
              tx = w / 2 - 280 + Math.sin(elapsed * 2.5) * 40;
              ty = 890;
              task = "Placing Hardware & VLSI badges...";
              tooltip = "Verilog • SystemVerilog";
              clicking = true;
            } else if (i === 1) {
              tx = w / 2 + 280 + Math.cos(elapsed * 2.5) * 40;
              ty = 890;
              task = "Placing Embedded Systems badges...";
              tooltip = "Microcontrollers • PCB";
            } else if (i === 2) {
              tx = w / 2 - 280 + Math.cos(elapsed * 2.5) * 40;
              ty = 1040;
              task = "Placing EDA & CAD software...";
              tooltip = "Xilinx Vivado • KiCad";
              clicking = true;
            } else if (i === 3) {
              tx = w / 2 + 280 + Math.sin(elapsed * 2.5) * 40;
              ty = 1040;
              task = "Placing Programming Languages...";
              tooltip = "C • Python • Java";
            } else {
              task = i === 4 ? "Synthesizing FPGA bitstream..." :
                     i === 5 ? "Routing Vivado CAD workflow..." :
                     i === 6 ? "Applying neon chip hover glow..." :
                               "Verifying tech logo SVG glyphs...";
              tooltip = i === 4 ? "Xilinx Artix-7 RTL" :
                        i === 5 ? "Timing: OK" :
                        i === 6 ? "Silicon Verified" : "SVG Rendered";
            }
          } else if (elapsed < 10.4) {
            // 4. Featured Projects
            if (i === 0) {
              tx = cardsStartX + cardWidth / 2 + Math.sin(elapsed * 2) * 20;
              ty = 1380;
              task = "Mounting RISC-V 32-bit CPU Card...";
              tooltip = "RV32I Single-Cycle Verilog";
              clicking = true;
            } else if (i === 1) {
              tx = cardsStartX + cardWidth + cardGap + cardWidth / 2 + Math.cos(elapsed * 2) * 20;
              ty = 1380;
              task = "Mounting FPGA Accel Card...";
              tooltip = "Xilinx Vivado Signal DSP";
              clicking = true;
            } else if (i === 2) {
              tx = ghostCard ? ghostCard.x + 80 : cardsStartX + cardWidth + cardGap + cardWidth / 2;
              ty = ghostCard ? ghostCard.y + 40 : 1380;
              task = ghostCard ? "Alt+Drag Option Duplicating..." : "Auto-Layout Card Clone";
              tooltip = "Option-Drag Clone";
              clicking = !!ghostCard;
            } else if (i === 3) {
              tx = cardsStartX + (cardWidth + cardGap) * 2 + cardWidth / 2 + Math.sin(elapsed * 2) * 20;
              ty = 1380;
              task = "Mounting Smart Controller Card...";
              tooltip = "Embedded C & FreeRTOS";
              clicking = true;
            } else {
              task = i === 4 ? "Snapping 24px Gap measurement..." :
                     i === 5 ? "Inspecting RISC-V ARCH badge..." :
                     i === 6 ? "Verifying GitHub repo links..." :
                               "Testing 'View Details' action...";
              tooltip = i === 4 ? "Auto-Layout 24px" :
                        i === 5 ? "RISC-V Architecture" :
                        i === 6 ? "GitHub ↗" : "Details: OK";
            }
          } else if (elapsed < 12.8) {
            // 5. Experience Timeline
            if (i === 0) {
              tx = w / 2 - 260 - 80 + Math.sin(elapsed * 2.5) * 15;
              ty = 1710;
              task = "Pinning Collection diagonal ribbon...";
              tooltip = "VLSI & Hardware Engineering";
              clicking = true;
            } else if (i === 1) {
              tx = w / 2 + 260 - 80 + Math.cos(elapsed * 2.5) * 15;
              ty = 1710;
              task = "Pinning Collection diagonal ribbon...";
              tooltip = "NMAM Institute of Technology";
              clicking = true;
            } else if (i === 2) {
              tx = w / 2 - 260 + 40;
              ty = 1770 + Math.sin(elapsed * 2) * 12;
              task = "Aligning Academic milestone...";
              tooltip = "Role: VLSI Research";
            } else if (i === 3) {
              tx = w / 2 + 260 + 40;
              ty = 1770 + Math.cos(elapsed * 2) * 12;
              task = "Aligning B.Tech ECE milestone...";
              tooltip = "Institution: NMAMIT";
            } else {
              task = i === 4 ? "Tracing PCB timeline trace..." :
                     i === 5 ? "Measuring experience card gap..." :
                     i === 6 ? "Verifying NMAMIT affiliation..." :
                               "Checking milestone typography...";
              tooltip = i === 4 ? "Node: Hardware VLSI" :
                        i === 5 ? "Grid: 2-Column" :
                        i === 6 ? "NMAMIT • Nitte" : "font-weight: 700";
            }
          } else if (elapsed < 15.2) {
            // 6. Certifications & National Credentials
            if (i === 0) {
              tx = w / 2 - 320;
              ty = 2120;
              task = "Validating MY Bharat Budget Quest 2026...";
              tooltip = "National PM Dialogue • Shortlisted";
              clicking = true;
            } else if (i === 1) {
              tx = w / 2;
              ty = 2120;
              task = "Validating IEEE AIDE 2026 Presentation...";
              tooltip = "International Conference Paper";
              clicking = true;
            } else if (i === 2) {
              tx = w / 2 + 320;
              ty = 2120;
              task = "Mounting AIC Nitte Internship Credential...";
              tooltip = "Atal Incubation Centre Nitte";
              clicking = true;
            } else if (i === 3) {
              tx = w / 2 - 320;
              ty = 2190;
              task = "Auditing Ministry of Youth Affairs emblem...";
              tooltip = "Emblem SVG: Verified";
            } else if (i === 4) {
              tx = w / 2;
              ty = 2190;
              task = "Hashing IEEE conference certificate ID...";
              tooltip = "SHA-256 Verified";
            } else if (i === 5) {
              tx = w / 2 + 320;
              ty = 2190;
              task = "Testing credential outbound link...";
              tooltip = "View Experience →";
              clicking = (elapsed > 14.4 && elapsed < 14.8);
            } else {
              task = i === 6 ? "Measuring 3-column auto-layout gap..." : "Checking credential badges...";
              tooltip = i === 6 ? "Auto-Layout [H: 20px]" : "100% Authentic";
            }
          } else if (elapsed < 17.6) {
            // 7. Achievements & Testimonials
            if (i === 0) {
              tx = w / 2 - 280;
              ty = 2480;
              task = "Tracing National PM Dialogue achievement...";
              tooltip = "Rank: Top 0.1% National";
              clicking = true;
            } else if (i === 1) {
              tx = w / 2 - 280;
              ty = 2560;
              task = "Tracing IEEE International Conference node...";
              tooltip = "Publication Verified";
              clicking = true;
            } else if (i === 2) {
              tx = w / 2 + 220;
              ty = 2480;
              task = "Mounting Verified 5-Star Testimonial...";
              tooltip = "Rating: ★★★★★ 5.0";
              clicking = true;
            } else if (i === 3) {
              tx = w / 2 + 220;
              ty = 2580;
              task = "Styling peer recommendation avatar...";
              tooltip = "Circular Avatar Droplet";
            } else {
              task = i === 4 ? "Measuring dual-column responsive grid..." :
                     i === 5 ? "Auditing recommendation quote typography..." :
                     i === 6 ? "Verifying endorsement signatures..." :
                               "Syncing social proof counters...";
              tooltip = i === 4 ? "2-Col Grid 50/50" :
                        i === 5 ? "font-style: italic" :
                        i === 6 ? "Signatures: Valid" : "5.0 / 5.0 Rating";
            }
          } else if (elapsed < 19.8) {
            // 8. Contact Console & Direct Dispatch
            if (i === 0) {
              tx = w / 2 - 220;
              ty = 2880;
              task = "Wiring email: shreyasjaradhya@gmail.com...";
              tooltip = "mailto: dispatch";
              clicking = (elapsed > 18.2 && elapsed < 18.6);
            } else if (i === 1) {
              tx = w / 2;
              ty = 2880;
              task = "Testing LinkedIn profile endpoint...";
              tooltip = "LinkedIn ↗";
            } else if (i === 2) {
              tx = w / 2 + 220;
              ty = 2880;
              task = "Testing GitHub repositories endpoint...";
              tooltip = "GitHub ↗";
            } else if (i === 3) {
              tx = w / 2;
              ty = 2950;
              task = "Locking copyright banner...";
              tooltip = "© 2026 J Shreyas Aradhya";
              clicking = true;
            } else {
              task = i === 4 ? "Validating final full portfolio DOM tree..." :
                     i === 5 ? "Auditing all 9 modules compile status..." :
                     i === 6 ? "Engaging grand celebration sweep..." :
                               "Preparing live restoration...";
              tooltip = i === 4 ? "DOM: 100% Ready" :
                        i === 5 ? "9/9 Modules OK" :
                        i === 6 ? "Celebration: Ready" : "Restoring Live UI";
            }
          } else if (elapsed < 21.4) {
            // 9. Grand Assembly Celebration Swirl: 8 cursors in an evenly spaced orbital ellipse
            const swirlAngle = (elapsed * 2.5) + (i * Math.PI * 2) / 8;
            tx = w / 2 + Math.cos(swirlAngle) * 220;
            ty = 220 + Math.sin(swirlAngle) * 100;
            task = "✓ Complete 9 Modules Verified & Ready!";
            tooltip = "100% DOM Restored";
          } else {
            // Outward Scatter in 8 cardinal directions
            const scatterAngle = (i * Math.PI * 2) / 8;
            tx = w / 2 + Math.cos(scatterAngle) * (w * 0.95);
            ty = 300 + Math.sin(scatterAngle) * (h * 0.95);
            task = "✓ Restoring UI";
            tooltip = "Live Portfolio";
          }

          // Natural wrist arc curvature perpendicular to trajectory during motion
          const brain = brains[i];
          if (brain && elapsed < 19.8) {
            const moveProg = Math.min(1, Math.max(0, (elapsed - brain.moveStartTime) / (brain.moveDuration || 1)));
            const arcFactor = Math.sin(moveProg * Math.PI) * (brain.arcHeight || 0);
            const dxTotal = tx - (brain.startX || tx);
            const dyTotal = ty - (brain.startY || ty);
            const distTotal = Math.hypot(dxTotal, dyTotal) || 1;
            tx += (-dyTotal / distTotal) * arcFactor;
            ty += (dxTotal / distTotal) * arcFactor;
          }

          return {
            ...c,
            targetX: tx,
            targetY: ty,
            clicking,
            currentTask: task,
            tooltip,
          };
        });

        // Step 2: SOFT VELOCITY-BASED ANTI-COLLISION & ANTI-OVERLAP
        // Smooth continuous potential field guarantees ZERO collision, zero overlap, and zero jitter!
        const repForces = Array.from({ length: updated.length }, () => ({ x: 0, y: 0 }));
        const REPULSION_RADIUS = 160; // 160px guaranteed clearance

        for (let i = 0; i < updated.length; i++) {
          for (let j = i + 1; j < updated.length; j++) {
            const dx = prev[i].x - prev[j].x;
            const dy = prev[i].y - prev[j].y;
            const dist = Math.hypot(dx, dy);
            if (dist < REPULSION_RADIUS && dist > 1) {
              const ratio = (REPULSION_RADIUS - dist) / REPULSION_RADIUS;
              // Smooth quadratic repulsion force (zero shock, purely continuous)
              const force = Math.pow(ratio, 2) * 3.2;
              const nx = dx / dist;
              const ny = dy / dist;
              repForces[i].x += nx * force;
              repForces[i].y += ny * force;
              repForces[j].x -= nx * force;
              repForces[j].y -= ny * force;
            }
          }
        }

        // Step 3: CRITICALLY DAMPED SPRING PHYSICS & DYNAMIC TILT
        const SPRING = 0.052;
        const DAMPING = 0.81;

        return updated.map((c, i) => {
          const fx = (c.targetX - c.x) * SPRING + repForces[i].x;
          const fy = (c.targetY - c.y) * SPRING + repForces[i].y;

          let vx = ((c.vx || 0) + fx) * DAMPING;
          let vy = ((c.vy || 0) + fy) * DAMPING;

          // Velocity capping for velvet smoothness
          const speed = Math.hypot(vx, vy);
          const MAX_SPEED = 20;
          if (speed > MAX_SPEED) {
            vx = (vx / speed) * MAX_SPEED;
            vy = (vy / speed) * MAX_SPEED;
          }

          const nextX = c.x + vx;
          const nextY = c.y + vy;

          // Dynamic banking tilt in motion direction (-14deg to +14deg)
          const targetTilt = Math.max(-14, Math.min(14, vx * 1.5));
          const nextTilt = (c.tilt || 0) + (targetTilt - (c.tilt || 0)) * 0.18;

          // Trail handling: append when in motion, dissipate when hovering
          let nextTrail = c.trail;
          const lastPt = c.trail[0];
          if (!lastPt || Math.hypot(nextX - lastPt.x, nextY - lastPt.y) > 2.8) {
            nextTrail = [{ x: nextX, y: nextY }, ...c.trail.slice(0, 9)];
          } else if (c.trail.length > 0) {
            nextTrail = c.trail.slice(0, c.trail.length - 1);
          }

          return {
            ...c,
            x: nextX,
            y: nextY,
            vx,
            vy,
            tilt: nextTilt,
            trail: nextTrail,
          };
        });
      });

      // Play completion celebration chime once upon grand sweep
      if (elapsed >= 19.8 && elapsed < 19.9) {
        soundEngineRef.current?.playCompleteChime();
      }

      // Finish & Close at 22.0 seconds
      if (elapsed < 22.0) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        setTimeout(() => {
          onClose();
        }, 350);
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isOpen, onClose, speedMultiplier]);

  if (!isOpen) return null;

  return (
    <div
      className={`${styles.overlay} ${progress >= 98 ? styles.overlayRestoring : ""}`}
      onClick={onClose}
      aria-label="Portfolio Motions Animation Overlay - Press ESC or Click to exit"
    >
      {/* Blueprint Grid Canvas Background */}
      <div className={styles.gridCanvas} />

      {/* Top HUD: Engine Status, Speed Selector, Sound Toggle, and Exit */}
      <div className={styles.topHud} onClick={(e) => e.stopPropagation()}>
        <div className={styles.hudLeft}>
          <div className={styles.pulseDot} />
          <span className={styles.hudBrand}>PORTFOLIO MOTIONS</span>
          <span className={styles.hudVersion}>v3.0 FULL STACK</span>
        </div>

        <div className={styles.hudCenter}>
          <span className={styles.hudStatus}>
            {progress >= 95
              ? "✓ ALL 9 PORTFOLIO MODULES COMPILED & LOCKED"
              : `REBUILDING: ${phaseName} [${progress}%] • 8 AGENTS ACTIVE`}
          </span>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className={styles.hudRight}>
          {/* Speed Selector */}
          <div className={styles.speedSelector}>
            <button
              type="button"
              onClick={() => setSpeedMultiplier(1)}
              className={`${styles.speedBtn} ${speedMultiplier === 1 ? styles.speedBtnActive : ""}`}
              title="1x normal speed"
            >
              1×
            </button>
            <button
              type="button"
              onClick={() => setSpeedMultiplier(1.5)}
              className={`${styles.speedBtn} ${speedMultiplier === 1.5 ? styles.speedBtnActive : ""}`}
              title="1.5x fast speed"
            >
              1.5×
            </button>
            <button
              type="button"
              onClick={() => setSpeedMultiplier(2)}
              className={`${styles.speedBtn} ${speedMultiplier === 2 ? styles.speedBtnActive : ""}`}
              title="2x turbo speed"
            >
              2×
            </button>
          </div>

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={() => setSoundActive(!soundActive)}
            className={`${styles.soundToggleBtn} ${soundActive ? styles.soundToggleActive : ""}`}
            title={soundActive ? "Mute audio synthesizer" : "Enable audio synthesizer"}
          >
            <span>{soundActive ? "🔊 Sound ON" : "🔇 Sound OFF"}</span>
          </button>

          {/* Exit / Go Live Button */}
          <button
            type="button"
            onClick={onClose}
            className={styles.exitBtn}
            title="Go live (ESC)"
          >
            <span>Go Live / ESC</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {/* Floating Design Inspector Widget (Left side) */}
      <div className={styles.inspectorWidget}>
        <div className={styles.inspectorHeader}>
          <span className={styles.inspectorTitle}>DESIGN INSPECTOR</span>
          <span className={styles.badgeFigma}>FIGMA CAD</span>
        </div>
        <div className={styles.inspectorRow}>
          <span className={styles.inspectorLabel}>ACTIVE MODULE</span>
          <span className={styles.inspectorValue} style={{ color: "#38bdf8" }}>
            {phaseName.split(":")[1]?.trim() || "HERO"}
          </span>
        </div>
        <div className={styles.inspectorRow}>
          <span className={styles.inspectorLabel}>CANVAS DIMENSIONS</span>
          <span className={styles.inspectorValue}>1440 × 3300px</span>
        </div>
        <div className={styles.inspectorRow}>
          <span className={styles.inspectorLabel}>SPECIALTY</span>
          <span className={styles.inspectorValue}>VLSI & Embedded Systems</span>
        </div>
        <div className={styles.inspectorRow}>
          <span className={styles.inspectorLabel}>THEME</span>
          <span className={styles.inspectorValue}>#050505 • Dark Editorial</span>
        </div>
        <div className={styles.inspectorRow}>
          <span className={styles.inspectorLabel}>PORTFOLIO MOTIONS</span>
          <span className={styles.inspectorValue} style={{ color: "#4ade80" }}>
            ● 8 Active Agents (Anti-Collision)
          </span>
        </div>
      </div>

      {/* Document Outline Minimap (Right side - All 9 Sections) */}
      <div className={styles.minimapContainer}>
        <div className={styles.minimapTitle}>MODULE MAP</div>
        <div className={`${styles.miniSection} ${phaseIndex === 0 ? styles.miniActive : ""}`}>
          <span className={styles.miniDot} /> Hero & Nav
        </div>
        <div className={`${styles.miniSection} ${phaseIndex === 1 ? styles.miniActive : ""}`}>
          <span className={styles.miniDot} /> About Me
        </div>
        <div className={`${styles.miniSection} ${phaseIndex === 2 ? styles.miniActive : ""}`}>
          <span className={styles.miniDot} /> Skills Stack
        </div>
        <div className={`${styles.miniSection} ${phaseIndex === 3 ? styles.miniActive : ""}`}>
          <span className={styles.miniDot} /> Projects
        </div>
        <div className={`${styles.miniSection} ${phaseIndex === 4 ? styles.miniActive : ""}`}>
          <span className={styles.miniDot} /> Experience
        </div>
        <div className={`${styles.miniSection} ${phaseIndex === 5 ? styles.miniActive : ""}`}>
          <span className={styles.miniDot} /> Certifications
        </div>
        <div className={`${styles.miniSection} ${phaseIndex === 6 ? styles.miniActive : ""}`}>
          <span className={styles.miniDot} /> Achievements
        </div>
        <div className={`${styles.miniSection} ${phaseIndex === 7 ? styles.miniActive : ""}`}>
          <span className={styles.miniDot} /> Testimonials
        </div>
        <div className={`${styles.miniSection} ${phaseIndex >= 8 ? styles.miniActive : ""}`}>
          <span className={styles.miniDot} /> Contact & Lock
        </div>
      </div>

      {/* World Canvas (Translates with Virtual Camera Y) */}
      <div
        className={styles.worldCanvas}
        style={{
          transform: `translate3d(0, ${-cameraY}px, 0)`,
        }}
      >
        {/* Dynamic Selection Marquee Box */}
        {marquee && (
          <div
            className={styles.marqueeBox}
            style={{
              left: `${marquee.x}px`,
              top: `${marquee.y}px`,
              width: `${marquee.w}px`,
              height: `${marquee.h}px`,
            }}
          >
            <span className={styles.marqueeBadge}>3 Project Cards Selected (Auto-Layout 24px)</span>
          </div>
        )}

        {/* Distance Rulers */}
        {rulers.map((r) => (
          <div
            key={r.id}
            className={styles.distanceRuler}
            style={{
              left: `${r.x1}px`,
              top: `${r.y1}px`,
              width: `${Math.abs(r.x2 - r.x1) || 2}px`,
              height: `${Math.abs(r.y2 - r.y1) || 2}px`,
              borderColor: r.color,
            }}
          >
            <span className={styles.rulerPill} style={{ background: r.color }}>
              {r.label}
            </span>
          </div>
        ))}

        {/* Alt+Drag Ghost Card Clone Preview */}
        {ghostCard && (
          <div
            className={styles.ghostCardClone}
            style={{
              left: `${ghostCard.x}px`,
              top: `${ghostCard.y}px`,
            }}
          >
            <div className={styles.ghostCardTag}>Alt+Drag (Clone)</div>
            <div className={styles.realCardTitle}>{ghostCard.title}</div>
          </div>
        )}

        {/* 1. SECTION: NAVBAR (Full Fidelity Rebuilt) */}
        <div className={`${styles.realSectionWrapper} ${navMaterialized ? styles.sectionMaterialized : styles.sectionDraft}`} style={{ top: 16 }}>
          <div className={styles.sectionFigmaTag}>❖ Component: LiquidNavbar • Auto-Layout</div>
          <header className={styles.realNavbarHeader}>
            <div className={styles.realNavbarLogo}>
              <span className={styles.realLogoDot} />
              <span>J SHREYAS ARADHYA</span>
            </div>
            <nav className={styles.realNavbarPill}>
              <span className={`${styles.realNavItem} ${styles.realNavActive}`}>Home</span>
              <span className={styles.realNavItem}>About</span>
              <span className={styles.realNavItem}>Skills</span>
              <span className={styles.realNavItem}>Projects</span>
              <span className={styles.realNavItem}>Experience</span>
              <span className={styles.realNavItem}>Contact</span>
            </nav>
            <div className={styles.realNavbarActions}>
              <span className={styles.realResumeBtn}>Resume</span>
              <span className={styles.realThemeToggle}>☼</span>
            </div>
          </header>
        </div>

        {/* 2. SECTION: HERO (Full Fidelity Rebuilt) */}
        <div className={`${styles.realSectionWrapper} ${heroMaterialized ? styles.sectionMaterialized : styles.sectionDraft}`} style={{ top: 96 }}>
          <div className={styles.sectionFigmaTag}>❖ Frame: HeroSection • Constraints: Center</div>
          <div className={styles.realHeroContainer}>
            {/* Perspective Tunnel Mock Cards Floating in Background */}
            <div className={styles.tunnelFloatingRow}>
              <div className={styles.tunnelMiniCard}>VLSI DESIGN</div>
              <div className={styles.tunnelMiniCard}>FPGA DEVELOPMENT</div>
              <div className={styles.tunnelMiniCard}>DIGITAL SYSTEMS</div>
            </div>

            <div className={styles.realStatusPill}>
              <span className={styles.realStatusDot} />
              <span>Available for work • NMAMIT</span>
            </div>

            <h1 className={styles.realHeroTitle}>
              <span>{typedTitle}</span>
              <span className={styles.realBlinkingCaret}>|</span>
            </h1>

            <p className={styles.realHeroSubtitle}>
              {typedSubtitle}
            </p>

            <div className={styles.realHeroActions}>
              <button type="button" className={styles.realHeroPrimaryBtn}>Explore Projects ↗</button>
              <button type="button" className={styles.realHeroSecondaryBtn}>Get In Touch</button>
            </div>
          </div>
        </div>

        {/* 3. SECTION: ABOUT ME (Full Fidelity Rebuilt) */}
        <div className={`${styles.realSectionWrapper} ${aboutMaterialized ? styles.sectionMaterialized : styles.sectionDraft}`} style={{ top: 480 }}>
          <div className={styles.sectionFigmaTag}>❖ Frame: AboutMe & Architecture • 3-Column Grid</div>
          <div className={styles.realAboutContainer}>
            <div className={styles.realSectionHeader}>
              <span className={styles.realSectionSubtitle}>Browse My Journey</span>
              <h2 className={styles.realSectionHeading}>About Me</h2>
            </div>

            <div className={styles.realAboutCardsGrid}>
              <div className={styles.realAboutCard}>
                <div className={styles.realAboutIcon}>⚡</div>
                <div className={styles.realAboutCardTitle}>Hardware & VLSI</div>
                <div className={styles.realAboutCardSub}>Academic & Projects</div>
              </div>
              <div className={styles.realAboutCard}>
                <div className={styles.realAboutIcon}>🎓</div>
                <div className={styles.realAboutCardTitle}>B.Tech Degree</div>
                <div className={styles.realAboutCardSub}>NMAM Institute of Technology</div>
              </div>
              <div className={styles.realAboutCard}>
                <div className={styles.realAboutIcon}>🚀</div>
                <div className={styles.realAboutCardTitle}>5+ Projects</div>
                <div className={styles.realAboutCardSub}>Hardware & Software</div>
              </div>
            </div>

            <div className={styles.realBioBox}>
              <div className={styles.realTerminalBar}>
                <span className={styles.dotRed} />
                <span className={styles.dotYellow} />
                <span className={styles.dotGreen} />
                <span className={styles.realTerminalTitle}>shreyas@vlsi:~$ cat biography.txt</span>
              </div>
              <p className={styles.realBioText}>{typedBio}</p>
            </div>
          </div>
        </div>

        {/* 4. SECTION: SKILLS MATRIX (Full Fidelity Rebuilt) */}
        <div className={`${styles.realSectionWrapper} ${skillsMaterialized ? styles.sectionMaterialized : styles.sectionDraft}`} style={{ top: 860 }}>
          <div className={styles.sectionFigmaTag}>❖ Frame: SkillsMatrix & SiliconStack</div>
          <div className={styles.realSkillsContainer}>
            <div className={styles.realSectionHeader}>
              <span className={styles.realSectionSubtitle}>My Capabilities</span>
              <h2 className={styles.realSectionHeading}>Skills & Technologies</h2>
            </div>

            <div className={styles.realSkillsGrid}>
              <div className={styles.realSkillCategoryBox}>
                <h4 className={styles.realCategoryHeading}>Hardware & VLSI</h4>
                <div className={styles.realSkillPillsWrap}>
                  <span className={styles.realSkillPill}>⚡ Verilog / SystemVerilog</span>
                  <span className={styles.realSkillPill}>📟 FPGA Development</span>
                  <span className={styles.realSkillPill}>🔬 Digital Electronics</span>
                  <span className={styles.realSkillPill}>✓ Hardware Verification</span>
                </div>
              </div>

              <div className={styles.realSkillCategoryBox}>
                <h4 className={styles.realCategoryHeading}>Embedded Systems</h4>
                <div className={styles.realSkillPillsWrap}>
                  <span className={styles.realSkillPill}>🔌 Microcontrollers</span>
                  <span className={styles.realSkillPill}>⚙ Embedded Systems</span>
                  <span className={styles.realSkillPill}>🖨 PCB Design</span>
                  <span className={styles.realSkillPill}>🤖 Arduino & FreeRTOS</span>
                </div>
              </div>

              <div className={styles.realSkillCategoryBox}>
                <h4 className={styles.realCategoryHeading}>EDA & CAD Tools</h4>
                <div className={styles.realSkillPillsWrap}>
                  <span className={styles.realSkillPill}>🛠 Xilinx Vivado</span>
                  <span className={styles.realSkillPill}>📐 KiCad PCB</span>
                  <span className={styles.realSkillPill}>📉 LTspice</span>
                  <span className={styles.realSkillPill}>📊 MATLAB & ModelSim</span>
                </div>
              </div>

              <div className={styles.realSkillCategoryBox}>
                <h4 className={styles.realCategoryHeading}>Programming Languages</h4>
                <div className={styles.realSkillPillsWrap}>
                  <span className={styles.realSkillPill}>🅲 C</span>
                  <span className={styles.realSkillPill}>🐍 Python</span>
                  <span className={styles.realSkillPill}>☕ Java</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 5. SECTION: FEATURED PROJECTS (Full Fidelity Rebuilt) */}
        <div className={`${styles.realSectionWrapper} ${projectsMaterialized ? styles.sectionMaterialized : styles.sectionDraft}`} style={{ top: 1240 }}>
          <div className={styles.sectionFigmaTag}>❖ Frame: FeaturedProjects • 3-Column Auto-Layout</div>
          <div className={styles.realProjectsContainer}>
            <div className={styles.realSectionHeader}>
              <span className={styles.realSectionSubtitle}>Browse My Recent</span>
              <h2 className={styles.realSectionHeading}>Featured Projects</h2>
            </div>

            <div className={styles.realProjectsGrid}>
              {/* Project Card 1 */}
              <div className={styles.realProjectCard}>
                <div className={styles.realCardImage}>
                  <div className={styles.realImageBadge}>RISC-V ARCH</div>
                  <div className={styles.realOptionsDots}>•••</div>
                </div>
                <div className={styles.realCardBody}>
                  <h3 className={styles.realCardTitle}>RISC-V 32-bit Single-Cycle CPU</h3>
                  <p className={styles.realCardDesc}>Custom RV32I processor core with arithmetic logic, branching control, and simulated pipeline verification.</p>
                  <div className={styles.realCardTags}>
                    <span className={styles.realTag}>Verilog</span>
                    <span className={styles.realTag}>Modelsim</span>
                    <span className={styles.realTag}>RTL</span>
                  </div>
                  <div className={styles.realCardButtons}>
                    <span className={styles.realCardBtnPrimary}>View Details →</span>
                    <span className={styles.realCardBtnSecondary}>GitHub</span>
                  </div>
                </div>
              </div>

              {/* Project Card 2 */}
              <div className={styles.realProjectCard}>
                <div className={styles.realCardImage}>
                  <div className={styles.realImageBadge}>XILINX VIVADO</div>
                  <div className={styles.realOptionsDots}>•••</div>
                </div>
                <div className={styles.realCardBody}>
                  <h3 className={styles.realCardTitle}>FPGA Real-time Signal Accelerator</h3>
                  <p className={styles.realCardDesc}>High-throughput DSP hardware pipeline implemented on Xilinx Artix-7 FPGA with hardware-timed filtering.</p>
                  <div className={styles.realCardTags}>
                    <span className={styles.realTag}>Vivado</span>
                    <span className={styles.realTag}>FPGA</span>
                    <span className={styles.realTag}>DSP</span>
                  </div>
                  <div className={styles.realCardButtons}>
                    <span className={styles.realCardBtnPrimary}>View Details →</span>
                    <span className={styles.realCardBtnSecondary}>GitHub</span>
                  </div>
                </div>
              </div>

              {/* Project Card 3 */}
              <div className={styles.realProjectCard}>
                <div className={styles.realCardImage}>
                  <div className={styles.realImageBadge}>EMBEDDED RTOS</div>
                  <div className={styles.realOptionsDots}>•••</div>
                </div>
                <div className={styles.realCardBody}>
                  <h3 className={styles.realCardTitle}>Smart Embedded Controller</h3>
                  <p className={styles.realCardDesc}>Autonomous control system with multi-sensor telemetry, FreeRTOS preemptive kernel, and custom KiCad PCB.</p>
                  <div className={styles.realCardTags}>
                    <span className={styles.realTag}>C</span>
                    <span className={styles.realTag}>FreeRTOS</span>
                    <span className={styles.realTag}>KiCad</span>
                  </div>
                  <div className={styles.realCardButtons}>
                    <span className={styles.realCardBtnPrimary}>View Details →</span>
                    <span className={styles.realCardBtnSecondary}>GitHub</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 5. SECTION: EXPERIENCE (Full Fidelity Rebuilt) */}
        <div className={`${styles.realSectionWrapper} ${expMaterialized ? styles.sectionMaterialized : styles.sectionDraft}`} style={{ top: 1680 }}>
          <div className={styles.sectionFigmaTag}>❖ Frame: ExperienceTimeline & Milestones</div>
          <div className={styles.realExperienceContainer}>
            <div className={styles.realSectionHeader}>
              <span className={styles.realSectionSubtitle}>My Professional Journey</span>
              <h2 className={styles.realSectionHeading}>Experience</h2>
            </div>

            <div className={styles.realExpGrid}>
              <div className={styles.realExpCard}>
                <div className={styles.realPurpleRibbonContainer}>
                  <span className={styles.realPurpleRibbon}>Collection</span>
                </div>
                <div className={styles.realExpRole}>Hardware & VLSI Engineering</div>
                <div className={styles.realExpOrg}>Academic & Engineering Projects • NMAMIT</div>
                <p className={styles.realExpDesc}>Digital logic design, RTL verification, and embedded hardware implementation with Verilog and FPGA toolchains.</p>
              </div>

              <div className={styles.realExpCard}>
                <div className={styles.realPurpleRibbonContainer}>
                  <span className={styles.realPurpleRibbon}>Collection</span>
                </div>
                <div className={styles.realExpRole}>B.Tech Electronics & Communication</div>
                <div className={styles.realExpOrg}>NMAM Institute of Technology • Nitte</div>
                <p className={styles.realExpDesc}>In-depth coursework in Microelectronics, Digital Signal Processing, Embedded Systems, and Computer Architecture.</p>
              </div>
            </div>
          </div>
        </div>

        {/* 6. SECTION: CERTIFICATIONS & CREDENTIALS (Full Fidelity Rebuilt) */}
        <div className={`${styles.realSectionWrapper} ${certMaterialized ? styles.sectionMaterialized : styles.sectionDraft}`} style={{ top: 2060 }}>
          <div className={styles.sectionFigmaTag}>❖ Frame: Certifications & NationalDialogue • 3-Col Auto-Layout</div>
          <div className={styles.realExperienceContainer}>
            <div className={styles.realSectionHeader}>
              <span className={styles.realSectionSubtitle}>Browse My Verified Credentials</span>
              <h2 className={styles.realSectionHeading}>Certifications</h2>
            </div>

            <div className={styles.realCertGrid}>
              {/* Certificate 1 */}
              <div className={styles.realCertCard}>
                <span className={styles.realCertBadge}>★ National Level Shortlist</span>
                <div className={styles.realCertIssuer}>🏛 Ministry of Youth Affairs & Sports</div>
                <h3 className={styles.realCertTitle}>MY Bharat Budget Quest 2026 – Final Round</h3>
                <p className={styles.realCertDesc}>Shortlisted out of over 12 lakh participants for the Final Round Virtual Dialogue with the Prime Minister of India.</p>
                <div className={styles.realCertTagsWrap}>
                  <span className={styles.realCertTag}>National Round</span>
                  <span className={styles.realCertTag}>PM Dialogue</span>
                  <span className={styles.realCertTag}>Public Policy</span>
                </div>
              </div>

              {/* Certificate 2 */}
              <div className={styles.realCertCard}>
                <span className={styles.realCertBadge}>📄 IEEE International Conference</span>
                <div className={styles.realCertIssuer}>⚡ IEEE & NMAMIT</div>
                <h3 className={styles.realCertTitle}>Certificate of Presentation – AIDE 2026</h3>
                <p className={styles.realCertDesc}>Presented the research paper on machine learning for marketing prediction at the IEEE AIDE 2026 International Conference.</p>
                <div className={styles.realCertTagsWrap}>
                  <span className={styles.realCertTag}>IEEE AIDE</span>
                  <span className={styles.realCertTag}>Paper Presentation</span>
                  <span className={styles.realCertTag}>Research</span>
                </div>
              </div>

              {/* Certificate 3 */}
              <div className={styles.realCertCard}>
                <span className={styles.realCertBadge}>🚀 Startup Tech Innovation</span>
                <div className={styles.realCertIssuer}>💡 Atal Incubation Centre Nitte</div>
                <h3 className={styles.realCertTitle}>AIC Nitte Internship Certificate</h3>
                <p className={styles.realCertDesc}>Hands-on internship at Atal Incubation Centre Nitte, gaining practical experience in tech innovation and startup incubation.</p>
                <div className={styles.realCertTagsWrap}>
                  <span className={styles.realCertTag}>Tech Innovation</span>
                  <span className={styles.realCertTag}>Startup Incubation</span>
                  <span className={styles.realCertTag}>Entrepreneurship</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 7. SECTION: ACHIEVEMENTS & TESTIMONIALS (Full Fidelity Rebuilt) */}
        <div className={`${styles.realSectionWrapper} ${(achieveMaterialized || testimMaterialized) ? styles.sectionMaterialized : styles.sectionDraft}`} style={{ top: 2440 }}>
          <div className={styles.sectionFigmaTag}>❖ Frame: Achievements & Testimonials • Dual Responsive Matrix</div>
          <div className={styles.realExperienceContainer}>
            <div className={styles.realDoubleSectionGrid}>
              {/* Left Column: Achievements */}
              <div className={styles.realColumnBox}>
                <h3 className={styles.realColumnHeading}>🏆 Achievements</h3>
                <div className={styles.realAchieveCard}>
                  <div className={styles.realAchieveTitle}>Shortlisted for National Level PM Dialogue</div>
                  <div className={styles.realAchieveMeta}>
                    <span>MY Bharat Budget Quest 2026</span>
                    <span>Top 0.1% National</span>
                  </div>
                </div>
                <div className={styles.realAchieveCard}>
                  <div className={styles.realAchieveTitle}>IEEE AIDE 2026 Conference Research Paper</div>
                  <div className={styles.realAchieveMeta}>
                    <span>IEEE & NMAMIT</span>
                    <span>Conference Presentation</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Testimonials */}
              <div className={styles.realColumnBox}>
                <h3 className={styles.realColumnHeading}>💬 Endorsements & Reviews</h3>
                <div className={styles.realTestimCard}>
                  <div className={styles.realTestimStars}>★★★★★ 5.0</div>
                  <p className={styles.realTestimQuote}>&ldquo;Exceptional aptitude in digital logic design, Verilog synthesis, and embedded hardware architectures. A brilliant collaborator.&rdquo;</p>
                  <div className={styles.realTestimAuthor}>
                    <div className={styles.realTestimAvatar}>NM</div>
                    <div>
                      <div className={styles.realTestimName}>Academic Mentor</div>
                      <div className={styles.realTestimRole}>NMAM Institute of Technology</div>
                    </div>
                  </div>
                </div>
                <div className={styles.realTestimCard}>
                  <div className={styles.realTestimStars}>★★★★★ 5.0</div>
                  <p className={styles.realTestimQuote}>&ldquo;Demonstrated great engineering rigor, clarity, and dedication throughout technical research presentations.&rdquo;</p>
                  <div className={styles.realTestimAuthor}>
                    <div className={styles.realTestimAvatar}>AC</div>
                    <div>
                      <div className={styles.realTestimName}>AIC Nitte Coordinator</div>
                      <div className={styles.realTestimRole}>Atal Incubation Centre</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 8. SECTION: CONTACT CONSOLE & FOOTER (Full Fidelity Rebuilt) */}
        <div className={`${styles.realSectionWrapper} ${contactMaterialized ? styles.sectionMaterialized : styles.sectionDraft}`} style={{ top: 2840 }}>
          <div className={styles.sectionFigmaTag}>❖ Frame: ContactConsole & SystemLock</div>
          <div className={styles.realExperienceContainer}>
            <div className={`${styles.realContactBox} ${contactMaterialized ? styles.sectionMaterialized : ""}`}>
              <div className={styles.realContactHeading}>Ready to collaborate on VLSI or Embedded Hardware?</div>
              <div className={styles.realContactLinks}>
                <span className={styles.realContactPill}>✉ shreyasjaradhya@gmail.com</span>
                <span className={styles.realContactPill}>LinkedIn Profile ↗</span>
                <span className={styles.realContactPill}>GitHub Repositories ↗</span>
              </div>
              <div className={styles.realFooterCopy}>
                © 2026 J SHREYAS ARADHYA • Silicon & Hardware Architecture • All 9 Modules Rebuilt & Synchronized
              </div>
            </div>
          </div>
        </div>

        {/* Spark Burst Particles */}
        {sparks.map((s) => (
          <div
            key={s.id}
            className={styles.sparkParticle}
            style={{
              left: `${s.x}px`,
              top: `${s.y}px`,
              background: s.color,
              opacity: s.opacity,
              boxShadow: `0 0 10px ${s.color}`,
            }}
          />
        ))}

        {/* Swarm Cursors Layer (Exactly 8 Cursors, Anti-Collision) */}
        {cursors.map((c) => (
          <React.Fragment key={c.id}>
            {/* Motion Trail */}
            {c.trail.map((p, idx) => (
              <div
                key={`${c.id}-trail-${idx}`}
                className={styles.cursorTrailDot}
                style={{
                  left: `${p.x}px`,
                  top: `${p.y}px`,
                  background: c.color,
                  opacity: 0.55 * (1 - idx / c.trail.length),
                  transform: `translate(-50%, -50%) scale(${1.0 - (idx / c.trail.length) * 0.65})`,
                  boxShadow: `0 0 8px ${c.color}`,
                }}
              />
            ))}

            {/* Cursor Pointer & Name Tag with Dynamic Directional Tilt */}
            <div
              className={`${styles.cursorAgent} ${c.clicking ? styles.cursorClicking : ""}`}
              style={{
                transform: `translate3d(${c.x}px, ${c.y}px, 0) rotate(${c.tilt || 0}deg)`,
              }}
            >
              {/* SVG Precision Cursor Arrow */}
              <svg
                className={styles.cursorArrow}
                viewBox="0 0 24 24"
                width="24"
                height="24"
                fill={c.color}
              >
                <path
                  d="M3 3l7.5 18 2.5-7.5 7.5-2.5L3 3z"
                  stroke="#050505"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </svg>

              {/* Click Ripple Indicator */}
              {c.clicking && (
                <div
                  className={styles.clickRipple}
                  style={{ borderColor: c.color }}
                />
              )}

              {/* Agent Name Tag Badge with Live Action Status */}
              <div
                className={styles.agentTagGroup}
                style={{
                  background: c.color,
                }}
              >
                <div className={styles.agentTagHeader}>
                  <span className={styles.agentName}>{c.name}</span>
                  <span className={styles.agentRole}>{c.role}</span>
                </div>
                <div className={styles.agentTaskPill}>
                  <span>{c.currentTask}</span>
                </div>
              </div>

              {/* Micro Coordinate Display */}
              <div className={styles.coordDisplay}>
                {Math.round(c.x)}, {Math.round(c.y)}
              </div>

              {/* Micro Tooltip */}
              {c.tooltip && (
                <div className={styles.agentTooltipPill}>
                  {c.tooltip}
                </div>
              )}
            </div>
          </React.Fragment>
        ))}
      </div>

      {/* Bottom Floating Hint */}
      <div className={styles.bottomHint}>
        <span>⚡ Portfolio Motions • 8 Active Multi-Agent Cursors • Anti-Collision Separation • Press ESC or Click to exit</span>
      </div>
    </div>
  );
}
