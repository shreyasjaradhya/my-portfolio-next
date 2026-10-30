import type { SVGProps } from "react";

export type IconProps = SVGProps<SVGSVGElement> & { size?: number };

// ==========================================
// 1. PROGRAMMING LOGOS
// ==========================================

export function PythonLogo({ size = 32, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M63.4 6.7c-29.6 0-27.7 12.8-27.7 12.8l.1 13.2h28.2v4H24.3S7 34.8 7 64.1c0 29.4 15.1 28.3 15.1 28.3h9V79.6s-.5-15.1 14.8-15.1h28.4s14.3-.2 14.3-14.1V20.8S88.6 6.7 63.4 6.7zm-15.4 8.7a4.4 4.4 0 1 1 0 8.8 4.4 4.4 0 0 1 0-8.8z"
        fill="#3776AB"
      />
      <path
        d="M64.6 121.3c29.6 0 27.7-12.8 27.7-12.8l-.1-13.2H64v-4h39.7s17.3 1.9 17.3-27.4c0-29.4-15.1-28.3-15.1-28.3h-9v12.8s.5 15.1-14.8 15.1H63.7s-14.3.2-14.3 14.1v29.6s-3 14.1 22.2 14.1zm15.4-8.7a4.4 4.4 0 1 1 0-8.8 4.4 4.4 0 0 1 0 8.8z"
        fill="#FFD438"
      />
    </svg>
  );
}

