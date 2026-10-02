"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import type { Experience } from "@/lib/supabase/types";
import styles from "./experience.module.css";

export default function ExperienceManager({ initialExperiences }: { initialExperiences: Experience[] }) {
  const router = useRouter();
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
    display_order: 0,
  });

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
      display_order: initialExperiences.length,
    });
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
      display_order: exp.display_order,
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
      [name]: type === "number" ? parseInt(value) || 0 : value
    }));
    setError(null);
  };

  const validateForm = () => {
    if (!formData.title.trim()) return "Title is required.";
    if (!formData.organization.trim()) return "Organization is required.";
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
        title: formData.title.trim(),
        organization: formData.organization.trim(),
        location: formData.location.trim() || null,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        description: formData.description.trim() || null,
        technologies: techArray.length > 0 ? techArray : null,
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

      if (saveError) {
        throw new Error(saveError.message);
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
      const { error } = await supabase
        .from("experiences")
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
            <div className={styles.experienceHeader}>
              <h3 className={styles.experienceTitle}>{exp.title}</h3>
            </div>
            
            <div className={styles.experienceOrg}>{exp.organization} {exp.location ? `— ${exp.location}` : ""}</div>
            
            <div className={styles.experienceDates}>
              {formatDate(exp.start_date)} - {formatDate(exp.end_date)}
            </div>
            
            <p className={styles.experienceDesc}>{exp.description}</p>
            
            <div className={styles.badges}>
              <span className={styles.badge}>Order: {exp.display_order}</span>
              {exp.technologies && exp.technologies.length > 0 && (
                <span className={styles.badge}>{exp.technologies.length} Techs</span>
              )}
            </div>

            <div className={styles.cardActions}>
              <button onClick={() => openEditForm(exp)} className={styles.editBtn}>Edit</button>
              <button onClick={() => confirmDelete(exp.id)} className={styles.deleteBtn}>Delete</button>
            </div>
          </div>
        ))}
        {initialExperiences.length === 0 && (
          <p style={{ color: 'var(--text-secondary)' }}>No experience records found. Add your first one!</p>
        )}
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>{editingExperience ? "Edit Experience" : "Add Experience"}</h2>
              <button onClick={closeForm} className={styles.closeBtn}>×</button>
            </div>
            
            <form onSubmit={handleSave} className={styles.form}>
              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label htmlFor="title" className={styles.label}>Job Title / Role *</label>
                  <input id="title" name="title" type="text" value={formData.title} onChange={handleChange} className={styles.input} disabled={saving} placeholder="e.g. Senior Software Engineer" />
                </div>
                <div className={styles.inputGroup}>
                  <label htmlFor="organization" className={styles.label}>Organization / Company *</label>
                  <input id="organization" name="organization" type="text" value={formData.organization} onChange={handleChange} className={styles.input} disabled={saving} placeholder="e.g. Google" />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label htmlFor="location" className={styles.label}>Location</label>
                  <input id="location" name="location" type="text" value={formData.location} onChange={handleChange} className={styles.input} disabled={saving} placeholder="e.g. Remote, San Francisco" />
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
                  <label htmlFor="end_date" className={styles.label}>End Date (Leave blank if present)</label>
                  <input id="end_date" name="end_date" type="date" value={formData.end_date} onChange={handleChange} className={styles.input} disabled={saving} />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="description" className={styles.label}>Description</label>
                <textarea id="description" name="description" value={formData.description} onChange={handleChange} className={styles.textarea} disabled={saving} />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="technologies" className={styles.label}>Technologies (comma-separated)</label>
                <input id="technologies" name="technologies" type="text" value={formData.technologies} onChange={handleChange} className={styles.input} disabled={saving} placeholder="e.g. React, Node.js, PostgreSQL" />
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
            <p>Are you sure you want to delete this experience record? This action cannot be undone.</p>
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
