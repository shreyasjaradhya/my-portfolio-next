import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ASMRStaticBackground from "@/components/ASMRStaticBackground";
import ProjectReportContent from "@/components/ProjectReportContent";
import { createPublicClient } from "@/lib/supabase/server";
import { getProfile, getProjects } from "@/lib/supabase/queries";
import { getProjectReport, PROJECT_REPORTS } from "@/data/projectReports";
import type { Project } from "@/lib/supabase/types";
import styles from "./page.module.css";

export const revalidate = 60;

async function resolveProjectBySlug(slug: string): Promise<{
  profile: Awaited<ReturnType<typeof getProfile>>["data"];
  project: Project | null;
}> {
  const supabase = createPublicClient();
  const [profileRes, projectsRes] = await Promise.all([
    getProfile(supabase),
    getProjects(supabase),
  ]);

  const dbProjects = projectsRes.data || [];
  let project =
    dbProjects.find((p) => p.slug === slug) || null;

  // Fallback synthetic project entry if visiting a known report slug directly
  if (!project && PROJECT_REPORTS[slug]) {
    const r = PROJECT_REPORTS[slug];
    project = {
      id: r.slug,
      title: slug
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" "),
      slug: r.slug,
      description: r.subtitle,
      detailed_description: null,
      technologies: r.componentsOrStack.map((c) => c.name),
      image_url: null,
      github_url: null,
      live_url: null,
      featured: true,
      display_order: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  return { profile: profileRes.data, project };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { project } = await resolveProjectBySlug(slug);
  if (!project) {
    return { title: "Project Report Not Found" };
  }
  const report = getProjectReport(project);

  return {
    title: `${project.title} | Technical Report — J Shreyas Aradhya`,
    description: report?.subtitle || project.description || undefined,
  };
}

export default async function ProjectReportPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { profile, project } = await resolveProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const report = getProjectReport(project);

  return (
    <>
      <ASMRStaticBackground />
      <Navbar profile={profile} />
      <main className={styles.mainWrapper}>
        <div className={styles.innerContainer}>
          <div className={styles.topBar}>
            <Link href="/#projects" className={styles.backLink}>
              ← Back to Portfolio Projects
            </Link>
          </div>
          <ProjectReportContent project={project} report={report} mode="page" />
        </div>
      </main>
      <Footer profile={profile} />
    </>
  );
}