export function CLogo({ size = 32, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M115.4 30.7L66.7 2.6c-1.6-.9-3.7-.9-5.3 0L12.6 30.7c-1.6.9-2.6 2.7-2.6 4.6v56.2c0 1.9 1 3.6 2.6 4.6l48.8 28.1c1.6.9 3.7.9 5.3 0l48.8-28.1c1.6-.9 2.6-2.7 2.6-4.6V35.3c0-1.9-1-3.6-2.7-4.6z"
        fill="#00599C"
      />
      <path
        d="M87.7 75.8c-2.3 3.4-5.3 6.1-9 8.2-3.7 2-7.8 3.1-12.3 3.1-5.3 0-10.1-1.3-14.3-3.8-4.2-2.5-7.6-6-10-10.4-2.4-4.4-3.6-9.5-3.6-15.3 0-5.8 1.2-10.9 3.6-15.3 2.4-4.4 5.8-7.9 10-10.4 4.2-2.5 9-3.8 14.3-3.8 4.7 0 9 .9 12.7 2.8 3.8 1.9 6.8 4.6 9 8.1l-10.1 7.2c-1.4-2.1-3.1-3.7-5.2-4.8-2.1-1.1-4.3-1.6-6.7-1.6-3.1 0-5.8.7-8.1 2.2-2.3 1.4-4.2 3.5-5.5 6.1-1.3 2.6-2 5.6-2 8.9 0 3.3.7 6.3 2 8.9 1.3 2.6 3.2 4.6 5.5 6.1 2.3 1.5 5 2.2 8.1 2.2 2.4 0 4.7-.5 6.8-1.6 2.1-1.1 3.8-2.7 5.2-4.9l9.7 7z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

export function JavaLogo({ size = 32, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M48.2 97.4c16.3 1.3 33-1.6 44.8-8.2-12.3 2.6-26.6 2.9-39.6-.5-3.2-.8-5.3-.8-5.2 8.7z"
        fill="#5382A1"
      />
      <path
        d="M41.8 81.3c21.8 1.8 44.6-2.1 60.5-11-16.7 3.4-36 3.9-53.5-.7-4.3-1.1-7-1-7 11.7z"
        fill="#5382A1"
      />
      <path
        d="M74.3 53.6c5.2 6 2.7 11.5-6.8 17.5 13.9-4.2 24.3-11.8 15.6-22-9.6-11.1-17.7-16.5-36-33.1 8 8.6 21 21.6 27.2 37.6z"
        fill="#E76F00"
      />
      <path
        d="M60.2 12.3C71.5 24.6 77 34.6 71 46.1c-4.9 9.4-15 15.6-23.7 24.2-2.8 2.8-5.2 5.9-6.3 9.7 5.6-4.5 11.9-8.4 18.2-12.7 12-8.2 22.9-18.4 18-32.9-4.4-12.9-10.4-22.1-17-32.1z"
        fill="#E76F00"
      />
      <path
        d="M93.3 95.8c-10 7.8-24.1 11.2-36.8 11.3-14.7.1-30.1-4.2-39.7-15.1 0 0-2.3 2.9 2 5.6 10.4 6.7 23.3 8.8 35.5 8.9 14.6.1 30.6-3 40.7-13.6-1.7 2.9-1.7 2.9-1.7 2.9z"
        fill="#5382A1"
      />
      <path
        d="M34.2 113.8c21.2 5.2 46.5 4 66.8-5.1 0 0-3.3 3.6-10.7 5.8-17.6 5.3-37.6 4.7-56.1-.7z"
        fill="#5382A1"
      />
    </svg>
  );
}

// ==========================================
// 2. HARDWARE & DIGITAL DESIGN LOGOS
// ==========================================

export function VerilogLogo({ size = 32, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect width="128" height="128" rx="20" fill="#0C1B2A" />
      <rect x="1.5" y="1.5" width="125" height="125" rx="18.5" stroke="#38BDF8" strokeWidth="3" strokeOpacity="0.4" />
      {/* Waveform signal rails */}
      <path
        d="M20 46h24v-22h28v22h36"
        stroke="#38BDF8"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20 84h36v22h24v-22h28"
        stroke="#34D399"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Bus / clock ticks */}
      <line x1="44" y1="46" x2="44" y2="84" stroke="#38BDF8" strokeWidth="2" strokeDasharray="3 3" opacity="0.6" />
      <line x1="72" y1="46" x2="72" y2="84" stroke="#38BDF8" strokeWidth="2" strokeDasharray="3 3" opacity="0.6" />
      <line x1="96" y1="46" x2="96" y2="84" stroke="#34D399" strokeWidth="2" strokeDasharray="3 3" opacity="0.6" />
      {/* Letter V identifier in center */}
      <path d="M52 56L64 78L76 56" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function VLSILogo({ size = 32, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect width="128" height="128" rx="20" fill="#0F172A" />
      <rect x="1.5" y="1.5" width="125" height="125" rx="18.5" stroke="#818CF8" strokeWidth="3" strokeOpacity="0.4" />
      {/* IC Silicon Chip Package */}
      <rect x="34" y="34" width="60" height="60" rx="10" fill="#1E293B" stroke="#818CF8" strokeWidth="4" />
      {/* Internal Silicon Cores */}
      <rect x="44" y="44" width="18" height="18" rx="3" fill="#38BDF8" fillOpacity="0.8" />
      <rect x="66" y="44" width="18" height="18" rx="3" fill="#818CF8" fillOpacity="0.8" />
      <rect x="44" y="66" width="18" height="18" rx="3" fill="#818CF8" fillOpacity="0.8" />
      <rect x="66" y="66" width="18" height="18" rx="3" fill="#34D399" fillOpacity="0.8" />
      {/* Silicon interconnect bus lines */}
      <path d="M53 62v4M75 62v4M62 53h4M62 75h4" stroke="#FFFFFF" strokeWidth="2" />
      {/* Pin contacts: Top/Bottom/Left/Right */}
      <path
        d="M44 20v14M64 20v14M84 20v14 M44 94v14M64 94v14M84 94v14 M20 44h14M20 64h14M20 84h14 M94 44h14M94 64h14M94 84h14"
        stroke="#94A3B8"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function DigitalElectronicsLogo({ size = 32, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect width="128" height="128" rx="20" fill="#0D1117" />
      <rect x="1.5" y="1.5" width="125" height="125" rx="18.5" stroke="#38BDF8" strokeWidth="3" strokeOpacity="0.3" />
      {/* Logic Gate: NAND Gate */}
      <path d="M22 46h24M22 82h24" stroke="#38BDF8" strokeWidth="5" strokeLinecap="round" />
      {/* Gate body: Flat back, curved front */}
      <path
        d="M46 36v56h18c15.5 0 28-12.5 28-28s-12.5-28-28-28H46z"
        fill="#1E293B"
        stroke="#38BDF8"
        strokeWidth="5"
        strokeLinejoin="round"
      />
      {/* Output Inversion Bubble */}
      <circle cx="98" cy="64" r="6" fill="#0D1117" stroke="#F59E0B" strokeWidth="4" />
      {/* Output Wire */}
      <path d="M104 64h12" stroke="#F59E0B" strokeWidth="5" strokeLinecap="round" />
      {/* Pulse inputs on wires */}
      <circle cx="34" cy="46" r="3" fill="#38BDF8" />
      <circle cx="34" cy="82" r="3" fill="#38BDF8" />
    </svg>
  );
}

export function FPGALogo({ size = 32, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect width="128" height="128" rx="20" fill="#140E26" />
      <rect x="1.5" y="1.5" width="125" height="125" rx="18.5" stroke="#C084FC" strokeWidth="3" strokeOpacity="0.4" />
      {/* FPGA Matrix Grid (3x3 CLBs) */}
      <g stroke="#A855F7" strokeWidth="2" strokeDasharray="2 2" opacity="0.6">
        <line x1="28" y1="48" x2="100" y2="48" />
        <line x1="28" y1="64" x2="100" y2="64" />
        <line x1="28" y1="80" x2="100" y2="80" />
        <line x1="48" y1="28" x2="48" y2="100" />
        <line x1="64" y1="28" x2="64" y2="100" />
        <line x1="80" y1="28" x2="80" y2="100" />
      </g>
      {/* Configurable Logic Blocks (CLB cells) */}
      <rect x="32" y="32" width="16" height="16" rx="3" fill="#A855F7" />
      <rect x="56" y="32" width="16" height="16" rx="3" fill="#6366F1" />
      <rect x="80" y="32" width="16" height="16" rx="3" fill="#A855F7" />
      <rect x="32" y="56" width="16" height="16" rx="3" fill="#6366F1" />
      <rect x="56" y="56" width="16" height="16" rx="3" fill="#C084FC" />
      <rect x="80" y="56" width="16" height="16" rx="3" fill="#6366F1" />
      <rect x="32" y="80" width="16" height="16" rx="3" fill="#A855F7" />
      <rect x="56" y="80" width="16" height="16" rx="3" fill="#6366F1" />
      <rect x="80" y="80" width="16" height="16" rx="3" fill="#A855F7" />
      {/* Matrix interconnect nodes */}
      <circle cx="48" cy="48" r="2.5" fill="#38BDF8" />
      <circle cx="80" cy="48" r="2.5" fill="#38BDF8" />
      <circle cx="48" cy="80" r="2.5" fill="#38BDF8" />
      <circle cx="80" cy="80" r="2.5" fill="#38BDF8" />
    </svg>
  );
}

// ==========================================
// 3. TOOLS & SOFTWARE LOGOS
// ==========================================

export function MatlabLogo({ size = 32, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect width="128" height="128" rx="20" fill="#0D1520" />
      <rect x="1.5" y="1.5" width="125" height="125" rx="18.5" stroke="#EA580C" strokeWidth="3" strokeOpacity="0.3" />
      {/* MATLAB L-Shaped 3D Wave Membrane */}
      <path
        d="M20 92L44 42L68 76L108 30L90 84L60 62L34 98L20 92z"
        fill="url(#matlabGrad)"
        stroke="#E11D48"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M44 42L60 62L68 76M68 76L90 84M60 62L108 30"
        stroke="#FB923C"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <defs>
        <linearGradient id="matlabGrad" x1="20" y1="30" x2="108" y2="98" gradientUnits="userSpaceOnUse">
          <stop stopColor="#E11D48" />
          <stop offset="0.5" stopColor="#F97316" />
          <stop offset="1" stopColor="#0284C7" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function VivadoLogo({ size = 32, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect width="128" height="128" rx="20" fill="#1C0A0A" />
      <rect x="1.5" y="1.5" width="125" height="125" rx="18.5" stroke="#EF4444" strokeWidth="3" strokeOpacity="0.4" />
      {/* Xilinx Red Crystal / Vivado Geometry */}
      <path d="M64 18L104 44V84L64 110L24 84V44L64 18z" fill="#7F1D1D" stroke="#EF4444" strokeWidth="3" />
      {/* Facets */}
      <path d="M64 18L64 110" stroke="#F87171" strokeWidth="2.5" />
      <path d="M24 44L104 84" stroke="#DC2626" strokeWidth="2" />
      <path d="M24 84L104 44" stroke="#DC2626" strokeWidth="2" />
      {/* Inner V prism */}
      <path d="M42 48L64 88L86 48" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function KiCadLogo({ size = 32, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect width="128" height="128" rx="20" fill="#0C1B2E" />
      <rect x="1.5" y="1.5" width="125" height="125" rx="18.5" stroke="#0284C7" strokeWidth="3" strokeOpacity="0.4" />
      {/* KiCad PCB Traces & Blue/Orange Emblem */}
      <path d="M24 32h20l18 18h42" stroke="#38BDF8" strokeWidth="4" strokeLinecap="round" />
      <path d="M24 96h32l18-18h30" stroke="#F59E0B" strokeWidth="4" strokeLinecap="round" />
      <circle cx="24" cy="32" r="5" fill="#38BDF8" />
      <circle cx="104" cy="50" r="5" fill="#38BDF8" />
      <circle cx="24" cy="96" r="5" fill="#F59E0B" />
      <circle cx="104" cy="78" r="5" fill="#F59E0B" />
      {/* Stylized K */}
      <path d="M48 44v40" stroke="#FFFFFF" strokeWidth="8" strokeLinecap="round" />
      <path d="M78 44L48 64l30 20" stroke="#F59E0B" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function LTspiceLogo({ size = 32, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect width="128" height="128" rx="20" fill="#18130B" />
      <rect x="1.5" y="1.5" width="125" height="125" rx="18.5" stroke="#F59E0B" strokeWidth="3" strokeOpacity="0.4" />
      {/* Analog Op-Amp Triangle / Circuit Schematic */}
      <path d="M36 32v64l56-32L36 32z" fill="#292014" stroke="#F59E0B" strokeWidth="5" strokeLinejoin="round" />
      {/* Inputs */}
      <path d="M16 48h20M16 80h20" stroke="#F59E0B" strokeWidth="4" strokeLinecap="round" />
      {/* Inverting & Non-inverting signs */}
      <path d="M42 48h8" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
      <path d="M42 80h8M46 76v8" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
      {/* Output Sine wave */}
      <path d="M92 64h12c4 0 6-6 9-6s5 12 9 12 5-6 6-6" stroke="#38BDF8" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

// ==========================================
// 4. EMBEDDED SYSTEMS LOGOS
// ==========================================

export function ArduinoLogo({ size = 32, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="64" cy="64" r="54" fill="#00979C" />
      <rect x="1.5" y="1.5" width="125" height="125" rx="18.5" stroke="#00979C" strokeWidth="3" strokeOpacity="0.4" />
      {/* Teal Infinity Loops */}
      <path
        d="M44 48c-8.8 0-16 7.2-16 16s7.2 16 16 16c9.3 0 15.6-8.9 20-16-4.4-7.1-10.7-16-20-16zm40 0c-9.3 0-15.6 8.9-20 16 4.4 7.1 10.7 16 20 16 8.8 0 16-7.2 16-16s-7.2-16-16-16z"
        fill="#FFFFFF"
      />
      <path
        d="M44 54c-5.5 0-10 4.5-10 10s4.5 10 10 10c6.7 0 11.5-6.7 15.1-10C55.5 60.7 50.7 54 44 54zm40 0c-6.7 0-11.5 6.7-15.1 10 3.6 3.3 8.4 10 15.1 10 5.5 0 10-4.5 10-10s-4.5-10-10-10z"
        fill="#00979C"
      />
      {/* Minus sign on left loop */}
      <rect x="39" y="62" width="10" height="4" rx="1" fill="#FFFFFF" />
      {/* Plus sign on right loop */}
      <rect x="79" y="62" width="10" height="4" rx="1" fill="#FFFFFF" />
      <rect x="82" y="59" width="4" height="10" rx="1" fill="#FFFFFF" />
    </svg>
  );
}

export function MicrocontrollerLogo({ size = 32, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect width="128" height="128" rx="20" fill="#0C1929" />
      <rect x="1.5" y="1.5" width="125" height="125" rx="18.5" stroke="#38BDF8" strokeWidth="3" strokeOpacity="0.4" />
      {/* DIP/QFP Microcontroller Package */}
      <rect x="36" y="28" width="56" height="72" rx="6" fill="#1E293B" stroke="#38BDF8" strokeWidth="3" />
      {/* Orientation Notch */}
      <path d="M58 28a6 6 0 0 0 12 0" fill="#0C1929" stroke="#38BDF8" strokeWidth="2" />
      {/* Pin 1 dot */}
      <circle cx="46" cy="40" r="3" fill="#38BDF8" />
      {/* Silicon Die Grid */}
      <rect x="48" y="50" width="32" height="34" rx="3" fill="#0F172A" stroke="#64748B" strokeWidth="2" />
      <path d="M54 67h20M64 57v20" stroke="#38BDF8" strokeWidth="2" />
      {/* Left Pins */}
      <path d="M20 40h16M20 54h16M20 68h16M20 82h16" stroke="#94A3B8" strokeWidth="4" strokeLinecap="round" />
      {/* Right Pins */}
      <path d="M92 40h16M92 54h16M92 68h16M92 82h16" stroke="#94A3B8" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

export function PCBDesignLogo({ size = 32, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect width="128" height="128" rx="20" fill="#062817" />
      <rect x="1.5" y="1.5" width="125" height="125" rx="18.5" stroke="#10B981" strokeWidth="3" strokeOpacity="0.4" />
      {/* PCB Copper Routing Traces */}
      <path d="M26 36h30l24 24h24" stroke="#34D399" strokeWidth="4" strokeLinecap="round" />
      <path d="M26 92h20l32-32h26" stroke="#FBBF24" strokeWidth="4" strokeLinecap="round" />
      <path d="M46 64h16l14 14" stroke="#34D399" strokeWidth="3" strokeLinecap="round" />
      {/* Gold Through-hole Pads & Vias */}
      <circle cx="26" cy="36" r="6" fill="#F59E0B" stroke="#FDE68A" strokeWidth="2" />
      <circle cx="26" cy="36" r="2.5" fill="#062817" />
      <circle cx="104" cy="60" r="6" fill="#F59E0B" stroke="#FDE68A" strokeWidth="2" />
      <circle cx="104" cy="60" r="2.5" fill="#062817" />
      <circle cx="26" cy="92" r="6" fill="#F59E0B" stroke="#FDE68A" strokeWidth="2" />
      <circle cx="26" cy="92" r="2.5" fill="#062817" />
      <circle cx="104" cy="92" r="6" fill="#F59E0B" stroke="#FDE68A" strokeWidth="2" />
      <circle cx="104" cy="92" r="2.5" fill="#062817" />
      {/* Surface Mount Pads (SMD) */}
      <rect x="52" y="24" width="8" height="5" rx="1" fill="#FBBF24" />
      <rect x="64" y="24" width="8" height="5" rx="1" fill="#FBBF24" />
    </svg>
  );
}

export function EmbeddedSystemsLogo({ size = 32, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect width="128" height="128" rx="20" fill="#0F172A" />
      <rect x="1.5" y="1.5" width="125" height="125" rx="18.5" stroke="#38BDF8" strokeWidth="3" strokeOpacity="0.4" />
      {/* Embedded SoC Module Board */}
      <rect x="28" y="28" width="72" height="72" rx="10" fill="#1E293B" stroke="#0284C7" strokeWidth="3" />
      {/* Core SoC Chip */}
      <rect x="46" y="46" width="36" height="36" rx="4" fill="#0F172A" stroke="#38BDF8" strokeWidth="2.5" />
      {/* Clock crystal oscillator */}
      <rect x="36" y="36" width="14" height="8" rx="2" fill="#94A3B8" />
      {/* GPIO Pin Header arrays */}
      <g fill="#F59E0B">
        <circle cx="34" cy="88" r="2" />
        <circle cx="42" cy="88" r="2" />
        <circle cx="50" cy="88" r="2" />
        <circle cx="58" cy="88" r="2" />
        <circle cx="66" cy="88" r="2" />
        <circle cx="74" cy="88" r="2" />
        <circle cx="82" cy="88" r="2" />
        <circle cx="90" cy="88" r="2" />
      </g>
      {/* Status LED pulse */}
      <circle cx="86" cy="38" r="3" fill="#10B981" />
      {/* Digital Communication Bus Wave */}
      <path d="M52 64h6l4-8 6 16 4-8h6" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ==========================================
// 5. CATEGORY ICONS
// ==========================================

export function ProgrammingCategoryIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
      <line x1="14" y1="4" x2="10" y2="20" stroke="var(--text-accent)" />
    </svg>
  );
}

export function HardwareCategoryIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <rect x="9" y="9" width="6" height="6" stroke="var(--text-accent)" />
      <path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3" />
    </svg>
  );
}

export function ToolsCategoryIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  );
}

export function EmbeddedCategoryIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <path d="M6 12h.01M10 12h.01M14 12h.01M18 12h.01" stroke="var(--text-accent)" strokeWidth="3" />
      <path d="M6 3v3M10 3v3M14 3v3M18 3v3M6 18v3M10 18v3M14 18v3M18 18v3" />
    </svg>
  );
}
