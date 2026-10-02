"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import type { Education } from "@/lib/supabase/types";
import styles from "./education.module.css";

export default function EducationManager({ initialEducation }: { initialEducation: Education[] }) {
  const router = useRouter();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingEducation, setEditingEducation] = useState<Education | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    institution: "",
    degree: "",
    field: "",
    start_date: "",
    end_date: "",
    description: "",
    display_order: 0,
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openAddForm = () => {
    setEditingEducation(null);
    setFormData({
      institution: "",
      degree: "",
      field: "",
      start_date: "",
      end_date: "",
      description: "",
      display_order: initialEducation.length,
    });
    setError(null);
    setIsFormOpen(true);
  };

  const openEditForm = (edu: Education) => {
    setEditingEducation(edu);
    setFormData({
      institution: edu.institution,
      degree: edu.degree,
      field: edu.field || "",
      start_date: edu.start_date ? edu.start_date.substring(0, 10) : "",
      end_date: edu.end_date ? edu.end_date.substring(0, 10) : "",
      description: edu.description || "",
      display_order: edu.display_order,
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
    if (!formData.institution.trim()) return "Institution is required.";
    if (!formData.degree.trim()) return "Degree is required.";
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
      const payload = {
        institution: formData.institution.trim(),
        degree: formData.degree.trim(),
        field: formData.field.trim() || null,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        description: formData.description.trim() || null,
        display_order: formData.display_order,
        updated_at: new Date().toISOString()
      };

      let saveError;

      if (editingEducation) {
        const { error } = await supabase
          .from("education")
          .update(payload)
          .eq("id", editingEducation.id);
        saveError = error;
      } else {
        const { error } = await supabase
          .from("education")
          .insert([payload]);
        saveError = error;
      }

      if (saveError) {
        throw new Error(saveError.message);
      }

      setIsFormOpen(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An error occurred while saving the education record.");
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
        .from("education")
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
        <h2 className={styles.sectionTitle}>Academic Background</h2>
        <button onClick={openAddForm} className={styles.addButton}>
          + Add Education
        </button>
      </div>

      <div className={styles.educationGrid}>
        {initialEducation.map(edu => (
          <div key={edu.id} className={styles.educationCard}>
            <div className={styles.educationHeader}>
              <h3 className={styles.educationInstitution}>{edu.institution}</h3>
            </div>
            
            <div className={styles.educationDegree}>
              {edu.degree} {edu.field ? `in ${edu.field}` : ""}
            </div>
            
            <div className={styles.educationDates}>
              {formatDate(edu.start_date)} - {formatDate(edu.end_date)}
            </div>
            
            <p className={styles.educationDesc}>{edu.description}</p>
            
            <div className={styles.badges}>
              <span className={styles.badge}>Order: {edu.display_order}</span>
            </div>

            <div className={styles.cardActions}>
              <button onClick={() => openEditForm(edu)} className={styles.editBtn}>Edit</button>
              <button onClick={() => confirmDelete(edu.id)} className={styles.deleteBtn}>Delete</button>
            </div>
          </div>
        ))}
        {initialEducation.length === 0 && (
          <p style={{ color: 'var(--text-secondary)' }}>No education records found. Add your first one!</p>
        )}
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>{editingEducation ? "Edit Education" : "Add Education"}</h2>
              <button onClick={closeForm} className={styles.closeBtn}>×</button>
            </div>
            
            <form onSubmit={handleSave} className={styles.form}>
              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label htmlFor="institution" className={styles.label}>Institution *</label>
                  <input id="institution" name="institution" type="text" value={formData.institution} onChange={handleChange} className={styles.input} disabled={saving} placeholder="e.g. Stanford University" />
                </div>
                <div className={styles.inputGroup}>
                  <label htmlFor="degree" className={styles.label}>Degree *</label>
                  <input id="degree" name="degree" type="text" value={formData.degree} onChange={handleChange} className={styles.input} disabled={saving} placeholder="e.g. Bachelor of Science" />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label htmlFor="field" className={styles.label}>Field of Study</label>
                  <input id="field" name="field" type="text" value={formData.field} onChange={handleChange} className={styles.input} disabled={saving} placeholder="e.g. Computer Science" />
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

              {error && <div className={styles.error}>{error}</div>}

              <div className={styles.modalFooter}>
                <button type="button" onClick={closeForm} className={styles.cancelBtn} disabled={saving}>Cancel</button>
                <button type="submit" className={styles.saveBtn} disabled={saving}>{saving ? "Saving..." : "Save Education"}</button>
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
            <p>Are you sure you want to delete this education record? This action cannot be undone.</p>
            {error && <div className={styles.error} style={{ marginBottom: "1rem" }}>{error}</div>}
            <div className={styles.deleteConfirmActions}>
              <button onClick={() => setIsDeleteOpen(false)} className={styles.cancelBtn} disabled={saving}>Cancel</button>
              <button onClick={handleDelete} className={styles.confirmDeleteBtn} disabled={saving}>
                {saving ? "Deleting..." : "Delete Education"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
