"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import type { Profile } from "@/lib/supabase/types";
import styles from "./profile.module.css";

export default function ProfileForm({ initialProfile }: { initialProfile: Profile }) {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    name: initialProfile.name || "",
    title: initialProfile.title || "",
    bio: initialProfile.bio || "",
    email: initialProfile.email || "",
    github_url: initialProfile.github_url || "",
    linkedin_url: initialProfile.linkedin_url || "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    // Clear status messages on typing
    setError(null);
    setSuccess(false);
  };

  const validateForm = () => {
    if (!formData.name.trim()) return "Name is required.";
    if (!formData.title.trim()) return "Title is required.";
    if (!formData.bio.trim()) return "Bio is required.";
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      return "Please provide a valid email address.";
    }
    
    if (formData.github_url && !/^https?:\/\/.+/.test(formData.github_url)) {
      return "GitHub URL must be a valid http/https URL.";
    }
    
    if (formData.linkedin_url && !/^https?:\/\/.+/.test(formData.linkedin_url)) {
      return "LinkedIn URL must be a valid http/https URL.";
    }
    
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);

    try {
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          name: formData.name,
          title: formData.title,
          bio: formData.bio,
          email: formData.email || null,
          github_url: formData.github_url || null,
          linkedin_url: formData.linkedin_url || null,
          updated_at: new Date().toISOString()
        })
        .eq("id", initialProfile.id);

      if (updateError) {
        throw new Error(updateError.message);
      }

      setSuccess(true);
      router.refresh(); // Refresh the page to invalidate server cache
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred while saving.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.formCard}>
      <h2 className={styles.sectionTitle}>Edit Profile</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputGroup}>
          <label htmlFor="name" className={styles.label}>Full Name *</label>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            className={styles.input}
            disabled={saving}
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="title" className={styles.label}>Professional Title *</label>
          <input
            id="title"
            name="title"
            type="text"
            value={formData.title}
            onChange={handleChange}
            className={styles.input}
            disabled={saving}
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="bio" className={styles.label}>Biography *</label>
          <textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            className={styles.textarea}
            disabled={saving}
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="email" className={styles.label}>Public Email Address</label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            className={styles.input}
            disabled={saving}
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="github_url" className={styles.label}>GitHub Profile URL</label>
          <input
            id="github_url"
            name="github_url"
            type="url"
            value={formData.github_url}
            onChange={handleChange}
            className={styles.input}
            disabled={saving}
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="linkedin_url" className={styles.label}>LinkedIn Profile URL</label>
          <input
            id="linkedin_url"
            name="linkedin_url"
            type="url"
            value={formData.linkedin_url}
            onChange={handleChange}
            className={styles.input}
            disabled={saving}
          />
        </div>

        {error && <div className={styles.error}>{error}</div>}
        {success && <div className={styles.success}>Profile successfully updated!</div>}

        <div className={styles.buttonGroup}>
          <button type="submit" className={styles.button} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
