import { supabase } from './client';

/**
 * A safe utility to check if the Supabase client can connect.
 * It just makes a simple request (e.g. checking auth session or a public health check).
 */
export async function checkSupabaseConnection(): Promise<boolean> {
  try {
    // A simple, non-intrusive call that doesn't require any specific tables
    // Checking the session doesn't hit the DB directly in a way that requires tables, 
    // but ensures the client is instantiated properly and can reach the auth endpoint.
    const { error } = await supabase.auth.getSession();
    
    if (error) {
      console.error("Supabase connection test failed:", error.message);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error("Supabase connection exception:", err);
    return false;
  }
}
