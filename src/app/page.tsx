import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Skills from "@/components/Skills";
import Projects from "@/components/Projects";
import Experience from "@/components/Experience";
import Certifications from "@/components/Certifications";
import Achievements from "@/components/Achievements";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import { createPublicClient } from "@/lib/supabase/server";

import { 
  getProfile, 
  getProjects, 
  getSkills, 
  getExperiences, 
  getEducation, 
  getCertifications, 
  getAchievements 
} from "@/lib/supabase/queries";

export const revalidate = 60; // optionally revalidate every 60 seconds

export default async function Home() {
  const supabase = createPublicClient();

  const [
    profileRes,
    projectsRes,
    skillsRes,
    experiencesRes,
    educationRes,
    certificationsRes,
    achievementsRes
  ] = await Promise.all([
    getProfile(supabase),
    getProjects(supabase),
    getSkills(supabase),
    getExperiences(supabase),
    getEducation(supabase),
    getCertifications(supabase),
    getAchievements(supabase)
  ]);


  return (
    <>
      <Navbar profile={profileRes.data} />
      <main>
        <Hero profile={profileRes.data} />
        <About profile={profileRes.data} education={educationRes.data || []} />
        <Skills skills={skillsRes.data || []} />
        <Projects projects={projectsRes.data || []} />
        <Experience experiences={experiencesRes.data || []} />
        <Certifications certifications={certificationsRes.data || []} />
        <Achievements achievements={achievementsRes.data || []} />
        <Contact profile={profileRes.data} />
      </main>
      <Footer profile={profileRes.data} />
    </>
  );
}
