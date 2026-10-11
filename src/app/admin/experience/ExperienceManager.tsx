/* eslint-disable */
"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import type { Experience } from "@/lib/supabase/types";
import styles from "./experience.module.css";
import { revalidateHomepage } from "../actions";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export default function ExperienceManager({ initialExperiences }: { initialExperiences: Experience[] }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingExperience, setEditingExperience] = useState<Experience | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    organization: "",
    location: "",
    start_date: "",
    end_date: "",
    description: "",
    technologies: "",
    image_url: "",
    display_order: 0,
  });

  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openAddForm = () => {
    setEditingExperience(null);
    setFormData({
      title: "",
      organization: "",
      location: "",
      start_date: "",
      end_date: "",
      description: "",
      technologies: "",
      image_url: "",
      display_order: initialExperiences.length,
    });
    setSelectedImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setError(null);
    setIsFormOpen(true);
  };

  const openEditForm = (exp: Experience) => {
    setEditingExperience(exp);
    setFormData({
      title: exp.title,
      organization: exp.organization,
      location: exp.location || "",
      start_date: exp.start_date ? exp.start_date.substring(0, 10) : "",
      end_date: exp.end_date ? exp.end_date.substring(0, 10) : "",
      description: exp.description || "",
      technologies: exp.technologies?.join(", ") || "",
      image_url: exp.image_url || "",
      display_order: exp.display_order,
    });
    setSelectedImageFile(null);
    setImagePreview(exp.image_url || null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setError(null);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setSelectedImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const confirmDelete = (id: string) => {
    setDeletingId(id);
    setIsDeleteOpen(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "number" ? parseInt(value) || 0 : value
    }));
    setError(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setError(null);
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setError("Invalid image format. Only JPG, JPEG, PNG, and WEBP images are allowed.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setError("Image size exceeds 5 MB limit. Please select a smaller photo.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setSelectedImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    setSelectedImageFile(null);
    setImagePreview(null);
    setFormData(prev => ({ ...prev, image_url: "" }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const validateForm = () => {
    if (!formData.title.trim()) return "Title is required.";
    if (!formData.organization.trim()) return "Organization is required.";
    return null;
  };

  const extractStoragePath = (url: string | null): string | null => {
    if (!url) return null;
    const match = url.match(/\/storage\/v1\/object\/public\/experience-images\/(.+)$/);
    return match ? decodeURIComponent(match[1]) : null;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);

    try {
      let finalImageUrl: string | null = formData.image_url?.trim() || null;

      // 1. Handle File Upload to Supabase Storage if an image was selected
      if (selectedImageFile) {
        const fileExt = selectedImageFile.name.split('.').pop()?.toLowerCase() || 'jpg';
        const sanitizedTitle = (formData.title || 'experience').replace(/[^a-zA-Z0-9_-]/g, '-').toLowerCase();
        const fileName = `${sanitizedTitle}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;

        let { data: uploadData, error: uploadError } = await supabase.storage
          .from("experience-images")
          .upload(fileName, selectedImageFile, {
            cacheControl: "3600",
            upsert: false
          });

        // Automatically create bucket if it does not exist yet
        if (uploadError && (
          uploadError.message?.toLowerCase().includes("bucket not found") ||
          (uploadError as any).statusCode === "404"
        )) {
          const { error: createErr } = await supabase.storage.createBucket("experience-images", {
            public: true,
            fileSizeLimit: MAX_IMAGE_SIZE,
            allowedMimeTypes: ALLOWED_IMAGE_TYPES
          });
          if (!createErr) {
            const retry = await supabase.storage
              .from("experience-images")
              .upload(fileName, selectedImageFile, {
                cacheControl: "3600",
                upsert: false
              });
            uploadData = retry.data;
            uploadError = retry.error;
          }
        }

        if (uploadError) {
          throw new Error(`Failed to upload experience photo: ${uploadError.message}`);
        }

        const { data: { publicUrl } } = supabase.storage
          .from("experience-images")
          .getPublicUrl(fileName);

        finalImageUrl = publicUrl;

        // Clean up previous image if replacing an existing uploaded image
        if (editingExperience?.image_url && editingExperience.image_url !== finalImageUrl) {
          const oldPath = extractStoragePath(editingExperience.image_url);
          if (oldPath) {
            try {
              await supabase.storage.from("experience-images").remove([oldPath]);
            } catch (e) {
              console.warn("Could not remove old experience image:", e);
            }
          }
        }
      } else if (!imagePreview && editingExperience?.image_url) {
        // Image was explicitly removed by the user
        finalImageUrl = null;
        const oldPath = extractStoragePath(editingExperience.image_url);
        if (oldPath) {
          try {
            await supabase.storage.from("experience-images").remove([oldPath]);
          } catch (e) {
            console.warn("Could not remove cleared experience image:", e);
          }
        }
      }

      const techArray = formData.technologies
        .split(",")
        .map(t => t.trim())
        .filter(t => t.length > 0);

      const payload: any = {
        title: formData.title.trim(),
        organization: formData.organization.trim(),
        location: formData.location.trim() || null,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        description: formData.description.trim() || null,
        technologies: techArray.length > 0 ? techArray : null,
        image_url: finalImageUrl,
        display_order: formData.display_order,
        updated_at: new Date().toISOString()
      };

      let saveError;

      if (editingExperience) {
        const { error } = await supabase
          .from("experiences")
          .update(payload)
          .eq("id", editingExperience.id);
        saveError = error;
      } else {
        const { error } = await supabase
          .from("experiences")
          .insert([payload]);
        saveError = error;
      }

      // If database complains image_url column doesn't exist yet, retry without image_url
      if (saveError && saveError.message?.toLowerCase().includes("image_url")) {
        delete payload.image_url;
        if (editingExperience) {
          const { error: retryErr } = await supabase
            .from("experiences")
            .update(payload)
            .eq("id", editingExperience.id);
          saveError = retryErr;
        } else {
          const { error: retryErr } = await supabase
            .from("experiences")
            .insert([payload]);
          saveError = retryErr;
        }
      }

      if (saveError) {
        throw new Error(saveError.message);
      }

      // Revalidate public homepage cache
      try {
        await revalidateHomepage();
      } catch (revalErr) {
        console.warn("Cache revalidation notice:", revalErr);
      }

      setIsFormOpen(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An error occurred while saving the experience.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setSaving(true);
    setError(null);

    try {
      const expToDelete = initialExperiences.find(e => e.id === deletingId);

      const { error } = await supabase
        .from("experiences")
        .delete()
        .eq("id", deletingId);

      if (error) throw new Error(error.message);

      // Clean up storage image if exists
      if (expToDelete?.image_url) {
        const oldPath = extractStoragePath(expToDelete.image_url);
        if (oldPath) {
          try {
            await supabase.storage.from("experience-images").remove([oldPath]);
          } catch (e) {
            console.warn("Could not remove deleted experience image:", e);
          }
        }
      }

      try {
        await revalidateHomepage();
      } catch (revalErr) {
        console.warn("Cache revalidation notice:", revalErr);
      }

      setIsDeleteOpen(false);
      setDeletingId(null);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An error occurred while deleting.");
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Present";
    return new Date(dateStr).toLocaleDateString(undefined, { year: 'numeric', month: 'short' });
  };

  return (
    <>
      <div className={styles.actionHeader}>
        <h2 className={styles.sectionTitle}>Experience History</h2>
        <button onClick={openAddForm} className={styles.addButton}>
          + Add Experience
        </button>
      </div>

      <div className={styles.experiencesGrid}>
        {initialExperiences.map(exp => (
          <div key={exp.id} className={styles.experienceCard}>
            {exp.image_url ? (
              <div className={styles.adminCardImage}>
                <img src={exp.image_url} alt={exp.title} className={styles.adminCardImg} />
              </div>
            ) : (
              <div className={styles.adminCardImage}>
                <div className={styles.adminPlaceholderImg}>No Photo Uploaded</div>
              </div>
            )}

            <div className={styles.cardHeader}>
              <div>
                <h3 className={styles.cardTitle}>{exp.title}</h3>
                <span className={styles.cardOrg}>{exp.organization}</span>
              </div>
              <span className={styles.orderBadge}>#{exp.display_order}</span>
            </div>

            <div className={styles.metaRow}>
              {exp.location && (
                <span className={styles.metaItem}>📍 {exp.location}</span>
              )}
              <span className={styles.metaItem}>
                📅 {formatDate(exp.start_date)} - {formatDate(exp.end_date)}
              </span>
            </div>

            {exp.description && (
              <p className={styles.cardDesc}>{exp.description}</p>
            )}

            {exp.technologies && exp.technologies.length > 0 && (
              <div className={styles.technologies}>
                {exp.technologies.map(tech => (
                  <span key={tech} className={styles.techBadge}>{tech}</span>
                ))}
              </div>
            )}

            <div className={styles.cardActions}>
              <button onClick={() => openEditForm(exp)} className={styles.editBtn}>Edit</button>
              <button onClick={() => confirmDelete(exp.id)} className={styles.deleteBtn}>Delete</button>
            </div>
          </div>
        ))}
        {initialExperiences.length === 0 && (
          <p style={{ color: 'var(--text-secondary)' }}>No experiences found. Create your first one!</p>
        )}
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>{editingExperience ? "Edit Experience" : "Add Experience"}</h2>
              <button onClick={closeForm} className={styles.closeBtn} aria-label="Close modal">&times;</button>
            </div>

            <form onSubmit={handleSave} className={styles.form}>
              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label htmlFor="title" className={styles.label}>Title / Role *</label>
                  <input id="title" name="title" type="text" value={formData.title} onChange={handleChange} className={styles.input} disabled={saving} placeholder="e.g. Technical Expertise" />
                </div>
                <div className={styles.inputGroup}>
                  <label htmlFor="organization" className={styles.label}>Organization / Category *</label>
                  <input id="organization" name="organization" type="text" value={formData.organization} onChange={handleChange} className={styles.input} disabled={saving} placeholder="e.g. Professional Journey" />
                </div>
              </div>

              {/* Upload Experience Photo Field */}
              <div className={styles.uploadSection}>
                <label className={styles.label}>Upload Experience Photo</label>

                {imagePreview ? (
                  <div className={styles.formImagePreviewWrapper}>
                    <img src={imagePreview} alt="Experience preview" className={styles.formImagePreview} />
                    <div className={styles.imageOverlayActions}>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className={styles.changeImageBtn}
                        disabled={saving}
                      >
                        Change Photo
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className={styles.removeImageBtn}
                        disabled={saving}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div 
                    className={styles.uploadDropzone} 
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <svg className={styles.uploadIcon} width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    <span className={styles.uploadPrompt}>
                      Click to select a photo from your computer
                    </span>
                    <span className={styles.uploadSubtext}>
                      JPG, JPEG, PNG, or WEBP up to 5 MB
                    </span>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  id="experience_image_file"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleImageChange}
                  style={{ display: "none" }}
                  disabled={saving}
                />

                <div className={styles.helperText}>
                  Supported formats: JPG, JPEG, PNG, WEBP (Max: 5MB). Photo displays at top of experience card.
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label htmlFor="location" className={styles.label}>Location</label>
                  <input id="location" name="location" type="text" value={formData.location} onChange={handleChange} className={styles.input} disabled={saving} placeholder="e.g. Remote / On-site" />
                </div>
                <div className={styles.inputGroup}>
                  <label htmlFor="display_order" className={styles.label}>Display Order</label>
                  <input id="display_order" name="display_order" type="number" value={formData.display_order} onChange={handleChange} className={styles.input} disabled={saving} />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label htmlFor="start_date" className={styles.label}>Start Date</label>
                  <input id="start_date" name="start_date" type="date" value={formData.start_date} onChange={handleChange} className={styles.input} disabled={saving} />
                </div>
                <div className={styles.inputGroup}>
                  <label htmlFor="end_date" className={styles.label}>End Date (Leave blank if Present)</label>
                  <input id="end_date" name="end_date" type="date" value={formData.end_date} onChange={handleChange} className={styles.input} disabled={saving} />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="description" className={styles.label}>Description</label>
                <textarea id="description" name="description" value={formData.description} onChange={handleChange} className={styles.textarea} disabled={saving} placeholder="Brief summary of your responsibilities or milestones..." />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="technologies" className={styles.label}>Tags / Highlights (comma-separated)</label>
                <input id="technologies" name="technologies" type="text" value={formData.technologies} onChange={handleChange} className={styles.input} disabled={saving} placeholder="e.g. Full-Stack, Security, AI/ML" />
              </div>

              {error && <div className={styles.error}>{error}</div>}

              <div className={styles.modalFooter}>
                <button type="button" onClick={closeForm} className={styles.cancelBtn} disabled={saving}>Cancel</button>
                <button type="submit" className={styles.saveBtn} disabled={saving}>{saving ? "Saving..." : "Save Experience"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteOpen && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.modalContent} ${styles.deleteConfirm}`}>
            <h3>Confirm Deletion</h3>
            <p>Are you sure you want to delete this experience? This action cannot be undone.</p>
            {error && <div className={styles.error} style={{ marginBottom: "1rem" }}>{error}</div>}
            <div className={styles.deleteConfirmActions}>
              <button onClick={() => setIsDeleteOpen(false)} className={styles.cancelBtn} disabled={saving}>Cancel</button>
              <button onClick={handleDelete} className={styles.confirmDeleteBtn} disabled={saving}>
                {saving ? "Deleting..." : "Delete Experience"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
