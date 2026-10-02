"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import type { Certification } from "@/lib/supabase/types";
import styles from "./certifications.module.css";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];

export default function CertificationsManager({ initialCertifications }: { initialCertifications: Certification[] }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingCert, setEditingCert] = useState<Certification | null>(null);
  const [deletingCert, setDeletingCert] = useState<Certification | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    issuer: "",
    issue_date: "",
    credential_url: "",
    description: "",
    display_order: 0,
  });
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openAddForm = () => {
    setEditingCert(null);
    setFormData({
      name: "",
      issuer: "",
      issue_date: "",
      credential_url: "",
      description: "",
      display_order: initialCertifications.length,
    });
    setSelectedFile(null);
    setError(null);
    setIsFormOpen(true);
  };

  const openEditForm = (cert: Certification) => {
    setEditingCert(cert);
    setFormData({
      name: cert.name,
      issuer: cert.issuer,
      issue_date: cert.issue_date ? cert.issue_date.substring(0, 10) : "",
      credential_url: cert.credential_url || "",
      description: cert.description || "",
      display_order: cert.display_order,
    });
    setSelectedFile(null);
    setError(null);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setSelectedFile(null);
  };

  const confirmDelete = (cert: Certification) => {
    setDeletingCert(cert);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setError(null);
    
    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Invalid file type. Please upload a PDF, JPG, or PNG file.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      setSelectedFile(null);
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("File is too large. Maximum size is 10 MB.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const validateForm = () => {
    if (!formData.name.trim()) return "Certification Name is required.";
    if (!formData.issuer.trim()) return "Issuing Organization is required.";
    if (formData.credential_url && !formData.credential_url.startsWith('http')) {
      return "Credential URL must start with http:// or https://";
    }
    return null;
  };

  const extractStoragePath = (url: string | null): string | null => {
    if (!url) return null;
    const match = url.match(/\/storage\/v1\/object\/public\/certificates\/(.+)$/);
    return match ? match[1] : null;
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
      let certificate_url = editingCert?.certificate_url || null;

      // 1. Handle File Upload if selected
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const sanitizedName = formData.name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
        const uniquePath = `${Date.now()}-${sanitizedName}.${fileExt}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("certificates")
          .upload(uniquePath, selectedFile);

        if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

        const { data: { publicUrl } } = supabase.storage
          .from("certificates")
          .getPublicUrl(uploadData.path);
          
        certificate_url = publicUrl;

        // Attempt to delete old file if we replaced it
        if (editingCert?.certificate_url) {
          const oldPath = extractStoragePath(editingCert.certificate_url);
          if (oldPath) {
            await supabase.storage.from("certificates").remove([oldPath]);
          }
        }
      }

      // 2. Save Database Record
      const payload = {
        name: formData.name.trim(),
        issuer: formData.issuer.trim(),
        issue_date: formData.issue_date || null,
        credential_url: formData.credential_url.trim() || null,
        certificate_url,
        description: formData.description.trim() || null,
        display_order: formData.display_order,
      };

      if (editingCert) {
        const { error: dbError } = await supabase
          .from("certifications")
          .update(payload)
          .eq("id", editingCert.id);
        if (dbError) throw new Error(dbError.message);
      } else {
        const { error: dbError } = await supabase
          .from("certifications")
          .insert([payload]);
        if (dbError) throw new Error(dbError.message);
      }

      setIsFormOpen(false);
      setSelectedFile(null);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An error occurred while saving the certification.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingCert) return;
    setSaving(true);
    setError(null);

    try {
      // 1. Delete DB record
      const { error: dbError } = await supabase
        .from("certifications")
        .delete()
        .eq("id", deletingCert.id);

      if (dbError) throw new Error(dbError.message);

      // 2. Delete Storage object if it exists
      if (deletingCert.certificate_url) {
        const oldPath = extractStoragePath(deletingCert.certificate_url);
        if (oldPath) {
          const { error: storageError } = await supabase.storage
            .from("certificates")
            .remove([oldPath]);
            
          if (storageError) {
            console.error("Failed to delete storage object:", storageError);
            // We do not throw here to prevent leaving the UI in an inconsistent state,
            // the database row is already deleted.
          }
        }
      }

      setIsDeleteOpen(false);
      setDeletingCert(null);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An error occurred while deleting.");
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "No date";
    return new Date(dateStr).toLocaleDateString(undefined, { year: 'numeric', month: 'short' });
  };

  return (
    <>
      <div className={styles.actionHeader}>
        <h2 className={styles.sectionTitle}>Certifications & Licenses</h2>
        <button onClick={openAddForm} className={styles.addButton}>
          + Add Certification
        </button>
      </div>

      <div className={styles.certificationsGrid}>
        {initialCertifications.map(cert => (
          <div key={cert.id} className={styles.certificationCard}>
            <div className={styles.certificationHeader}>
              <h3 className={styles.certificationName}>{cert.name}</h3>
            </div>
            
            <div className={styles.certificationIssuer}>{cert.issuer}</div>
            
            <div className={styles.certificationDates}>
              Issued: {formatDate(cert.issue_date)}
            </div>
            
            <p className={styles.certificationDesc}>{cert.description}</p>
            
            <div className={styles.badges}>
              <span className={styles.badge}>Order: {cert.display_order}</span>
              {cert.certificate_url && <span className={`${styles.badge} ${styles.fileBadge}`}>File Uploaded</span>}
            </div>
            
            {cert.certificate_url && (
              <div className={styles.previewImage}>
                {cert.certificate_url.toLowerCase().endsWith('.pdf') ? (
                  <div style={{ padding: '1rem', background: 'var(--bg-glass)', fontSize: '0.85rem' }}>📄 PDF Document</div>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={cert.certificate_url} alt="Certificate preview" />
                )}
              </div>
            )}

            <div className={styles.cardActions}>
              <button onClick={() => openEditForm(cert)} className={styles.editBtn}>Edit</button>
              <button onClick={() => confirmDelete(cert)} className={styles.deleteBtn}>Delete</button>
              {cert.certificate_url && (
                <a href={cert.certificate_url} target="_blank" rel="noopener noreferrer" className={styles.viewLink}>
                  View File →
                </a>
              )}
            </div>
          </div>
        ))}
        {initialCertifications.length === 0 && (
          <p style={{ color: 'var(--text-secondary)' }}>No certifications found. Add your first one!</p>
        )}
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>{editingCert ? "Edit Certification" : "Add Certification"}</h2>
              <button onClick={closeForm} className={styles.closeBtn}>×</button>
            </div>
            
            <form onSubmit={handleSave} className={styles.form}>
              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label htmlFor="name" className={styles.label}>Certification Name *</label>
                  <input id="name" name="name" type="text" value={formData.name} onChange={handleChange} className={styles.input} disabled={saving} placeholder="e.g. AWS Certified Solutions Architect" />
                </div>
                <div className={styles.inputGroup}>
                  <label htmlFor="issuer" className={styles.label}>Issuing Organization *</label>
                  <input id="issuer" name="issuer" type="text" value={formData.issuer} onChange={handleChange} className={styles.input} disabled={saving} placeholder="e.g. Amazon Web Services" />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label htmlFor="issue_date" className={styles.label}>Issue Date</label>
                  <input id="issue_date" name="issue_date" type="date" value={formData.issue_date} onChange={handleChange} className={styles.input} disabled={saving} />
                </div>
                <div className={styles.inputGroup}>
                  <label htmlFor="display_order" className={styles.label}>Display Order</label>
                  <input id="display_order" name="display_order" type="number" value={formData.display_order} onChange={handleChange} className={styles.input} disabled={saving} />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="credential_url" className={styles.label}>Credential URL (Optional verification link)</label>
                <input id="credential_url" name="credential_url" type="url" value={formData.credential_url} onChange={handleChange} className={styles.input} disabled={saving} placeholder="https://..." />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="description" className={styles.label}>Description</label>
                <textarea id="description" name="description" value={formData.description} onChange={handleChange} className={styles.textarea} disabled={saving} />
              </div>
              
              <div className={styles.inputGroup} style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1.5rem', marginTop: '0.5rem' }}>
                <label htmlFor="certificate_file" className={styles.label}>Certificate File Upload</label>
                <input 
                  id="certificate_file" 
                  name="certificate_file" 
                  type="file" 
                  accept="image/jpeg,image/png,application/pdf"
                  onChange={handleFileChange} 
                  className={styles.input} 
                  disabled={saving}
                  ref={fileInputRef}
                />
                <p className={styles.fileHelper}>
                  Supported: PDF, JPG, PNG (Max 10MB).
                  {editingCert?.certificate_url && " Uploading a new file will replace the existing one."}
                </p>
                {editingCert?.certificate_url && !selectedFile && (
                  <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--text-accent)' }}>
                    Current file: <a href={editingCert.certificate_url} target="_blank" rel="noopener noreferrer">View existing</a>
                  </div>
                )}
              </div>

              {error && <div className={styles.error}>{error}</div>}

              <div className={styles.modalFooter}>
                <button type="button" onClick={closeForm} className={styles.cancelBtn} disabled={saving}>Cancel</button>
                <button type="submit" className={styles.saveBtn} disabled={saving}>{saving ? "Saving..." : "Save Certification"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteOpen && deletingCert && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.modalContent} ${styles.deleteConfirm}`}>
            <h3>Confirm Deletion</h3>
            <p>Are you sure you want to delete <strong>{deletingCert.name}</strong>?</p>
            {deletingCert.certificate_url && (
              <p style={{ color: '#ef4444', fontSize: '0.9rem' }}>The associated certificate file will also be deleted.</p>
            )}
            {error && <div className={styles.error} style={{ marginBottom: "1rem" }}>{error}</div>}
            <div className={styles.deleteConfirmActions}>
              <button onClick={() => setIsDeleteOpen(false)} className={styles.cancelBtn} disabled={saving}>Cancel</button>
              <button onClick={handleDelete} className={styles.confirmDeleteBtn} disabled={saving}>
                {saving ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
