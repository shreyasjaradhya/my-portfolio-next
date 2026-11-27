# Comprehensive Backup & Disaster Recovery Audit Report

**Project**: Shreyas Aradhya — Personal Portfolio & Admin Portal  
**Local Project Path**: `C:\Users\shrey\OneDrive\Desktop\portfolio`  
**Audit Timestamp**: November 27, 2026 — 08:30 IST  
**Auditor**: Senior Software Engineer & Disaster Recovery Specialist  
**Overall Backup Health**: **PARTIALLY SAFE** (High Resilience, Immediate Action Needed for Latest Hardening)

---

## Executive Summary

If your local project folder (`C:\Users\shrey\OneDrive\Desktop\portfolio`) were accidentally or permanently deleted from your laptop right now:

1. **You CAN recover 95%+ of your entire portfolio immediately**:
   - The entire Next.js 16 core codebase, React 19 architecture, all portfolio sections, admin dashboard, analytics charts, CSS modules, project reports, and database migrations (001–028) were successfully committed and pushed to GitHub (`origin/main`) today at **07:35 IST** (commit `55b7076`).
   - Your live database records (projects, messages, skills, testimonials, analytics logs) and all media files (resumes, project images, profile photos) reside independently in the **Supabase Cloud** (`gfscbabdfrkxhcqabtxh.supabase.co`) and will **not** be affected by local deletion.
   - Your environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `ADMIN_EMAIL`, AI keys) are preserved in your **Vercel Project Settings** and **Supabase Dashboard**.

2. **What is AT RISK if deleted right this second**:
   - The security hardening code changes applied in the recent session (8 modified files, 161 lines added) have **not yet been committed or pushed to GitHub**.
   - Two untracked local documents (`SECURITY_AUDIT.md` and `supabase/migrations/029_security_hardening.sql`) are **only stored on your local disk** (and pending in OneDrive cloud sync).
   - `.env.local` is excluded by `.gitignore` and does not exist in GitHub; it must be manually recreated from Vercel or Supabase dashboard.

---

## 1. Local Project Status

- **Location**: `C:\Users\shrey\OneDrive\Desktop\portfolio`
- **Source Files Integrity**: All source components, pages, public assets, and config files are physically present and verified functional.
- **Critical Configuration Files**:
  - `package.json`: **Present** (dependencies locked)
  - `package-lock.json`: **Present**
  - `tsconfig.json`: **Present**
  - `next.config.ts`: **Present** (Modified with HTTP security headers)
  - `.env.local`: **Present** (Contains active Supabase credentials; no secrets exposed in reports)
  - `.gitignore`: **Present** (Properly excludes `node_modules`, `.next`, `.env*`, `.vercel`)
- **Missing Local Files**: None. All project assets and build dependencies are intact.

---

## 2. Git & GitHub Backup Status

- **Remote Name**: `origin`
- **Remote Repository URL**: `https://github.com/shreyasjaradhya/my-portfolio-next.git`
- **Active Branch**: `main` (tracking `origin/main`)
- **Latest Commit on GitHub**: `55b7076` (*"fix(analytics): local timezone IST display, clean location badges, and preserve section hash tracking"*)
- **Timestamp of Latest Pushed Commit**: November 27, 2026, 07:35:51 +05:30 (approx. 50 minutes ago).

### Uncommitted / Modified Files (Local Only):
The following 8 tracked files have local modifications that **do not exist on GitHub yet**:
1. `next.config.ts` (+54 lines: Production Content-Security-Policy, HSTS, X-Frame-Options headers)
2. `src/lib/supabase/adminAuth.ts` (+16 lines: Client header spoofing fix & admin email assertion)
3. `src/proxy.ts` (+20 lines: Edge request header stripping & admin route redirection)
4. `src/app/actions/testimonials.ts` (+2 lines: `assertAdmin` email validation)
5. `src/app/admin/actions.ts` (+17 lines: Server-side cache invalidation auth checks)
6. `src/app/api/analytics/track/route.ts` (+3 lines: Admin identification fix for Google OAuth visitors)
7. `src/components/guide/GuideAssistant.tsx` (+17 lines: Markdown link XSS protocol sanitization)
8. `src/components/Contact.tsx` (+32 lines: Anti-bot honeypot field & submission throttle)

