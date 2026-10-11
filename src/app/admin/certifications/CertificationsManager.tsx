/* eslint-disable */
"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import type { Certification } from "@/lib/supabase/types";
import styles from "./certifications.module.css";
import { revalidateHomepage } from "../actions";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_DOC_TYPES = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
const ALLOWED_LOGO_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/svg+xml"];

export default function CertificationsManager({ initialCertifications }: { initialCertifications: Certification[] }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  
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
    tags: "",
    callout: "",
    action_label: "View Experience →",
    issuer_logo_url: "",
    display_order: 0,
  });
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedLogoFile, setSelectedLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
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
      tags: "",
      callout: "",
      action_label: "View Experience →",
      issuer_logo_url: "",
      display_order: initialCertifications.length,
    });
    setSelectedFile(null);
    setSelectedLogoFile(null);
    setLogoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (logoInputRef.current) logoInputRef.current.value = "";
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
      tags: cert.tags?.join(", ") || "",
      callout: cert.callout || "",
      action_label: cert.action_label || "View Experience →",
      issuer_logo_url: cert.issuer_logo_url || "",
      display_order: cert.display_order,
    });
    setSelectedFile(null);
    setSelectedLogoFile(null);
    setLogoPreview(cert.issuer_logo_url || null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (logoInputRef.current) logoInputRef.current.value = "";
    setError(null);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setSelectedFile(null);
    setSelectedLogoFile(null);
    setLogoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (logoInputRef.current) logoInputRef.current.value = "";
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

    if (!ALLOWED_DOC_TYPES.includes(file.type)) {
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

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setError(null);
    if (!file) return;

    if (!ALLOWED_LOGO_TYPES.includes(file.type)) {
      setError("Invalid logo format. Only JPG, PNG, WEBP, and SVG images are allowed.");
      if (logoInputRef.current) logoInputRef.current.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Logo file is too large. Maximum size is 5 MB.");
      if (logoInputRef.current) logoInputRef.current.value = "";
      return;
    }

    setSelectedLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleRemoveLogo = () => {
    setSelectedLogoFile(null);
    setLogoPreview(null);
    setFormData(prev => ({ ...prev, issuer_logo_url: "" }));
    if (logoInputRef.current) logoInputRef.current.value = "";
  };

  const validateForm = () => {
    if (!formData.name.trim()) return "Certification Name is required.";
    if (!formData.issuer.trim()) return "Issuing Organization is required.";
    return null;
  };

  const extractStoragePath = (url: string | null): string | null => {
    if (!url) return null;
    const match = url.match(/\/storage\/v1\/object\/public\/certificates\/(.+)$/);
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
      let certificate_url = editingCert?.certificate_url || null;
      let finalLogoUrl: string | null = formData.issuer_logo_url?.trim() || null;

      // 1. Handle Certificate Document Upload
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const sanitizedName = formData.name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
        const uniquePath = `docs/${Date.now()}-${sanitizedName}.${fileExt}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("certificates")
          .upload(uniquePath, selectedFile);

        if (uploadError) throw new Error(`Document upload failed: ${uploadError.message}`);

        const { data: { publicUrl } } = supabase.storage
          .from("certificates")
          .getPublicUrl(uploadData.path);
          
        certificate_url = publicUrl;

        // Clean up old file
        if (editingCert?.certificate_url) {
          const oldPath = extractStoragePath(editingCert.certificate_url);
          if (oldPath) {
            try {
              await supabase.storage.from("certificates").remove([oldPath]);
            } catch (e) {
              console.warn("Could not delete old cert document:", e);
            }
          }
        }
      }

      // 2. Handle Logo / Photo Upload
      if (selectedLogoFile) {
        const fileExt = selectedLogoFile.name.split('.').pop()?.toLowerCase() || 'png';
        const sanitizedIssuer = formData.issuer.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
        const uniqueLogoPath = `logos/${Date.now()}-${sanitizedIssuer}.${fileExt}`;

        const { data: logoUploadData, error: logoUploadError } = await supabase.storage
          .from("certificates")
          .upload(uniqueLogoPath, selectedLogoFile);

        if (logoUploadError) throw new Error(`Logo upload failed: ${logoUploadError.message}`);

        const { data: { publicUrl: logoPublicUrl } } = supabase.storage
          .from("certificates")
          .getPublicUrl(logoUploadData.path);

        finalLogoUrl = logoPublicUrl;

        if (editingCert?.issuer_logo_url && editingCert.issuer_logo_url !== finalLogoUrl) {
          const oldLogoPath = extractStoragePath(editingCert.issuer_logo_url);
          if (oldLogoPath) {
            try {
              await supabase.storage.from("certificates").remove([oldLogoPath]);
            } catch (e) {
              console.warn("Could not remove old logo:", e);
            }
          }
        }
      } else if (!logoPreview && editingCert?.issuer_logo_url) {
        finalLogoUrl = null;
        const oldLogoPath = extractStoragePath(editingCert.issuer_logo_url);
        if (oldLogoPath) {
          try {
            await supabase.storage.from("certificates").remove([oldLogoPath]);
          } catch (e) {
            console.warn("Could not remove cleared logo:", e);
          }
        }
      }

      const tagsArray = formData.tags
        .split(",")
        .map(t => t.trim())
        .filter(t => t.length > 0);

      // 3. Save Database Record
      const payload: any = {
        name: formData.name.trim(),
        issuer: formData.issuer.trim(),
        issue_date: formData.issue_date || null,
        credential_url: formData.credential_url.trim() || null,
        certificate_url,
        description: formData.description.trim() || null,
        tags: tagsArray.length > 0 ? tagsArray : null,
        issuer_logo_url: finalLogoUrl,
        callout: formData.callout.trim() || null,
        action_label: formData.action_label.trim() || null,
        display_order: formData.display_order,
      };

      let saveError;

      if (editingCert) {
        const { error: dbError } = await supabase
          .from("certifications")
          .update(payload)
          .eq("id", editingCert.id);
        saveError = dbError;
      } else {
        const { error: dbError } = await supabase
          .from("certifications")
          .insert([payload]);
        saveError = dbError;
      }

      // If database reports any new column does not exist yet, strip and retry safely
      if (saveError && (
        saveError.message?.toLowerCase().includes("column") || 
        saveError.message?.toLowerCase().includes("tags") ||
        saveError.message?.toLowerCase().includes("issuer_logo_url")
      )) {
        delete payload.tags;
        delete payload.issuer_logo_url;
        delete payload.callout;
        delete payload.action_label;

        if (editingCert) {
          const { error: retryError } = await supabase
            .from("certifications")
            .update(payload)
            .eq("id", editingCert.id);
          saveError = retryError;
        } else {
          const { error: retryError } = await supabase
            .from("certifications")
            .insert([payload]);
          saveError = retryError;
        }
      }

      if (saveError) throw new Error(saveError.message);

      try {
        await revalidateHomepage();
      } catch (revalErr) {
        console.warn("Revalidation notice:", revalErr);
      }

      setIsFormOpen(false);
      setSelectedFile(null);
      setSelectedLogoFile(null);
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
      const { error: dbError } = await supabase
        .from("certifications")
        .delete()
        .eq("id", deletingCert.id);

      if (dbError) throw new Error(dbError.message);

      // Delete storage files if present
      if (deletingCert.certificate_url) {
        const oldPath = extractStoragePath(deletingCert.certificate_url);
        if (oldPath) {
          try {
            await supabase.storage.from("certificates").remove([oldPath]);
          } catch (e) {
            console.warn("Could not delete cert storage file:", e);
          }
        }
      }

      if (deletingCert.issuer_logo_url) {
        const oldLogoPath = extractStoragePath(deletingCert.issuer_logo_url);
        if (oldLogoPath) {
          try {
            await supabase.storage.from("certificates").remove([oldLogoPath]);
          } catch (e) {
            console.warn("Could not delete logo storage file:", e);
          }
        }
      }

      try {
        await revalidateHomepage();
      } catch (revalErr) {
        console.warn("Revalidation notice:", revalErr);
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

  const handleImportReferenceCerts = async () => {
    setSaving(true);
    setError(null);
    try {
      const referenceCerts = [
        {
          name: "MY Bharat Budget Quest 2026 – Final Round",
          issuer: "Ministry of Youth Affairs & Sports",
          issue_date: "2026-04-12",
          credential_url: "#experience",
          description: "Shortlisted out of over 12 lakh participants for the Final Round of MY Bharat Budget Quest 2026—a prestigious National-Level Virtual Dialogue with the Hon'ble Prime Minister of India, Shri Narendra Modi ji.",
          tags: ["National Round", "Virtual Dialogue", "Public Policy"],
          issuer_logo_url: "/logos/emblem_india.svg",
          callout: "Organized by Ministry of Youth Affairs & Sports",
          action_label: "View Experience →",
          display_order: 1
        },
        {
          name: "Certificate of Presentation – AIDE 2026",
          issuer: "IEEE & NMAMIT",
          issue_date: "2026-02-01",
          credential_url: "#projects",
          description: "Presented the research paper on machine learning for marketing prediction at the IEEE AIDE 2026 International Conference.",
          tags: ["Paper Presentation", "Research"],
          issuer_logo_url: "/logos/ieee.svg",
          callout: "Organized by IEEE & NMAMIT",
          action_label: "View Project →",
          display_order: 2
        },
        {
          name: "AIC Nitte Internship",
          issuer: "Atal Incubation Centre Nitte",
          issue_date: "2025-05-01",
          credential_url: "#experience",
          description: "Completed a hands-on internship at Atal Incubation Centre Nitte, gaining practical experience in tech innovation, startup incubation processes, and entrepreneurship.",
          tags: ["1 Event Photos", "Tech Innovation"],
          issuer_logo_url: "/logos/aim.svg",
          callout: "Completed in under 4 months.",
          action_label: "View Experience →",
          display_order: 3
        }
      ];

      for (const cert of referenceCerts) {
        const exists = initialCertifications.some(c => c.name.toLowerCase() === cert.name.toLowerCase());
        if (!exists) {
          let { error: insertErr } = await supabase.from("certifications").insert([cert]);
          if (insertErr && (insertErr.message?.toLowerCase().includes("column") || insertErr.message?.toLowerCase().includes("tags"))) {
            const simplified = {
              name: cert.name,
              issuer: cert.issuer,
              issue_date: cert.issue_date,
              credential_url: cert.credential_url,
              description: cert.description,
              display_order: cert.display_order
            };
            await supabase.from("certifications").insert([simplified]);
          }
        }
      }

      try {
        await revalidateHomepage();
      } catch (e) {
        console.warn("Revalidation warning:", e);
      }

      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to import reference certificates.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className={styles.actionHeader}>
        <h2 className={styles.sectionTitle}>Certificates & Achievements</h2>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {initialCertifications.length < 3 && (
            <button
              type="button"
              onClick={handleImportReferenceCerts}
              className={styles.secondaryButton}
              disabled={saving}
            >
              ⚡ Import 3 Reference Certificates
            </button>
          )}
          <button onClick={openAddForm} className={styles.addButton}>
            + Add Certificate
          </button>
        </div>
      </div>

      <div className={styles.certificationsGrid}>
        {initialCertifications.map(cert => (
          <div key={cert.id} className={styles.certificationCard}>
            {cert.issuer_logo_url && (
              <div className={styles.adminCardLogo}>
                <img src={cert.issuer_logo_url} alt={cert.issuer} className={styles.adminCardLogoImg} />
              </div>
            )}

            <div className={styles.certificationHeader}>
              <h3 className={styles.certificationName}>{cert.name}</h3>
            </div>
            
            <div className={styles.certificationIssuer}>{cert.issuer}</div>
            
            <div className={styles.certificationDates}>
              Completed: {formatDate(cert.issue_date)}
            </div>
            
            {cert.description && (
              <p className={styles.certificationDesc}>{cert.description}</p>
            )}

            {cert.tags && cert.tags.length > 0 && (
              <div className={styles.tagPills}>
                {cert.tags.map(t => (
                  <span key={t} className={styles.adminTag}>{t}</span>
                ))}
              </div>
            )}

            {cert.callout && (
              <div className={styles.adminCallout}>
                {cert.callout}
              </div>
            )}
            
            <div className={styles.badges}>
              <span className={styles.badge}>Order: {cert.display_order}</span>
              {cert.certificate_url && <span className={`${styles.badge} ${styles.fileBadge}`}>File Uploaded</span>}
            </div>

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
          <p style={{ color: 'var(--text-secondary)' }}>No certificates found. Add your first one!</p>
        )}
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>{editingCert ? "Edit Certificate" : "Add Certificate"}</h2>
              <button onClick={closeForm} className={styles.closeBtn}>&times;</button>
            </div>
            
            <form onSubmit={handleSave} className={styles.form}>
              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label htmlFor="name" className={styles.label}>Certificate Name *</label>
                  <input id="name" name="name" type="text" value={formData.name} onChange={handleChange} className={styles.input} disabled={saving} placeholder="e.g. MY Bharat Budget Quest 2026 – Final Round" />
                </div>
                <div className={styles.inputGroup}>
                  <label htmlFor="issuer" className={styles.label}>Issuing Organization / Institution *</label>
                  <input id="issuer" name="issuer" type="text" value={formData.issuer} onChange={handleChange} className={styles.input} disabled={saving} placeholder="e.g. Ministry of Youth Affairs & Sports" />
                </div>
              </div>

              {/* Upload Logo / Photo */}
              <div className={styles.uploadSection}>
                <label className={styles.label}>Organization / Issuer Logo</label>
                {logoPreview ? (
                  <div className={styles.logoPreviewWrapper}>
                    <img src={logoPreview} alt="Issuer logo preview" className={styles.logoPreviewImg} />
                    <div className={styles.overlayActions}>
                      <button
                        type="button"
                        onClick={() => logoInputRef.current?.click()}
                        className={styles.changePhotoBtn}
                        disabled={saving}
                      >
                        Change
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveLogo}
                        className={styles.removePhotoBtn}
                        disabled={saving}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className={styles.uploadDropzone} onClick={() => logoInputRef.current?.click()}>
                    <span className={styles.uploadPrompt}>Click to upload logo image</span>
                    <span className={styles.uploadSubtext}>JPG, PNG, WEBP, SVG (Max 5MB)</span>
                  </div>
                )}
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/svg+xml"
                  onChange={handleLogoChange}
                  style={{ display: "none" }}
                  disabled={saving}
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label htmlFor="issue_date" className={styles.label}>Completion Date</label>
                  <input id="issue_date" name="issue_date" type="date" value={formData.issue_date} onChange={handleChange} className={styles.input} disabled={saving} />
                </div>
                <div className={styles.inputGroup}>
                  <label htmlFor="display_order" className={styles.label}>Display Order</label>
                  <input id="display_order" name="display_order" type="number" value={formData.display_order} onChange={handleChange} className={styles.input} disabled={saving} />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="tags" className={styles.label}>Tags / Badges (comma separated)</label>
                <input id="tags" name="tags" type="text" value={formData.tags} onChange={handleChange} className={styles.input} disabled={saving} placeholder="e.g. National Round, Virtual Dialogue, Public Policy" />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="callout" className={styles.label}>Highlight Callout (blue italic text)</label>
                <input id="callout" name="callout" type="text" value={formData.callout} onChange={handleChange} className={styles.input} disabled={saving} placeholder="e.g. Organized by Ministry of Youth Affairs & Sports" />
              </div>

              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label htmlFor="action_label" className={styles.label}>Bottom Link Label</label>
                  <input id="action_label" name="action_label" type="text" value={formData.action_label} onChange={handleChange} className={styles.input} disabled={saving} placeholder="e.g. View Experience → or View Project →" />
                </div>
                <div className={styles.inputGroup}>
                  <label htmlFor="credential_url" className={styles.label}>Link Destination (URL or #section)</label>
                  <input id="credential_url" name="credential_url" type="text" value={formData.credential_url} onChange={handleChange} className={styles.input} disabled={saving} placeholder="e.g. #experience or https://..." />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="description" className={styles.label}>Description</label>
                <textarea id="description" name="description" value={formData.description} onChange={handleChange} className={styles.textarea} rows={3} disabled={saving} placeholder="Describe the certificate, achievement, or project..." />
              </div>
              
              {/* Document file upload */}
              <div className={styles.inputGroup} style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1.25rem' }}>
                <label htmlFor="certificate_file" className={styles.label}>Certificate Document / PDF</label>
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
                  <div style={{ marginTop: '0.4rem', fontSize: '0.85rem', color: 'var(--text-accent)' }}>
                    Current document: <a href={editingCert.certificate_url} target="_blank" rel="noopener noreferrer">View existing</a>
                  </div>
                )}
              </div>

              {error && <div className={styles.error}>{error}</div>}

              <div className={styles.modalFooter}>
                <button type="button" onClick={closeForm} className={styles.cancelBtn} disabled={saving}>Cancel</button>
                <button type="submit" className={styles.saveBtn} disabled={saving}>{saving ? "Saving..." : "Save Certificate"}</button>
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
