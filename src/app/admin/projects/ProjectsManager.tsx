"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import type { Project } from "@/lib/supabase/types";
import styles from "./projects.module.css";

export default function ProjectsManager({ initialProjects }: { initialProjects: Project[] }) {
  const router = useRouter();
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
    setError(null);
    setIsFormOpen(true);
  };

  const closeForm = () => setIsFormOpen(false);

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

  const validateForm = () => {
    if (!formData.title.trim()) return "Title is required.";
    if (!formData.slug.trim()) return "Slug is required.";
    if (!formData.description.trim()) return "Description is required.";
    return null;
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
      const techArray = formData.technologies
        .split(",")
        .map(t => t.trim())
        .filter(t => t.length > 0);

      const payload = {
        title: formData.title,
        slug: formData.slug,
        description: formData.description,
        detailed_description: formData.detailed_description || null,
        technologies: techArray.length > 0 ? techArray : null,
        image_url: formData.image_url || null,
        github_url: formData.github_url || null,
        live_url: formData.live_url || null,
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
      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", deletingId);

      if (error) throw new Error(error.message);

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
              <button onClick={closeForm} className={styles.closeBtn}>×</button>
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
                  <input id="github_url" name="github_url" type="url" value={formData.github_url} onChange={handleChange} className={styles.input} disabled={saving} />
                </div>
                <div className={styles.inputGroup}>
                  <label htmlFor="live_url" className={styles.label}>Live URL</label>
                  <input id="live_url" name="live_url" type="url" value={formData.live_url} onChange={handleChange} className={styles.input} disabled={saving} />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="image_url" className={styles.label}>Image URL</label>
                <input id="image_url" name="image_url" type="url" value={formData.image_url} onChange={handleChange} className={styles.input} disabled={saving} />
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