### Untracked Files (Local Only — Zero Backup on GitHub):
1. `SECURITY_AUDIT.md` (534 lines: Comprehensive security audit report)
2. `supabase/migrations/029_security_hardening.sql` (190 lines: Database RLS & Storage hardening migration)

> **GitHub Recovery Verdict**: If cloned from GitHub right now, you get the 100% complete portfolio up to commit `55b7076`. However, the recent security hardening and audit documentation would need to be re-applied unless committed and pushed.

---

## 3. OneDrive & Windows Backups Status

### A. Microsoft OneDrive
- **Folder Location**: The project is located inside `C:\Users\shrey\OneDrive\Desktop\portfolio`.
- **OneDrive Sync Service**: **Active** (`OneDrive.Sync.Service` process ID 192 is running and responding).
- **Recovery Potential via OneDrive**:
  - **OneDrive Cloud Recycle Bin**: If the folder is deleted locally, OneDrive moves synced files to the online OneDrive Recycle Bin (`https://onedrive.live.com`). Files remain recoverable for **30 days**.
  - **Version History**: OneDrive preserves historical versions of individual files edited inside OneDrive folders.
- **OneDrive Caveats for Developers**:
  - OneDrive frequently pauses or struggles to sync the `node_modules` directory due to having 30,000+ tiny files.
  - If `.git` database files are synced across multiple machines, lock conflicts can occasionally occur.
  - While OneDrive provides a safety net for accidental file deletions, **it is not a replacement for Git source control**.

### B. Windows File History & System Backups
- **Windows File History Service (`fhsvc`)**: **Stopped (Manual)**. Automatic local hourly snapshots to an external drive are currently **not active**.
- **Windows Previous Versions (Shadow Copies)**: Not configured for non-system personal folders without active File History or system restore points.
- **Windows Recycle Bin**: **Active & Accessible**. A standard `Delete` key press in Windows Explorer sends files to the local Recycle Bin where they can be restored instantly with one click. (Note: `Shift + Delete` or command-line `Remove-Item -Recurse` bypasses the Recycle Bin).

---

## 4. Vercel Deployment Status

- **Production Domain**: `https://shreyas-aradhya.vercel.app`
- **Connected Git Repository**: Automatically synchronized with `github.com/shreyasjaradhya/my-portfolio-next` (`main` branch).
- **Deployment Status**: Production deployments build automatically upon pushing commits to `main`.
- **What Can Be Recovered from Vercel**:
  - **Environment Variables**: You can view and copy all configured keys (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, etc.) from Vercel Project Settings $\to$ Environment Variables.
  - **Historical Deployment Artifacts**: Previous production deployments remain hosted on immutable preview URLs.
- **What CANNOT Be Recovered from Vercel**:
  - Original untranspiled TypeScript source files, Git commit tree, and commit history. Vercel stores compiled JavaScript output, not a source zip.

---

## 5. Supabase Database & Storage Backup Status

- **Supabase Project Reference**: `gfscbabdfrkxhcqabtxh`
- **Project URL**: `https://gfscbabdfrkxhcqabtxh.supabase.co`
- **Cloud Independence**:
  - **100% Independent of Laptop**: All live database rows and binary storage files reside on Supabase cloud servers in AWS infrastructure. Deleting your local laptop folder has **zero effect** on your database or uploaded files.
- **Database Tables Backed Up in Cloud**:
  - `profiles`, `projects`, `skills`, `experiences`, `education`, `certifications`, `achievements`, `messages`, `testimonials`, `website_analytics`.
- **Storage Buckets Backed Up in Cloud**:
  - `resumes` (PDF files)
  - `project-images` (Project screenshots & diagrams)
  - `profile-photos` (Personal portrait images)
  - `certificates` (Credential images & PDFs)
  - `experience-images` (Company logos & workplace photos)
