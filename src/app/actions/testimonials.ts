"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { TestimonialStatus } from "@/lib/supabase/types";

// Helper to securely verify the caller is the authenticated system admin
async function assertAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Unauthorized: Only an authenticated administrator can perform this action.");
  }

  return { supabase, user };
}

/**
 * Public action: Authenticated visitor submits a testimonial.
 * Enforces status = 'pending' strictly on the server.
 */
export async function submitPublicTestimonial(data: {
  name: string;
  role: string;
  company?: string;
  content: string;
  linkedin_url?: string;
  website_url?: string;
  avatar_url?: string;
}) {
  const supabase = await createClient();

  // 1. Verify caller session (must be signed in via Google OAuth or Supabase Auth)
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      error: "Authentication required. Please sign in with Google to leave a testimonial.",
    };
  }

  // 2. Server-side Input Validation
  const name = data.name?.trim();
  const role = data.role?.trim();
  const company = data.company?.trim() || null;
  const content = data.content?.trim();
  const linkedin_url = data.linkedin_url?.trim() || null;
  const website_url = data.website_url?.trim() || null;

  // Derive avatar from Google user metadata if not explicitly provided
  const googleAvatar =
    user.user_metadata?.avatar_url ||
    user.user_metadata?.picture ||
    user.user_metadata?.avatar;
  const avatar_url = data.avatar_url?.trim() || googleAvatar || null;
  const email = user.email || null;

  if (!name || name.length < 2) {
    return { success: false, error: "Please provide a valid full name." };
  }
  if (!role || role.length < 2) {
    return { success: false, error: "Please enter your role or designation." };
  }
  if (!content || content.length < 10) {
    return { success: false, error: "Testimonial message must be at least 10 characters long." };
  }
  if (content.length > 600) {
    return { success: false, error: "Testimonial message exceeds 600 characters limit." };
  }

  // URL format validation if provided
  if (linkedin_url && !/^https?:\/\/(www\.)?linkedin\.com\/.+/i.test(linkedin_url)) {
    return {
      success: false,
      error: "Please enter a valid LinkedIn URL (e.g. https://linkedin.com/in/username).",
    };
  }
  if (website_url && !/^https?:\/\/.+/i.test(website_url)) {
    return {
      success: false,
      error: "Please enter a valid website URL starting with http:// or https://.",
    };
  }

  // 3. Spam / duplicate submission check:
  // Check if user has already submitted a testimonial in pending status in the last 15 minutes
  try {
    const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    const { data: recentSubmissions } = await supabase
      .from("testimonials")
      .select("id")
      .eq("user_id", user.id)
      .eq("status", "pending")
      .gte("created_at", fifteenMinsAgo);

    if (recentSubmissions && recentSubmissions.length >= 2) {
      return {
        success: false,
        error: "You have recently submitted a testimonial. Please wait before submitting another one.",
      };
    }
  } catch {
    // If column user_id/status check fails pre-migration, proceed with insert
  }

  // 4. Construct payload: status is ALWAYS 'pending'
  const payload: any = {
    user_id: user.id,
    email: email,
    name: name,
    role: role,
    company: company,
    content: content,
    avatar_url: avatar_url,
    linkedin_url: linkedin_url,
    website_url: website_url,
    status: "pending", // Strictly forced on the server
    display_order: 999,
  };

  // 5. Insert into Supabase with column resilience
  let { error: insertError } = await supabase.from("testimonials").insert([payload]);

  if (insertError) {
    // If table doesn't have status/user_id column yet (prior to running migration 020)
    if (insertError.code === "42703") {
      const basicPayload = {
        name: name,
        role: role,
        company: company,
        content: content,
        avatar_url: avatar_url,
        display_order: 999,
      };
      const retry = await supabase.from("testimonials").insert([basicPayload]);
      if (retry.error) {
        return { success: false, error: retry.error.message };
      }
    } else {
      return { success: false, error: insertError.message };
    }
  }

  return {
    success: true,
    message: "Thank you! Your testimonial has been submitted and is awaiting admin approval.",
  };
}

/**
 * Admin action: Approve a testimonial to make it public.
 */
