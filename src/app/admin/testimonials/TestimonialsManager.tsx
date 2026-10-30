/* eslint-disable */
"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import type { Testimonial } from "@/lib/supabase/types";
import styles from "./testimonials.module.css";
import { revalidateHomepage } from "../actions";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export default function TestimonialsManager({ initialTestimonials }: { initialTestimonials: Testimonial[] }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    role: "",
    company: "",
    content: "",
    rating: "",
    display_order: 0,
  });

  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getInitials = (name: string) => {
    return name
      .trim()
      .split(/\s+/)
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const openAddForm = () => {
    setEditingTestimonial(null);
    setFormData({
      name: "",
      role: "",
      company: "",
      content: "",
      rating: "5",
      display_order: initialTestimonials.length + 1,
    });
    setSelectedImageFile(null);
    setImagePreview(null);
    setUploadStatus(null);
    setError(null);
    setIsFormOpen(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const openEditForm = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    setFormData({
      name: testimonial.name,
      role: testimonial.role || "",
      company: testimonial.company || "",
      content: testimonial.content,
      rating: testimonial.rating ? String(testimonial.rating) : "",
      display_order: testimonial.display_order,
    });
    setSelectedImageFile(null);
    setImagePreview(testimonial.avatar_url || null);
    setUploadStatus(null);
    setError(null);
    setIsFormOpen(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingTestimonial(null);
    setSelectedImageFile(null);
    setImagePreview(null);
    setUploadStatus(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const confirmDelete = (id: string) => {
    setDeletingId(id);
    setIsDeleteOpen(true);
  };

  const closeDelete = () => {
    setIsDeleteOpen(false);
    setDeletingId(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setError(null);
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setError("Invalid image format. Allowed formats: JPG, JPEG, PNG, and WebP.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setError("Image size exceeds 5MB limit. Please choose a smaller photo.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setSelectedImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleRemovePhoto = () => {
    setSelectedImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const extractStoragePath = (url: string | null): { bucket: string; path: string } | null => {
    if (!url) return null;
    const match = url.match(/\/storage\/v1\/object\/public\/(testimonial-photos|profile-photos)\/(.+)$/);
    if (!match) return null;
    return {
      bucket: match[1],
      path: decodeURIComponent(match[2]),
    };
  };

  const removeAvatarFromStorage = async (url: string | null) => {
    const target = extractStoragePath(url);
    if (!target) return;
    try {
      await supabase.storage.from(target.bucket).remove([target.path]);
    } catch (e) {
      console.warn("Could not remove old testimonial avatar:", e);
    }
  };

  const uploadAvatar = async (file: File, name: string): Promise<string> => {
    const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const sanitizedName = (name || "avatar").replace(/[^a-zA-Z0-9_-]/g, "-").toLowerCase();
    const fileName = `testimonial-${sanitizedName}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;

    let targetBucket = "testimonial-photos";
    let uploadResult = await supabase.storage.from(targetBucket).upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });

    // Auto-create bucket if it does not exist yet
    if (
      uploadResult.error &&
      (uploadResult.error.message?.toLowerCase().includes("bucket not found") ||
        (uploadResult.error as any).statusCode === "404")
    ) {
      const { error: createErr } = await supabase.storage.createBucket("testimonial-photos", {
        public: true,
        fileSizeLimit: MAX_IMAGE_SIZE,
        allowedMimeTypes: ALLOWED_IMAGE_TYPES,
      });

      if (!createErr) {
        uploadResult = await supabase.storage.from("testimonial-photos").upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });
      } else {
        // Fallback to existing public profile-photos bucket
        targetBucket = "profile-photos";
        uploadResult = await supabase.storage.from(targetBucket).upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });
      }
    }

    if (uploadResult.error) {
      throw new Error(`Failed to upload avatar: ${uploadResult.error.message}`);
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(targetBucket).getPublicUrl(fileName);

    return publicUrl;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (!formData.name.trim()) throw new Error("Name is required");
      if (!formData.content.trim()) throw new Error("Testimonial content is required");

      let ratingVal: number | null = null;
      if (formData.rating) {
        const r = parseInt(formData.rating, 10);
        if (isNaN(r) || r < 1 || r > 5) {
          throw new Error("Rating must be a whole number between 1 and 5");
        }
        ratingVal = r;
      }

      let finalAvatarUrl: string | null = editingTestimonial?.avatar_url || null;

      // 1. Photo upload or removal
      if (selectedImageFile) {
        setUploadStatus("Uploading photo to secure storage...");
        const uploadedUrl = await uploadAvatar(selectedImageFile, formData.name);
        
        // Clean up previous image if replacing an existing uploaded image
        if (editingTestimonial?.avatar_url && editingTestimonial.avatar_url !== uploadedUrl) {
          await removeAvatarFromStorage(editingTestimonial.avatar_url);
        }
        finalAvatarUrl = uploadedUrl;
      } else if (!imagePreview && editingTestimonial?.avatar_url) {
        // Image was removed by the user
        await removeAvatarFromStorage(editingTestimonial.avatar_url);
        finalAvatarUrl = null;
      }

      setUploadStatus("Saving testimonial record...");

      const payload = {
        name: formData.name.trim(),
        role: formData.role.trim() || null,
        company: formData.company.trim() || null,
        content: formData.content.trim(),
        rating: ratingVal,
        avatar_url: finalAvatarUrl,
        display_order: formData.display_order,
      };

      if (editingTestimonial) {
        const { error: updateError } = await supabase
          .from("testimonials")
          .update(payload)
          .eq("id", editingTestimonial.id);

        if (updateError) throw new Error(updateError.message);
      } else {
        const { error: insertError } = await supabase
          .from("testimonials")
          .insert([payload]);

        if (insertError) throw new Error(insertError.message);
      }

      // Revalidate public portfolio cache
      try {
        await revalidateHomepage();
      } catch (revalErr) {
        console.warn("Revalidate homepage notice:", revalErr);
      }

      closeForm();
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred while saving.");
    } finally {
      setSaving(false);
      setUploadStatus(null);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;

    setSaving(true);
    setError(null);

    try {
      const itemToDelete = initialTestimonials.find((t) => t.id === deletingId);

      const { error: deleteError } = await supabase
        .from("testimonials")
        .delete()
        .eq("id", deletingId);

      if (deleteError) throw new Error(deleteError.message);

      // Clean up avatar image from Supabase storage if it was stored there
      if (itemToDelete?.avatar_url) {
        await removeAvatarFromStorage(itemToDelete.avatar_url);
      }

      try {
        await revalidateHomepage();
      } catch (revalErr) {
        console.warn("Revalidate homepage notice:", revalErr);
      }

      closeDelete();
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to delete testimonial.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className={styles.actionHeader}>
        <div>
          <h2 className={styles.sectionTitle}>{initialTestimonials.length} Testimonials</h2>
          <p className={styles.sectionSubtitle}>
            Manage endorsements, recommendations, and client/colleague photos
          </p>
        </div>
        <button onClick={openAddForm} className={styles.addButton}>
          + Add New Testimonial
        </button>
      </div>

      <div className={styles.achievementsGrid}>
        {initialTestimonials.map((item) => (
          <div key={item.id} className={styles.achievementCard}>
            <div className={styles.cardHeaderWithAvatar}>
              {item.avatar_url ? (
                <img
                  src={item.avatar_url}
                  alt={`${item.name}'s photo`}
                  className={styles.cardAvatar}
                />
              ) : (
                <div className={styles.cardAvatarFallback}>
                  {getInitials(item.name)}
                </div>
              )}
              <div className={styles.achievementHeaderInfo}>
                <h3 className={styles.achievementTitle}>{item.name}</h3>
                {(item.role || item.company) && (
                  <div className={styles.achievementDate}>
                    {item.role} {item.role && item.company && "•"} {item.company}
                  </div>
                )}
              </div>
            </div>

            <p className={styles.achievementDesc}>
              "{item.content}"
            </p>

            <div className={styles.badges}>
              <span className={styles.badge}>Order: {item.display_order}</span>
              {item.rating && (
                <span className={styles.badge}>★ {item.rating} / 5</span>
              )}
              {item.avatar_url && (
                <span className={`${styles.badge} ${styles.badgePhoto}`}>Photo Attached</span>
              )}
            </div>

            <div className={styles.cardActions}>
              <button onClick={() => openEditForm(item)} className={styles.editBtn}>
                Edit
              </button>
              <button onClick={() => confirmDelete(item.id)} className={styles.deleteBtn}>
                Delete
              </button>
            </div>
          </div>
        ))}

        {initialTestimonials.length === 0 && (
          <div className={styles.emptyCardState}>
            <p>No testimonials found. Click "+ Add New Testimonial" to create your first one.</p>
          </div>
        )}
      </div>

      {isFormOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>{editingTestimonial ? "Edit Testimonial" : "Add New Testimonial"}</h2>
              <button onClick={closeForm} className={styles.closeBtn} disabled={saving}>
                &times;
              </button>
            </div>

            <form onSubmit={handleSave} className={styles.form}>
              {/* Photo Upload & Preview Section */}
              <div className={styles.inputGroup}>
                <label className={styles.label}>Profile Photo (Optional)</label>
                <div className={styles.photoUploadSection}>
                  <div className={styles.avatarPreviewWrapper}>
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className={styles.avatarPreviewImg}
                      />
                    ) : (
                      <div className={styles.avatarPlaceholder}>
                        <svg
                          width="36"
                          height="36"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                      </div>
                    )}
                  </div>

                  <div className={styles.uploadControls}>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/jpg"
                      onChange={handleImageChange}
                      className={styles.fileInput}
                      id="testimonial-photo-input"
                      disabled={saving}
                    />

                    <div className={styles.uploadActionBtns}>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className={styles.uploadBtn}
                        disabled={saving}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="17 8 12 3 7 8" />
                          <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                        {imagePreview ? "Change Photo" : "Upload Photo"}
                      </button>

                      {imagePreview && (
                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                          className={styles.removePhotoBtn}
                          disabled={saving}
                        >
                          Remove Photo
                        </button>
                      )}
                    </div>

                    <p className={styles.uploadHint}>
                      Supports JPG, PNG, and WebP. Max 5MB.
                    </p>
                  </div>
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Full Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Sarah Connor"
                  required
                  disabled={saving}
                  className={styles.input}
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Role / Designation</label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    placeholder="e.g. Senior Software Engineer"
                    disabled={saving}
                    className={styles.input}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>Company / Organization</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="e.g. Microsoft / Open Source"
                    disabled={saving}
                    className={styles.input}
                  />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Testimonial Content *</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={4}
                  placeholder="Write the recommendation or feedback quote here..."
                  required
                  disabled={saving}
                  className={styles.textarea}
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Star Rating (1 - 5)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                    placeholder="e.g. 5"
                    disabled={saving}
                    className={styles.input}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>Display Order *</label>
                  <input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        display_order: parseInt(e.target.value, 10) || 0,
                      })
                    }
                    required
                    disabled={saving}
                    className={styles.input}
                  />
                </div>
              </div>

              {uploadStatus && (
                <div className={styles.uploadStatus}>
                  <svg className={styles.spinner} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                    <path d="M12 2a10 10 0 0 1 10 10" />
                  </svg>
                  <span>{uploadStatus}</span>
                </div>
              )}

              {error && <div className={styles.error}>{error}</div>}

              <div className={styles.modalFooter}>
                <button
                  type="button"
                  onClick={closeForm}
                  className={styles.cancelBtn}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.saveBtn}
                  disabled={saving}
                >
                  {saving ? "Saving..." : editingTestimonial ? "Update Testimonial" : "Create Testimonial"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDeleteOpen && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.modalContent} ${styles.deleteConfirm}`}>
            <h3>Confirm Deletion</h3>
            <p>
              Are you sure you want to permanently delete this testimonial? The associated photo will also be removed from storage.
            </p>

            {error && <div className={styles.error} style={{ marginBottom: "1rem" }}>{error}</div>}

            <div className={styles.deleteConfirmActions}>
              <button
                onClick={closeDelete}
                className={styles.cancelBtn}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className={styles.confirmDeleteBtn}
                disabled={saving}
              >
                {saving ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