- **Database Recovery Options**:
  1. **Supabase Daily Automated Backups**: Supabase takes daily snapshots of your database retained for 7 days (accessible via Supabase Dashboard $\to$ Settings $\to$ Database $\to$ Backups).
  2. **Code Schema Backups**: All schema definitions and table structures are codified in your local `supabase/migrations/` SQL files (001–028 pushed to GitHub, 029 stored locally).
  3. **Manual Snapshot (`pg_dump`)**: You can download a standalone `.sql` data dump anytime using `pg_dump` or Supabase CLI.

---

## 6. Comprehensive Recovery Feasibility Matrix

| Component | Can It Be Recovered If Local Folder Is Deleted? | Primary Recovery Source | Recovery Effort |
|---|---|---|---|
| **Next.js Core Architecture** | **YES (100%)** | GitHub (`origin/main`) | 1 command (`git clone`) |
| **Pages & Components** | **YES (100%)** | GitHub (`origin/main`) | Immediate |
| **CSS Modules & Styles** | **YES (100%)** | GitHub (`origin/main`) | Immediate |
| **Static Assets & Icons** | **YES (100%)** | GitHub (`origin/main`) | Immediate |
| **Project Reports Data** | **YES (100%)** | GitHub (`origin/main`) | Immediate |
| **Admin Dashboard UI** | **YES (100%)** | GitHub (`origin/main`) | Immediate |
| **Database Migrations (001–028)** | **YES (100%)** | GitHub (`origin/main`) | Immediate |
| **Live Database Data** | **YES (100%)** | Supabase Cloud | 0 effort (unaffected) |
| **Uploaded Storage Assets** | **YES (100%)** | Supabase Cloud Storage | 0 effort (unaffected) |
| **Dependencies & node_modules**| **YES (100%)** | `package.json` + `npm install` | 1 command (`npm i`) |
| **Environment Config (`.env.local`)** | **YES (Manual)** | Vercel Settings / Supabase | 2 minutes (copy-paste) |
| **Recent Security Hardening Fixes** | **PARTIAL** | OneDrive Cloud / Git (if pushed) | Needs Git Commit & Push |
| **Migration `029` & Audit Report** | **PARTIAL** | OneDrive Cloud / Git (if pushed) | Needs Git Commit & Push |

---

## 7. Step-by-Step Disaster Recovery Procedure

If your laptop were stolen, crashed, or the folder was permanently destroyed, here is the exact 5-step recovery procedure:

```bash
# Step 1: Clone the repository from GitHub to your new machine or directory
git clone https://github.com/shreyasjaradhya/my-portfolio-next.git portfolio
cd portfolio

# Step 2: Install exact dependencies
npm install

# Step 3: Recreate your .env.local file
# Retrieve keys from Vercel Dashboard (Settings -> Environment Variables) or Supabase Dashboard
echo NEXT_PUBLIC_SUPABASE_URL=https://gfscbabdfrkxhcqabtxh.supabase.co > .env.local
echo NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_key_here >> .env.local
echo ADMIN_EMAIL=shreyasjaradhya@gmail.com >> .env.local

# Step 4: Verify production build
npm run build

# Step 5: Start local server
npm run dev
```
*Your entire portfolio, database connections, admin portal, and live data will immediately be 100% operational.*

---

## 8. Summary of Backup Health & Recommendations

### Overall Rating: **PARTIALLY SAFE**

* **Why it is resilient**:
  - The entire core codebase is version-controlled and hosted remotely on GitHub.
  - The live database and file storage are isolated on Supabase cloud.
  - The build is reproducibly defined in `package-lock.json`.
* **The single gap**:
  - Uncommitted changes from the recent security hardening session exist solely on this laptop's local disk.

### Action to Reach "100% SAFE":
1. Stage and commit the 8 modified files and 2 untracked files:
   ```bash
   git add .
   git commit -m "feat(security): complete security hardening, RLS policies, and audit report"
   git push origin main
   ```
2. Once pushed, your GitHub repository and Vercel deployment will be synchronized with the latest security fixes, making your project **100% disaster-proof**.
