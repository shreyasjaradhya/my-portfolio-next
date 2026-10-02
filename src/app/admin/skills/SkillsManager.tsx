"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import type { Skill } from "@/lib/supabase/types";
import styles from "./skills.module.css";

export default function SkillsManager({ initialSkills }: { initialSkills: Skill[] }) {
  const router = useRouter();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    category: "",
    name: "",
    level: "",
    display_order: 0,
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openAddForm = () => {
    setEditingSkill(null);
    setFormData({
      category: "",
      name: "",
      level: "",
      display_order: initialSkills.length,
    });
    setError(null);
    setIsFormOpen(true);
  };

  const openEditForm = (skill: Skill) => {
    setEditingSkill(skill);
    setFormData({
      category: skill.category,
      name: skill.name,
      level: skill.level || "",
      display_order: skill.display_order,
    });
    setError(null);
    setIsFormOpen(true);
  };

  const closeForm = () => setIsFormOpen(false);

  const confirmDelete = (id: string) => {
    setDeletingId(id);
    setIsDeleteOpen(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "number" ? parseInt(value) || 0 : value
    }));
    setError(null);
  };

  const validateForm = () => {
    if (!formData.category.trim()) return "Category is required.";
    if (!formData.name.trim()) return "Skill name is required.";
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
        category: formData.category.trim(),
        name: formData.name.trim(),
        level: formData.level.trim() || null,
        display_order: formData.display_order,
      };

      let saveError;

      if (editingSkill) {
        const { error } = await supabase
          .from("skills")
          .update(payload)
          .eq("id", editingSkill.id);
        saveError = error;
      } else {
        const { error } = await supabase
          .from("skills")
          .insert([payload]);
        saveError = error;
      }

      if (saveError) {
        throw new Error(saveError.message);
      }

      setIsFormOpen(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An error occurred while saving the skill.");
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
        .from("skills")
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
        <h2 className={styles.sectionTitle}>Technical Skills</h2>
        <button onClick={openAddForm} className={styles.addButton}>
          + Add Skill
        </button>
      </div>

      <div className={styles.skillsGrid}>
        {initialSkills.map(skill => (
          <div key={skill.id} className={styles.skillCard}>
            <div className={styles.skillHeader}>
              <h3 className={styles.skillName}>{skill.name}</h3>
            </div>
            
            <div className={styles.badges}>
              <span className={styles.skillCategory}>{skill.category}</span>
              {skill.level && <span className={styles.badge}>{skill.level}</span>}
              <span className={styles.badge}>Order: {skill.display_order}</span>
            </div>

            <div className={styles.cardActions}>
              <button onClick={() => openEditForm(skill)} className={styles.editBtn}>Edit</button>
              <button onClick={() => confirmDelete(skill.id)} className={styles.deleteBtn}>Delete</button>
            </div>
          </div>
        ))}
        {initialSkills.length === 0 && (
          <p style={{ color: 'var(--text-secondary)' }}>No skills found. Add your first skill!</p>
        )}
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>{editingSkill ? "Edit Skill" : "Add Skill"}</h2>
              <button onClick={closeForm} className={styles.closeBtn}>×</button>
            </div>
            
            <form onSubmit={handleSave} className={styles.form}>
              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label htmlFor="name" className={styles.label}>Skill Name *</label>
                  <input id="name" name="name" type="text" value={formData.name} onChange={handleChange} className={styles.input} disabled={saving} placeholder="e.g. React, Python" />
                </div>
                <div className={styles.inputGroup}>
                  <label htmlFor="category" className={styles.label}>Category *</label>
                  <input id="category" name="category" type="text" value={formData.category} onChange={handleChange} className={styles.input} disabled={saving} placeholder="e.g. Frontend, Backend" />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label htmlFor="level" className={styles.label}>Proficiency Level</label>
                  <input id="level" name="level" type="text" value={formData.level} onChange={handleChange} className={styles.input} disabled={saving} placeholder="e.g. Advanced, Intermediate" />
                </div>
                <div className={styles.inputGroup}>
                  <label htmlFor="display_order" className={styles.label}>Display Order</label>
                  <input id="display_order" name="display_order" type="number" value={formData.display_order} onChange={handleChange} className={styles.input} disabled={saving} />
                </div>
              </div>

              {error && <div className={styles.error}>{error}</div>}

              <div className={styles.modalFooter}>
                <button type="button" onClick={closeForm} className={styles.cancelBtn} disabled={saving}>Cancel</button>
                <button type="submit" className={styles.saveBtn} disabled={saving}>{saving ? "Saving..." : "Save Skill"}</button>
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
            <p>Are you sure you want to delete this skill? This action cannot be undone.</p>
            {error && <div className={styles.error} style={{ marginBottom: "1rem" }}>{error}</div>}
            <div className={styles.deleteConfirmActions}>
              <button onClick={() => setIsDeleteOpen(false)} className={styles.cancelBtn} disabled={saving}>Cancel</button>
              <button onClick={handleDelete} className={styles.confirmDeleteBtn} disabled={saving}>
                {saving ? "Deleting..." : "Delete Skill"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
