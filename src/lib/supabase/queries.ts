import type { SupabaseClient } from '@supabase/supabase-js';
import type { 
  Profile, 
  Project, 
  Skill, 
  Experience, 
  Education, 
  Certification, 
  Achievement 
} from './types';

/**
 * Helper to handle database responses and catch exceptions securely.
 */
async function fetchFromTable<T>(
  query: PromiseLike<{ data: any[] | null; error: any }>
): Promise<{ data: T[] | null; error: string | null }> {
  try {
    const { data, error } = await query;
    if (error) {
      console.error(`Database query error:`, error.message);
      return { data: null, error: error.message };
    }
    return { data, error: null };
  } catch (err) {
    console.error(`Unexpected database error:`, err);
    return { data: null, error: 'An unexpected error occurred while fetching data.' };
  }
}

export async function getProfile(supabase: SupabaseClient) {
  const query = supabase.from('profiles').select('*').limit(1).single();
  try {
    const { data, error } = await query;
    if (error) {
      console.error(`Database query error (Profile):`, error.message);
      return { data: null, error: error.message };
    }
    return { data: data as Profile, error: null };
  } catch (err) {
    console.error(`Unexpected database error (Profile):`, err);
    return { data: null, error: 'An unexpected error occurred while fetching data.' };
  }
}

export async function getProjects(supabase: SupabaseClient) {
  return fetchFromTable<Project>(
    supabase.from('projects').select('*').order('display_order', { ascending: true })
  );
}

export async function getSkills(supabase: SupabaseClient) {
  return fetchFromTable<Skill>(
    supabase.from('skills').select('*').order('display_order', { ascending: true })
  );
}

export async function getExperiences(supabase: SupabaseClient) {
  return fetchFromTable<Experience>(
    supabase.from('experiences').select('*').order('display_order', { ascending: true })
  );
}

export async function getEducation(supabase: SupabaseClient) {
  return fetchFromTable<Education>(
    supabase.from('education').select('*').order('display_order', { ascending: true })
  );
}

export async function getCertifications(supabase: SupabaseClient) {
  return fetchFromTable<Certification>(
    supabase.from('certifications').select('*').order('display_order', { ascending: true })
  );
}

export async function getAchievements(supabase: SupabaseClient) {
  return fetchFromTable<Achievement>(
    supabase.from('achievements').select('*').order('display_order', { ascending: true })
  );
}
