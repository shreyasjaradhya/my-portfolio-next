import { PROJECT_REPORTS } from "../../data/projectReports";
import { createPublicClient } from "../supabase/server";
import {
  getProfile,
  getProjects,
  getSkills,
  getExperiences,
  getEducation,
  getCertifications,
  getAchievements,
  getTestimonials,
} from "../supabase/queries";

export interface PortfolioKnowledge {
  engineerName: string;
  field: string;
  institution: string;
  bio: string;
  contact: {
    github: string;
    linkedin: string;
    email: string;
  };
  education: Array<{ institution: string; degree: string; field: string; startYear?: string; endYear?: string }>;
  skillsByCategory: Record<string, string[]>;
  experiences: Array<{ title: string; organization: string; description: string }>;
  certifications: Array<{ name: string; issuer?: string; date?: string; description?: string }>;
  achievements: Array<{ title: string; organization?: string; description?: string }>;
  testimonials: Array<{ author_name: string; relationship?: string; content: string }>;
  projects: Array<{
    title: string;
    slug: string;
    category: string;
    technologies: string[];
    description: string;
    abstract: string;
    keySpecs: string[];
    componentsOrStack: Array<{ name: string; purpose: string }>;
    achievements: string[];
    repoUrl?: string;
  }>;
}

export async function buildPortfolioKnowledge(): Promise<PortfolioKnowledge> {
  const supabase = createPublicClient();

  // Retrieve dynamic records from database (with safe fallback)
  const [
    profileRes,
    projectsRes,
    skillsRes,
    experiencesRes,
    educationRes,
    certificationsRes,
    achievementsRes,
    testimonialsRes,
  ] = await Promise.allSettled([
    getProfile(supabase),
    getProjects(supabase),
    getSkills(supabase),
    getExperiences(supabase),
    getEducation(supabase),
    getCertifications(supabase),
    getAchievements(supabase),
    getTestimonials(supabase),
  ]);

  const profile = profileRes.status === "fulfilled" ? profileRes.value.data : null;
  const dbSkills = skillsRes.status === "fulfilled" ? skillsRes.value.data || [] : [];
  const dbExperiences = experiencesRes.status === "fulfilled" ? experiencesRes.value.data || [] : [];
  const dbEducation = educationRes.status === "fulfilled" ? educationRes.value.data || [] : [];
  const dbCertifications = certificationsRes.status === "fulfilled" ? certificationsRes.value.data || [] : [];
  const dbAchievements = achievementsRes.status === "fulfilled" ? achievementsRes.value.data || [] : [];
  const dbTestimonials = testimonialsRes.status === "fulfilled" ? testimonialsRes.value.data || [] : [];

  // Group skills by category
  const skillsByCategory: Record<string, string[]> = {};
  if (dbSkills.length > 0) {
    for (const skill of dbSkills) {
      const cat = skill.category || "General Engineering";
      if (!skillsByCategory[cat]) skillsByCategory[cat] = [];
      skillsByCategory[cat].push(skill.name);
    }
  } else {
    // Verified fallback skill structure
    skillsByCategory["Hardware & VLSI"] = [
      "VLSI Design",
      "FPGA Development",
      "Digital Electronics",
      "Hardware Verification",
      "PCB Design",
      "Verilog HDL / SystemVerilog",
    ];
    skillsByCategory["Programming"] = ["Python", "C", "Java"];
    skillsByCategory["Tools & EDA"] = ["Xilinx Vivado", "MATLAB", "KiCad", "LTspice", "ModelSim / QuestaSim"];
    skillsByCategory["Embedded Systems"] = ["Arduino", "Embedded C/C++", "Sensor Interfacing", "Microcontrollers"];
  }

  // Compile rich project details from PROJECT_REPORTS (1,150 lines of verified engineering specs)
  const compiledProjects = Object.values(PROJECT_REPORTS).map((r) => {
    return {
      title: r.category ? `${r.category}: ${r.slug}` : r.slug,
      slug: r.slug,
      category: r.category,
      technologies: r.componentsOrStack.map((c) => c.name),
      description: r.subtitle,
      abstract: r.abstract,
      keySpecs: r.metadata.map((m) => `${m.label}: ${m.value}`),
      componentsOrStack: r.componentsOrStack,
      achievements: r.achievementsOrOutcomes,
      repoUrl: r.repoUrl,
    };
  });

  return {
    engineerName: profile?.name || "J Shreyas Aradhya",
    field: profile?.title || "Electronics and Communication Engineering",
    institution: "NMAM Institute of Technology (NMAMIT), Nitte",
    bio:
      profile?.bio ||
      "Undergraduate student in Electronics and Communication Engineering at NMAM Institute of Technology with a strong focus on VLSI design, FPGA development, digital logic, synthesizable RTL modeling, and embedded hardware systems.",
    contact: {
      github: profile?.github_url || "https://github.com/shreyasjaradhya",
      linkedin: profile?.linkedin_url || "https://www.linkedin.com/in/shreyas-aradhya-0b9592321",
      email: profile?.email || "shreyasjaradhya@gmail.com",
    },
    education:
      dbEducation.length > 0
        ? dbEducation.map((e) => ({
            institution: e.institution,
            degree: e.degree,
            field: e.field || "Electronics and Communication Engineering",
            startYear: e.start_date ? String(e.start_date) : undefined,
            endYear: e.end_date ? String(e.end_date) : undefined,
          }))
        : [
            {
              institution: "NMAM Institute of Technology (NMAMIT), Nitte",
              degree: "B.Tech",
              field: "Electronics and Communication Engineering",
            },
          ],
    skillsByCategory,
    experiences:
      dbExperiences.length > 0
        ? dbExperiences.map((exp) => ({
            title: exp.title,
            organization: exp.organization || "",
            description: exp.description || "",
          }))
        : [
            {
              title: "Engineering Internship",
              organization: "Manipal",
              description:
                "Engineering internship exploring closed-loop temperature control and predictive regulation for batch chemical reactors.",
            },
          ],
    certifications: dbCertifications.map((c) => ({
      name: c.name,
      issuer: c.issuer || undefined,
      date: c.issue_date || undefined,
      description: c.description || undefined,
    })),
    achievements: dbAchievements.map((a) => ({
      title: a.title,
      description: a.description || undefined,
    })),
    testimonials: dbTestimonials.map((t) => ({
      author_name: t.author_name,
      relationship: t.relationship || undefined,
      content: t.content,
    })),
    projects: compiledProjects,
  };
}

