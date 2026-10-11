/* eslint-disable */
"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import type { Project } from "@/lib/supabase/types";
import styles from "./projects.module.css";
import { revalidateHomepage } from "../actions";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export default function ProjectsManager({ initialProjects }: { initialProjects: Project[] }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    detailed_description: "",
    technologies: "",
    image_url: "",
    github_url: "",
    live_url: "",
    featured: false,
    display_order: 0,
  });

  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openAddForm = () => {
    setEditingProject(null);
    setFormData({
      title: "",
      slug: "",
      description: "",
      detailed_description: "",
      technologies: "",
      image_url: "",
      github_url: "",
      live_url: "",
      featured: false,
      display_order: initialProjects.length,
    });
    setSelectedImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setError(null);
    setIsFormOpen(true);
  };

  const openEditForm = (project: Project) => {
    setEditingProject(project);
    setFormData({
      title: project.title,
      slug: project.slug,
      description: project.description || "",
      detailed_description: project.detailed_description || "",
      technologies: project.technologies?.join(", ") || "",
      image_url: project.image_url || "",
      github_url: project.github_url || "",
      live_url: project.live_url || "",
      featured: project.featured,
      display_order: project.display_order,
    });
    setSelectedImageFile(null);
    setImagePreview(project.image_url || null);
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
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : 
              type === "number" ? parseInt(value) || 0 : value
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
    if (!formData.slug.trim()) return "Slug is required.";
    if (!formData.description.trim()) return "Description is required.";
    return null;
  };

  const extractStoragePath = (url: string | null): string | null => {
    if (!url) return null;
    const match = url.match(/\/storage\/v1\/object\/public\/project-images\/(.+)$/);
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
        const sanitizedSlug = (formData.slug || 'project').replace(/[^a-zA-Z0-9_-]/g, '-').toLowerCase();
        const fileName = `${sanitizedSlug}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;

        let { data: uploadData, error: uploadError } = await supabase.storage
          .from("project-images")
          .upload(fileName, selectedImageFile, {
            cacheControl: "3600",
            upsert: false
          });

        // Automatically create bucket if it does not exist yet
        if (uploadError && (
          uploadError.message?.toLowerCase().includes("bucket not found") ||
          (uploadError as any).statusCode === "404"
        )) {
          const { error: createErr } = await supabase.storage.createBucket("project-images", {
            public: true,
            fileSizeLimit: MAX_IMAGE_SIZE,
            allowedMimeTypes: ALLOWED_IMAGE_TYPES
          });
          if (!createErr) {
            const retry = await supabase.storage
              .from("project-images")
              .upload(fileName, selectedImageFile, {
                cacheControl: "3600",
                upsert: false
              });
            uploadData = retry.data;
            uploadError = retry.error;
          }
        }

        if (uploadError) {
          throw new Error(`Failed to upload project image: ${uploadError.message}`);
        }

        const { data: { publicUrl } } = supabase.storage
          .from("project-images")
          .getPublicUrl(fileName);

        finalImageUrl = publicUrl;

        // Clean up previous image if replacing an existing uploaded image
        if (editingProject?.image_url && editingProject.image_url !== finalImageUrl) {
          const oldPath = extractStoragePath(editingProject.image_url);
          if (oldPath) {
            try {
              await supabase.storage.from("project-images").remove([oldPath]);
            } catch (e) {
              console.warn("Could not remove old project image:", e);
            }
          }
        }
      } else if (!imagePreview && editingProject?.image_url) {
        // Image was explicitly removed by the user
        finalImageUrl = null;
        const oldPath = extractStoragePath(editingProject.image_url);
        if (oldPath) {
          try {
            await supabase.storage.from("project-images").remove([oldPath]);
          } catch (e) {
            console.warn("Could not remove cleared project image:", e);
          }
        }
      }

      // 2. Prepare payload
      const techArray = formData.technologies
        .split(",")
        .map(t => t.trim())
        .filter(t => t.length > 0);

      const payload = {
        title: formData.title.trim(),
        slug: formData.slug.trim(),
        description: formData.description.trim(),
        detailed_description: formData.detailed_description?.trim() || null,
        technologies: techArray.length > 0 ? techArray : null,
        image_url: finalImageUrl,
        github_url: formData.github_url?.trim() || null,
        live_url: formData.live_url?.trim() || null,
        featured: formData.featured,
        display_order: formData.display_order,
        updated_at: new Date().toISOString()
      };

      let saveError;

      if (editingProject) {
        const { error } = await supabase
          .from("projects")
          .update(payload)
          .eq("id", editingProject.id);
        saveError = error;
      } else {
        const { error } = await supabase
          .from("projects")
          .insert([payload]);
        saveError = error;
      }

      if (saveError) {
        if (saveError.code === "23505") { // unique violation
          throw new Error("A project with this slug already exists. Slugs must be unique.");
        }
        throw new Error(saveError.message);
      }

      // 3. Revalidate cache and update UI
      try {
        await revalidateHomepage();
      } catch (revalErr) {
        console.warn("Revalidate homepage warning:", revalErr);
      }

      setIsFormOpen(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An error occurred while saving the project.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setSaving(true);
    setError(null);

    try {
      const projectToDelete = initialProjects.find(p => p.id === deletingId);

      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", deletingId);

      if (error) throw new Error(error.message);

      // Clean up storage image if exists
      if (projectToDelete?.image_url) {
        const oldPath = extractStoragePath(projectToDelete.image_url);
        if (oldPath) {
          try {
            await supabase.storage.from("project-images").remove([oldPath]);
          } catch (e) {
            console.warn("Could not remove deleted project image:", e);
          }
        }
      }

      try {
        await revalidateHomepage();
      } catch (revalErr) {
        console.warn("Revalidate homepage warning:", revalErr);
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

  return (
    <>
      <div className={styles.actionHeader}>
        <h2 className={styles.sectionTitle}>Portfolio Projects</h2>
        <button onClick={openAddForm} className={styles.addButton}>
          + Add Project
        </button>
      </div>

      <div className={styles.projectsGrid}>
        {initialProjects.map(project => (
          <div key={project.id} className={styles.projectCard}>
            {project.image_url ? (
              <div className={styles.adminCardImage}>
                <img src={project.image_url} alt={project.title} className={styles.adminCardImg} />
              </div>
            ) : (
              <div className={styles.adminCardImage}>
                <div className={styles.adminPlaceholderImg}>No Image</div>
              </div>
            )}

            <div className={styles.projectHeader}>
              <h3 className={styles.projectTitle}>{project.title}</h3>
              <span className={styles.projectSlug}>/{project.slug}</span>
            </div>
            
            <p className={styles.projectDesc}>{project.description}</p>
            
            <div className={styles.badges}>
              {project.featured && <span className={`${styles.badge} ${styles.featuredBadge}`}>Featured</span>}
              <span className={styles.badge}>Order: {project.display_order}</span>
              {project.technologies && project.technologies.length > 0 && (
                <span className={styles.badge}>{project.technologies.length} Techs</span>
              )}
            </div>

            <div className={styles.cardActions}>
              <button onClick={() => openEditForm(project)} className={styles.editBtn}>Edit</button>
              <button onClick={() => confirmDelete(project.id)} className={styles.deleteBtn}>Delete</button>
            </div>
          </div>
        ))}
        {initialProjects.length === 0 && (
          <p style={{ color: 'var(--text-secondary)' }}>No projects found. Create your first one!</p>
        )}
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>{editingProject ? "Edit Project" : "Add Project"}</h2>
              <button onClick={closeForm} className={styles.closeBtn} aria-label="Close modal">&times;</button>
            </div>
            
            <form onSubmit={handleSave} className={styles.form}>
              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label htmlFor="title" className={styles.label}>Project Title *</label>
                  <input id="title" name="title" type="text" value={formData.title} onChange={handleChange} className={styles.input} disabled={saving} />
                </div>
                <div className={styles.inputGroup}>
                  <label htmlFor="slug" className={styles.label}>URL Slug *</label>
                  <input id="slug" name="slug" type="text" value={formData.slug} onChange={handleChange} className={styles.input} disabled={saving} />
                </div>
              </div>

              {/* Upload Project Image Field */}
              <div className={styles.uploadSection}>
                <label className={styles.label}>Upload Project Image</label>
                
                {imagePreview ? (
                  <div className={styles.formImagePreviewWrapper}>
                    <img src={imagePreview} alt="Project preview" className={styles.formImagePreview} />
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
                      Click to select a project image from your computer
                    </span>
                    <span className={styles.uploadSubtext}>
                      JPG, JPEG, PNG, or WEBP up to 5 MB (16:9 recommended)
                    </span>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  id="project_image_file"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleImageChange}
                  style={{ display: "none" }}
                  disabled={saving}
                />
                
                <div className={styles.helperText}>
                  Supported formats: JPG, JPEG, PNG, WEBP (Max: 5MB). Image is displayed in 16:9 aspect ratio.
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="description" className={styles.label}>Short Description *</label>
                <textarea id="description" name="description" value={formData.description} onChange={handleChange} className={styles.textarea} disabled={saving} />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="detailed_description" className={styles.label}>Detailed Description</label>
                <textarea id="detailed_description" name="detailed_description" value={formData.detailed_description} onChange={handleChange} className={styles.textarea} disabled={saving} style={{ minHeight: "150px" }} />
              </div>

              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label htmlFor="technologies" className={styles.label}>Technologies (comma-separated)</label>
                  <input id="technologies" name="technologies" type="text" value={formData.technologies} onChange={handleChange} className={styles.input} disabled={saving} placeholder="e.g. React, TypeScript, Node.js" />
                </div>
                <div className={styles.inputGroup}>
                  <label htmlFor="display_order" className={styles.label}>Display Order</label>
                  <input id="display_order" name="display_order" type="number" value={formData.display_order} onChange={handleChange} className={styles.input} disabled={saving} />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label htmlFor="github_url" className={styles.label}>GitHub URL</label>
                  <input id="github_url" name="github_url" type="url" value={formData.github_url} onChange={handleChange} className={styles.input} disabled={saving} placeholder="https://github.com/..." />
                </div>
                <div className={styles.inputGroup}>
                  <label htmlFor="live_url" className={styles.label}>Live URL</label>
                  <input id="live_url" name="live_url" type="url" value={formData.live_url} onChange={handleChange} className={styles.input} disabled={saving} placeholder="https://..." />
                </div>
              </div>

              <div className={styles.checkboxGroup}>
                <input id="featured" name="featured" type="checkbox" checked={formData.featured} onChange={handleChange} className={styles.checkbox} disabled={saving} />
                <label htmlFor="featured" className={styles.checkboxLabel}>Mark as Featured Project</label>
              </div>

              {error && <div className={styles.error}>{error}</div>}

              <div className={styles.modalFooter}>
                <button type="button" onClick={closeForm} className={styles.cancelBtn} disabled={saving}>Cancel</button>
                <button type="submit" className={styles.saveBtn} disabled={saving}>{saving ? "Saving..." : "Save Project"}</button>
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
            <p>Are you sure you want to delete this project? This action cannot be undone.</p>
            {error && <div className={styles.error} style={{ marginBottom: "1rem" }}>{error}</div>}
            <div className={styles.deleteConfirmActions}>
              <button onClick={() => setIsDeleteOpen(false)} className={styles.cancelBtn} disabled={saving}>Cancel</button>
              <button onClick={handleDelete} className={styles.confirmDeleteBtn} disabled={saving}>
                {saving ? "Deleting..." : "Delete Project"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
