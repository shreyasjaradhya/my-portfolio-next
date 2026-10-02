"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import type { Profile } from "@/lib/supabase/types";
import styles from "./profile.module.css";
import { revalidateHomepage } from "../actions";

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

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(initialProfile.profile_image_url);

  const [resumeFile, setResumeFile] = useState<File | null>(null);
  // resumePreview holds the current URL just to check if they have one currently
  const [resumePreview, setResumePreview] = useState<string | null>(initialProfile.resume_url);

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setError("Only JPG, PNG, and WEBP images are allowed.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size must be less than 5MB.");
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setError(null);
      setSuccess(false);
    }
  };

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.type !== 'application/pdf') {
        setError("Only PDF files are allowed for resumes.");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError("Resume size must be less than 10MB.");
        return;
      }
      setResumeFile(file);
      setError(null);
      setSuccess(false);
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) return "Name is required.";
    if (!formData.title.trim()) return "Title is required.";
    if (!formData.bio.trim()) return "Bio is required.";
    
    if (formData.email && !/^[^s@]+@[^s@]+.[^s@]+$/.test(formData.email)) {
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
      let finalImageUrl = initialProfile.profile_image_url;
      let finalResumeUrl = initialProfile.resume_url;

      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("profile-photos")
          .upload(fileName, imageFile);

        if (uploadError) {
          throw new Error("Failed to upload profile photo: " + uploadError.message);
        }

        const { data: urlData } = supabase.storage
          .from("profile-photos")
          .getPublicUrl(fileName);

        finalImageUrl = urlData.publicUrl;
      }

      if (resumeFile) {
        const fileName = `${Math.random().toString(36).substring(2, 15)}-${Date.now()}.pdf`;

        const { error: uploadError } = await supabase.storage
          .from("resumes")
          .upload(fileName, resumeFile);

        if (uploadError) {
          throw new Error("Failed to upload resume: " + uploadError.message);
        }

        const { data: urlData } = supabase.storage
          .from("resumes")
          .getPublicUrl(fileName);

        finalResumeUrl = urlData.publicUrl;
      }

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          name: formData.name,
          title: formData.title,
          bio: formData.bio,
          email: formData.email || null,
          github_url: formData.github_url || null,
          linkedin_url: formData.linkedin_url || null,
          profile_image_url: finalImageUrl,
          resume_url: finalResumeUrl,
          updated_at: new Date().toISOString()
        })
        .eq("id", initialProfile.id);

      if (updateError) {
        throw new Error(updateError.message);
      }

      // Cleanup old photo if replaced successfully
      if (imageFile && initialProfile.profile_image_url && initialProfile.profile_image_url.includes('profile-photos')) {
        try {
          const parts = initialProfile.profile_image_url.split('profile-photos/');
          if (parts.length > 1) {
            const oldPath = parts[1];
            await supabase.storage.from('profile-photos').remove([oldPath]);
          }
        } catch (cleanupError) {
          console.error("Cleanup error:", cleanupError);
        }
      }

      // Cleanup old resume if replaced successfully
      if (resumeFile && initialProfile.resume_url && initialProfile.resume_url.includes('resumes')) {
        try {
          const parts = initialProfile.resume_url.split('resumes/');
          if (parts.length > 1) {
            const oldPath = parts[1];
            await supabase.storage.from('resumes').remove([oldPath]);
          }
        } catch (cleanupError) {
          console.error("Cleanup error:", cleanupError);
        }
      }

      await revalidateHomepage();
      
      // Update local preview states with the new URLs
      setResumePreview(finalResumeUrl);
      
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
        
        <div className={styles.imageUploadSection}>
          <label className={styles.label}>Profile Photo</label>
          <div className={styles.imagePreviewContainer}>
            {imagePreview ? (
              <img src={imagePreview} alt="Profile Preview" className={styles.previewImage} />
            ) : (
              <div className={styles.placeholderImage}>No Photo</div>
            )}
            <div className={styles.uploadControls}>
              <input
                type="file"
                id="profile_photo"
                accept="image/jpeg, image/jpg, image/png, image/webp"
                onChange={handleImageChange}
                className={styles.fileInput}
                disabled={saving}
              />
              <p className={styles.helperText}>Recommended: Square image, max 5MB (JPG, PNG, WEBP).</p>
            </div>
          </div>
        </div>

        <div className={styles.resumeUploadSection}>
          <label className={styles.label}>Resume (PDF)</label>
          {resumePreview && (
            <a 
              href={resumePreview} 
              target="_blank" 
              rel="noopener noreferrer" 
              className={styles.currentResumeLink}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
              View Current Resume
            </a>
          )}
          <div className={styles.uploadControls}>
            <input
              type="file"
              id="resume_file"
              accept="application/pdf"
              onChange={handleResumeChange}
              className={styles.fileInput}
              disabled={saving}
            />
            <p className={styles.helperText}>Max size: 10MB (PDF only). {resumeFile ? `Selected: ${resumeFile.name}` : ''}</p>
          </div>
        </div>

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
