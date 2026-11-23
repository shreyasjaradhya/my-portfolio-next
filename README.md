<div align="center">

  <h1>⚡ J Shreyas Aradhya — Official Portfolio</h1>
  <p>
    <strong>High-performance engineering portfolio built with Next.js 16, TypeScript, Supabase & Framer Motion.</strong>
  </p>

  <p>
    <a href="https://nextjs.org"><img src="https://img.shields.io/badge/Next.js-16.3-black?style=flat-square&logo=next.js&logoColor=white" alt="Next.js 16" /></a>
    <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" /></a>
    <a href="https://supabase.com"><img src="https://img.shields.io/badge/Supabase-Database_%26_Auth-3ECF8E?style=flat-square&logo=supabase&logoColor=white" alt="Supabase" /></a>
    <a href="https://framer.com/motion"><img src="https://img.shields.io/badge/Framer_Motion-12.0-0055FF?style=flat-square&logo=framer&logoColor=white" alt="Framer Motion" /></a>
    <a href="https://vercel.com"><img src="https://img.shields.io/badge/Deployed_on-Vercel-000000?style=flat-square&logo=vercel&logoColor=white" alt="Vercel" /></a>
  </p>

</div>

---

## 🌟 Overview

This repository contains the complete production source code for the personal engineering portfolio of **J Shreyas Aradhya**, specializing in **Electronics & Communication Engineering**, **VLSI Design**, **FPGA Systems**, and **Embedded Hardware**.

### Key Architectural Highlights

* 🌌 **3D Perspective Tunnel Hero**: Interactive 3D perspective tunnel with depth parallax, golden angle card distribution, and smooth scroll interpolation.
* 🤖 **Swarm Rebuild Motion Engine**: Autonomous multi-agent animation system featuring 8 concurrent cursor agents, realistic wrist-arc trajectories, elliptical anti-collision potential fields, and Web Audio API synthesized mechanical keystrokes.
* ⚡ **Ultra-Fast Admin Dashboard**: Custom-built CMS with server proxy middleware, instant streaming `<AdminSkeleton>` loaders across all 10 administrative routes, in-memory caching, and 0ms optimistic UI updates.
* 📱 **True Responsive Design**: Fully optimized layouts and collision-free physics for desktop, tablet, and mobile screens.
* 🔒 **Supabase Backend**: Real-time PostgreSQL database with Row Level Security (RLS), authenticated asset storage, and contact message routing.

---

## 🛠 Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | Next.js 16.3 (App Router, Turbopack) |
| **Language** | TypeScript (Strict Mode) |
| **Styling** | Vanilla CSS Modules, CSS Variables (Dark Editorial Theme) |
| **Animations** | Framer Motion & Custom Canvas / Web Audio Synthesis |
| **Backend & DB** | Supabase (PostgreSQL, Storage, Auth, RLS Policies) |
| **Deployment** | Vercel |

---

## 🚀 Getting Started

### Prerequisites

Ensure you have Node.js 18+ installed on your system.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/shreyasjaradhya/my-portfolio-next.git
   cd my-portfolio-next
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

4. **Run Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Build for Production:**
   ```bash
   npm run build
   npm run start
   ```

---

## 📂 Project Structure

```
portfolio/
├── src/
│   ├── app/                    # Next.js 16 App Router pages & admin routes
│   │   ├── admin/              # Instant CMS Admin Panel & 10 managers
│   │   ├── layout.tsx          # Root layout & font configurations
│   │   └── page.tsx            # Home page composition & server data fetching
│   ├── components/             # Production UI components & Swarm Rebuild engine
│   │   ├── SwarmRebuild.tsx    # Multi-agent physics & audio synthesis
│   │   ├── perspective-tunnel/ # 3D perspective tunnel canvas
│   │   └── ...                 # Modular section components (Hero, About, Projects)
│   └── lib/                    # Supabase client, queries, and auth helpers
└── supabase/                   # SQL migrations, RLS security policies, and seed data
```

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
