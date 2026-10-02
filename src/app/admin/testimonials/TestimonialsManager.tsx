"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import type { Testimonial } from "@/lib/supabase/types";
import styles from "./testimonials.module.css";

export default function TestimonialsManager({ initialTestimonials }: { initialTestimonials: Testimonial[] }) {
  const router = useRouter();
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

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openAddForm = () => {
    setEditingTestimonial(null);
    setFormData({
      name: "",
      role: "",
      company: "",
      content: "",
      rating: "",
      display_order: initialTestimonials.length,
    });
    setError(null);
    setIsFormOpen(true);
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
    setError(null);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingTestimonial(null);
  };

  const confirmDelete = (id: string) => {
    setDeletingId(id);
    setIsDeleteOpen(true);
  };

  const closeDelete = () => {
    setIsDeleteOpen(false);
    setDeletingId(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (!formData.name.trim()) throw new Error("Name is required");
      if (!formData.content.trim()) throw new Error("Content is required");

      let ratingVal: number | null = null;
      if (formData.rating) {
        const r = parseInt(formData.rating);
        if (isNaN(r) || r < 1 || r > 5) {
          throw new Error("Rating must be an integer between 1 and 5");
        }
        ratingVal = r;
      }

      const payload = {
        name: formData.name,
        role: formData.role || null,
        company: formData.company || null,
        content: formData.content,
        rating: ratingVal,
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

      closeForm();
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    
    setSaving(true);
    setError(null);
    
    try {
      const { error: deleteError } = await supabase
        .from("testimonials")
        .delete()
        .eq("id", deletingId);
        
      if (deleteError) throw new Error(deleteError.message);
      
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
        <h2 className={styles.sectionTitle}>{initialTestimonials.length} Testimonials</h2>
        <button onClick={openAddForm} className={styles.addButton}>
          Add New Testimonial
        </button>
      </div>

      <div className={styles.achievementsGrid}>
        {initialTestimonials.map((item) => (
          <div key={item.id} className={styles.achievementCard}>
            <div className={styles.achievementHeader}>
              <h3 className={styles.achievementTitle}>{item.name}</h3>
            </div>
            {(item.role || item.company) && (
              <div className={styles.achievementDate}>
                {item.role} {item.role && item.company && "-"} {item.company}
              </div>
            )}
            <p className={styles.achievementDesc}>
              "{item.content.substring(0, 100)}{item.content.length > 100 ? "..." : ""}"
            </p>
            
            <div className={styles.badges}>
              <span className={styles.badge}>Order: {item.display_order}</span>
              {item.rating && (
                <span className={styles.badge}>Rating: {item.rating}/5</span>
              )}
            </div>
            
            <div className={styles.cardActions}>
              <button onClick={() => openEditForm(item)} className={styles.editBtn}>Edit</button>
              <button onClick={() => confirmDelete(item.id)} className={styles.deleteBtn}>Delete</button>
            </div>
          </div>
        ))}

        {initialTestimonials.length === 0 && (
          <p style={{ color: 'var(--text-secondary)' }}>No testimonials found. Click the Add button to create one.</p>
        )}
      </div>

      {isFormOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>{editingTestimonial ? "Edit Testimonial" : "Add Testimonial"}</h2>
              <button onClick={closeForm} className={styles.closeBtn}>&times;</button>
            </div>
            
            <form onSubmit={handleSave} className={styles.form}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Name *</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                  className={styles.input}
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Role</label>
                  <input 
                    type="text" 
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    placeholder="e.g. CEO"
                    className={styles.input}
                  />
                </div>
                
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Company</label>
                  <input 
                    type="text" 
                    value={formData.company}
                    onChange={(e) => setFormData({...formData, company: e.target.value})}
                    placeholder="e.g. Acme Corp"
                    className={styles.input}
                  />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Content *</label>
                <textarea 
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  rows={4}
                  required
                  className={styles.textarea}
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Rating (1-5)</label>
                  <input 
                    type="number" 
                    min="1" max="5"
                    value={formData.rating}
                    onChange={(e) => setFormData({...formData, rating: e.target.value})}
                    placeholder="Optional"
                    className={styles.input}
                  />
                </div>
                
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Display Order *</label>
                  <input 
                    type="number" 
                    value={formData.display_order}
                    onChange={(e) => setFormData({...formData, display_order: parseInt(e.target.value) || 0})}
                    required
                    className={styles.input}
                  />
                </div>
              </div>

              {error && <div className={styles.error}>{error}</div>}

              <div className={styles.modalFooter}>
                <button type="button" onClick={closeForm} className={styles.cancelBtn} disabled={saving}>
                  Cancel
                </button>
                <button type="submit" className={styles.saveBtn} disabled={saving}>
                  {saving ? "Saving..." : "Save Testimonial"}
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
            <p>Are you sure you want to delete this testimonial? This action cannot be undone.</p>
            
            {error && <div className={styles.error} style={{ marginBottom: "1rem" }}>{error}</div>}
            
            <div className={styles.deleteConfirmActions}>
              <button onClick={closeDelete} className={styles.cancelBtn} disabled={saving}>
                Cancel
              </button>
              <button onClick={handleDelete} className={styles.confirmDeleteBtn} disabled={saving}>
                {saving ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
