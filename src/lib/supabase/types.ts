export interface Profile {
  id: string;
  name: string;
  title: string;
  bio: string | null;
  email: string | null;
  phone: string | null;
  github_url: string | null;
  linkedin_url: string | null;
  resume_url: string | null;
  profile_image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  detailed_description: string | null;
  technologies: string[] | null;
  image_url: string | null;
  github_url: string | null;
  live_url: string | null;
  featured: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface Skill {
  id: string;
  category: string;
  name: string;
  level: string | null;
  display_order: number;
  created_at: string;
}

export interface Experience {
  id: string;
  title: string;
  organization: string;
  location: string | null;
  start_date: string | null;
  end_date: string | null;
  description: string | null;
  technologies: string[] | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string | null;
  start_date: string | null;
  end_date: string | null;
  description: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  issue_date: string | null;
  credential_url: string | null;
  certificate_url: string | null;
  description: string | null;
  display_order: number;
  created_at: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string | null;
  date: string | null;
  url: string | null;
  display_order: number;
  created_at: string;
}

export interface Message {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  status: string;
  created_at: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string | null;
  company: string | null;
  content: string;
  rating: number | null;
  avatar_url: string | null;
  display_order: number;
  created_at: string;
}