export function formatKnowledgeForPrompt(knowledge: PortfolioKnowledge): string {
  const skillsList = Object.entries(knowledge.skillsByCategory)
    .map(([cat, list]) => `  - **${cat}**: ${list.join(", ")}`)
    .join("\n");

  const projectsList = knowledge.projects
    .map((p, idx) => {
      const components = p.componentsOrStack.map((c) => `${c.name} (${c.purpose})`).join("; ");
      const outcomes = p.achievements.slice(0, 3).map((a) => `    * ${a}`).join("\n");
      return `### Project ${idx + 1}: ${p.slug}
- **Category**: ${p.category}
- **Summary**: ${p.description}
- **Abstract**: ${p.abstract}
- **Key Specifications**: ${p.keySpecs.join(" | ")}
- **Technologies & Components**: ${components}
- **Verified Outcomes**:
${outcomes}
- **GitHub Repository**: ${p.repoUrl || "Available on request"}`;
    })
    .join("\n\n");

  const eduList = knowledge.education
    .map((e) => `- ${e.degree} in ${e.field} from ${e.institution}`)
    .join("\n");

  const expList = knowledge.experiences
    .map((e) => `- **${e.title}** at **${e.organization}**: ${e.description}`)
    .join("\n");

  return `
=== VERIFIED PORTFOLIO KNOWLEDGE BASE ===
**Name**: ${knowledge.engineerName}
**Specialization**: ${knowledge.field}
**Institution**: ${knowledge.institution}
**Contact Links**:
- GitHub: ${knowledge.contact.github}
- LinkedIn: ${knowledge.contact.linkedin}

**Biography**:
${knowledge.bio}

**Educational Background**:
${eduList}

**Technical Skills by Domain**:
${skillsList}

**Work & Internship Experience**:
${expList}

**Featured Engineering Projects**:
${projectsList}
=========================================
`;
}