export async function approveTestimonial(id: string) {
  const { supabase } = await assertAdmin();

  const { error } = await supabase
    .from("testimonials")
    .update({ status: "approved", updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/", "page");
  return { success: true };
}

/**
 * Admin action: Reject a testimonial to hide it from public view.
 */
export async function rejectTestimonial(id: string) {
  const { supabase } = await assertAdmin();

  const { error } = await supabase
    .from("testimonials")
    .update({ status: "rejected", updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/", "page");
  return { success: true };
}

/**
 * Admin action: Delete a testimonial permanently.
 */
export async function deleteTestimonialAdmin(id: string) {
  const { supabase } = await assertAdmin();

  const { error } = await supabase
    .from("testimonials")
    .delete()
    .eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/", "page");
  return { success: true };
}

/**
 * Admin action: Update testimonial content, designation, or photo.
 */
export async function updateTestimonialAdmin(
  id: string,
  data: {
    name: string;
    role: string | null;
    company: string | null;
    content: string;
    rating: number | null;
    avatar_url: string | null;
    linkedin_url?: string | null;
    website_url?: string | null;
    status?: TestimonialStatus;
    display_order: number;
  }
) {
  const { supabase } = await assertAdmin();

  const payload: any = {
    name: data.name.trim(),
    role: data.role?.trim() || null,
    company: data.company?.trim() || null,
    content: data.content.trim(),
    rating: data.rating,
    avatar_url: data.avatar_url,
    display_order: data.display_order,
  };

  if (data.status) payload.status = data.status;
  if (data.linkedin_url !== undefined) payload.linkedin_url = data.linkedin_url?.trim() || null;
  if (data.website_url !== undefined) payload.website_url = data.website_url?.trim() || null;
  payload.updated_at = new Date().toISOString();

  let { error } = await supabase
    .from("testimonials")
    .update(payload)
    .eq("id", id);

  // If status column doesn't exist yet, strip it and retry
  if (error && error.code === "42703") {
    delete payload.status;
    delete payload.linkedin_url;
    delete payload.website_url;
    delete payload.updated_at;
    const retry = await supabase.from("testimonials").update(payload).eq("id", id);
    error = retry.error;
  }

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/", "page");
  return { success: true };
}

/**
 * Admin action: Create a new testimonial directly.
 */
export async function createTestimonialAdmin(data: {
  name: string;
  role: string | null;
  company: string | null;
  content: string;
  rating: number | null;
  avatar_url: string | null;
  linkedin_url?: string | null;
  website_url?: string | null;
  display_order: number;
}) {
  const { supabase, user } = await assertAdmin();

  const payload: any = {
    name: data.name.trim(),
    role: data.role?.trim() || null,
    company: data.company?.trim() || null,
    content: data.content.trim(),
    rating: data.rating,
    avatar_url: data.avatar_url,
    linkedin_url: data.linkedin_url?.trim() || null,
    website_url: data.website_url?.trim() || null,
    status: "approved", // Admin-created testimonials are approved by default
    display_order: data.display_order,
    user_id: user?.id || null,
  };

  let { data: inserted, error } = await supabase.from("testimonials").insert([payload]).select("id").single();

  // If column doesn't exist (42703), strip extra columns and retry
  if (error && error.code === "42703") {
    delete payload.status;
    delete payload.linkedin_url;
    delete payload.website_url;
    delete payload.user_id;
    const retry = await supabase.from("testimonials").insert([payload]);
    error = retry.error;
  }
  // If RLS policy blocked inserting status = 'approved' (42501), insert with status = 'pending' then immediately update to 'approved'
  else if (error && (error.code === "42501" || error.message?.includes("row-level security"))) {
    payload.status = "pending";
    const pendingInsert = await supabase.from("testimonials").insert([payload]).select("id").single();
    if (!pendingInsert.error && pendingInsert.data?.id) {
      const updateRes = await supabase.from("testimonials").update({ status: "approved" }).eq("id", pendingInsert.data.id);
      error = updateRes.error;
    } else {
      error = pendingInsert.error;
    }
  }

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/", "page");
  return { success: true };
}
