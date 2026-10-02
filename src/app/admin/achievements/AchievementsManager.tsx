"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import type { Achievement } from "@/lib/supabase/types";
import styles from "./achievements.module.css";

export default function AchievementsManager({ initialAchievements }: { initialAchievements: Achievement[] }) {
  const router = useRouter();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    url: "",
    display_order: 0,
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openAddForm = () => {
    setEditingAchievement(null);
    setFormData({
      title: "",
      description: "",
      date: "",
      url: "",
      display_order: initialAchievements.length,
    });
    setError(null);
    setIsFormOpen(true);
  };

  const openEditForm = (achievement: Achievement) => {
    setEditingAchievement(achievement);
    setFormData({
      title: achievement.title,
      description: achievement.description || "",
      date: achievement.date ? achievement.date.substring(0, 10) : "",
      url: achievement.url || "",
      display_order: achievement.display_order,
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
    if (formData.url && !formData.url.startsWith('http')) {
      return "URL must start with http:// or https://";
    }
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
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        date: formData.date || null,
        url: formData.url.trim() || null,
        display_order: formData.display_order,
      };

      let saveError;

      if (editingAchievement) {
        const { error } = await supabase
          .from("achievements")
          .update(payload)
          .eq("id", editingAchievement.id);
        saveError = error;
      } else {
        const { error } = await supabase
          .from("achievements")
          .insert([payload]);
        saveError = error;
      }

      if (saveError) {
        throw new Error(saveError.message);
      }

      setIsFormOpen(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An error occurred while saving the achievement.");
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
        .from("achievements")
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
    if (!dateStr) return "No date provided";
    return new Date(dateStr).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <>
      <div className={styles.actionHeader}>
        <h2 className={styles.sectionTitle}>Achievements & Awards</h2>
        <button onClick={openAddForm} className={styles.addButton}>
          + Add Achievement
        </button>
      </div>

      <div className={styles.achievementsGrid}>
        {initialAchievements.map(achievement => (
          <div key={achievement.id} className={styles.achievementCard}>
            <div className={styles.achievementHeader}>
              <h3 className={styles.achievementTitle}>{achievement.title}</h3>
            </div>
            
            <div className={styles.achievementDate}>
              {formatDate(achievement.date)}
            </div>
            
            <p className={styles.achievementDesc}>{achievement.description}</p>
            
            <div className={styles.badges}>
              <span className={styles.badge}>Order: {achievement.display_order}</span>
            </div>

            <div className={styles.cardActions}>
              <button onClick={() => openEditForm(achievement)} className={styles.editBtn}>Edit</button>
              <button onClick={() => confirmDelete(achievement.id)} className={styles.deleteBtn}>Delete</button>
              {achievement.url && (
                <a href={achievement.url} target="_blank" rel="noopener noreferrer" className={styles.viewLink}>
                  View Link →
                </a>
              )}
            </div>
          </div>
        ))}
        {initialAchievements.length === 0 && (
          <p style={{ color: 'var(--text-secondary)' }}>No achievements found. Add your first one!</p>
        )}
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>{editingAchievement ? "Edit Achievement" : "Add Achievement"}</h2>
              <button onClick={closeForm} className={styles.closeBtn}>×</button>
            </div>
            
            <form onSubmit={handleSave} className={styles.form}>
              <div className={styles.inputGroup}>
                <label htmlFor="title" className={styles.label}>Title *</label>
                <input id="title" name="title" type="text" value={formData.title} onChange={handleChange} className={styles.input} disabled={saving} placeholder="e.g. Hackathon Winner" />
              </div>

              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label htmlFor="date" className={styles.label}>Date</label>
                  <input id="date" name="date" type="date" value={formData.date} onChange={handleChange} className={styles.input} disabled={saving} />
                </div>
                <div className={styles.inputGroup}>
                  <label htmlFor="display_order" className={styles.label}>Display Order</label>
                  <input id="display_order" name="display_order" type="number" value={formData.display_order} onChange={handleChange} className={styles.input} disabled={saving} />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="url" className={styles.label}>Related URL (Optional)</label>
                <input id="url" name="url" type="url" value={formData.url} onChange={handleChange} className={styles.input} disabled={saving} placeholder="https://..." />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="description" className={styles.label}>Description</label>
                <textarea id="description" name="description" value={formData.description} onChange={handleChange} className={styles.textarea} disabled={saving} />
              </div>

              {error && <div className={styles.error}>{error}</div>}

              <div className={styles.modalFooter}>
                <button type="button" onClick={closeForm} className={styles.cancelBtn} disabled={saving}>Cancel</button>
                <button type="submit" className={styles.saveBtn} disabled={saving}>{saving ? "Saving..." : "Save Achievement"}</button>
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
            <p>Are you sure you want to delete this achievement? This action cannot be undone.</p>
            {error && <div className={styles.error} style={{ marginBottom: "1rem" }}>{error}</div>}
            <div className={styles.deleteConfirmActions}>
              <button onClick={() => setIsDeleteOpen(false)} className={styles.cancelBtn} disabled={saving}>Cancel</button>
              <button onClick={handleDelete} className={styles.confirmDeleteBtn} disabled={saving}>
                {saving ? "Deleting..." : "Delete Achievement"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
