/* eslint-disable */
"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import type { Testimonial, TestimonialStatus } from "@/lib/supabase/types";
import styles from "./testimonials.module.css";
import {
  approveTestimonial,
  rejectTestimonial,
  deleteTestimonialAdmin,
  updateTestimonialAdmin,
  createTestimonialAdmin,
} from "@/app/actions/testimonials";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export default function TestimonialsManager({
  initialTestimonials,
}: {
  initialTestimonials: Testimonial[];
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [testimonials, setTestimonials] = useState<Testimonial[]>(initialTestimonials);
  useEffect(() => {
    setTestimonials(initialTestimonials);
  }, [initialTestimonials]);

  // Tab state: 'pending' | 'approved' | 'rejected'
  const [activeTab, setActiveTab] = useState<TestimonialStatus>("pending");
  const [searchQuery, setSearchQuery] = useState("");

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
    linkedin_url: "",
    website_url: "",
    status: "approved" as TestimonialStatus,
    display_order: 0,
  });

  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Derive counts for tabs
  const pendingCount = useMemo(
    () => testimonials.filter((t) => t.status === "pending" || !t.status).length,
    [testimonials]
  );
  const approvedCount = useMemo(
    () => testimonials.filter((t) => t.status === "approved").length,
    [testimonials]
  );
  const rejectedCount = useMemo(
    () => testimonials.filter((t) => t.status === "rejected").length,
    [testimonials]
  );

  // Filter testimonials based on active tab and search query
  const filteredTestimonials = useMemo(() => {
    return testimonials.filter((t) => {
      // Status matching: treat missing status as 'pending' for safety
      const currentStatus = t.status || "pending";
      if (currentStatus !== activeTab) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        t.name?.toLowerCase().includes(q) ||
        t.role?.toLowerCase().includes(q) ||
        t.company?.toLowerCase().includes(q) ||
        t.content?.toLowerCase().includes(q) ||
        t.email?.toLowerCase().includes(q)
      );
    });
  }, [initialTestimonials, activeTab, searchQuery]);

  const getInitials = (name: string) => {
    return name
      .trim()
      .split(/\s+/)
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase() || "U";
  };

  const openAddForm = () => {
    setEditingTestimonial(null);
    setFormData({
      name: "",
      role: "",
      company: "",
      content: "",
      rating: "5",
      linkedin_url: "",
      website_url: "",
      status: "approved",
      display_order: initialTestimonials.length + 1,
    });
    setSelectedImageFile(null);
    setImagePreview(null);
    setUploadStatus(null);
    setError(null);
    setSuccessMsg(null);
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
      linkedin_url: testimonial.linkedin_url || "",
      website_url: testimonial.website_url || "",
      status: testimonial.status || "approved",
      display_order: testimonial.display_order,
    });
    setSelectedImageFile(null);
    setImagePreview(testimonial.avatar_url || null);
    setUploadStatus(null);
    setError(null);
    setSuccessMsg(null);
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

  // Image selection handling
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

  // Quick Action: Approve (Instant 0ms feedback)
  const handleQuickApprove = async (id: string) => {
    setActionLoadingId(id);
    setError(null);
    const previous = [...testimonials];

    // Optimistic status update in 0ms
    setTestimonials((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: "approved" as TestimonialStatus } : t))
    );
    setSuccessMsg("Testimonial approved successfully and published to live portfolio.");

    try {
      const res = await approveTestimonial(id);
      if (!res.success) {
        setTestimonials(previous);
        throw new Error(res.error);
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to approve testimonial.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Quick Action: Reject (Instant 0ms feedback)
  const handleQuickReject = async (id: string) => {
    setActionLoadingId(id);
    setError(null);
    const previous = [...testimonials];

    // Optimistic status update in 0ms
    setTestimonials((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: "rejected" as TestimonialStatus } : t))
    );
    setSuccessMsg("Testimonial rejected and hidden from live portfolio.");

    try {
      const res = await rejectTestimonial(id);
      if (!res.success) {
        setTestimonials(previous);
        throw new Error(res.error);
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to reject testimonial.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Modal Save (Add or Edit)
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

      // Photo upload or removal
      if (selectedImageFile) {
        setUploadStatus("Uploading photo to secure storage...");
        const uploadedUrl = await uploadAvatar(selectedImageFile, formData.name);
        if (editingTestimonial?.avatar_url && editingTestimonial.avatar_url !== uploadedUrl) {
          await removeAvatarFromStorage(editingTestimonial.avatar_url);
        }
        finalAvatarUrl = uploadedUrl;
      } else if (!imagePreview && editingTestimonial?.avatar_url) {
        await removeAvatarFromStorage(editingTestimonial.avatar_url);
        finalAvatarUrl = null;
      }

      setUploadStatus("Saving changes...");

      if (editingTestimonial) {
        const res = await updateTestimonialAdmin(editingTestimonial.id, {
          name: formData.name,
          role: formData.role,
          company: formData.company,
          content: formData.content,
          rating: ratingVal,
          avatar_url: finalAvatarUrl,
          linkedin_url: formData.linkedin_url,
          website_url: formData.website_url,
          status: formData.status,
          display_order: formData.display_order,
        });

        if (!res.success) throw new Error(res.error);
      } else {
        const res = await createTestimonialAdmin({
          name: formData.name,
          role: formData.role,
          company: formData.company,
          content: formData.content,
          rating: ratingVal,
          avatar_url: finalAvatarUrl,
          linkedin_url: formData.linkedin_url,
          website_url: formData.website_url,
          display_order: formData.display_order,
        });

        if (!res.success) throw new Error(res.error);
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

  // Permanent Delete (Instant 0ms feedback)
  const handleDelete = async () => {
    if (!deletingId) return;
    const targetId = deletingId;
    const itemToDelete = testimonials.find((t) => t.id === targetId);
    const previous = [...testimonials];

    // Optimistic removal in 0ms
    setTestimonials((prev) => prev.filter((t) => t.id !== targetId));
    closeDelete();
    setDeletingId(null);

    try {
      const res = await deleteTestimonialAdmin(targetId);
      if (!res.success) {
        setTestimonials(previous);
        throw new Error(res.error);
      }

      if (itemToDelete?.avatar_url) {
        removeAvatarFromStorage(itemToDelete.avatar_url).catch(console.warn);
      }

      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to delete testimonial.");
    }
  };

  return (
    <>
      {/* Action Header */}
      <div className={styles.actionHeader}>
        <div>
          <h2 className={styles.sectionTitle}>Testimonials Moderation</h2>
          <p className={styles.sectionSubtitle}>
            Review visitor submissions, approve authentic recommendations, and manage public displays
          </p>
        </div>
        <button onClick={openAddForm} className={styles.addButton}>
          + Add Testimonial
        </button>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className={styles.successBanner}>
          <span>✓ {successMsg}</span>
          <button onClick={() => setSuccessMsg(null)} className={styles.bannerClose}>
            &times;
          </button>
        </div>
      )}
      {error && !isFormOpen && !isDeleteOpen && (
        <div className={styles.errorBanner}>{error}</div>
      )}

      {/* Tab Navigation: Pending, Approved, Rejected */}
      <div className={styles.tabsRow}>
        <div className={styles.tabsList} role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "pending"}
            onClick={() => setActiveTab("pending")}
            className={`${styles.tabBtn} ${activeTab === "pending" ? styles.activeTabPending : ""}`}
          >
            <span>Pending Review</span>
            <span className={`${styles.tabBadge} ${pendingCount > 0 ? styles.badgePending : ""}`}>
              {pendingCount}
            </span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "approved"}
            onClick={() => setActiveTab("approved")}
            className={`${styles.tabBtn} ${activeTab === "approved" ? styles.activeTabApproved : ""}`}
          >
            <span>Approved & Live</span>
            <span className={`${styles.tabBadge} ${styles.badgeApproved}`}>{approvedCount}</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "rejected"}
            onClick={() => setActiveTab("rejected")}
            className={`${styles.tabBtn} ${activeTab === "rejected" ? styles.activeTabRejected : ""}`}
          >
            <span>Rejected / Hidden</span>
            <span className={styles.tabBadge}>{rejectedCount}</span>
          </button>
        </div>

        {/* Search input */}
        <div className={styles.searchBox}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search testimonials..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>

      {/* Testimonials List Grid */}
      <div className={styles.testimonialsGrid}>
        {filteredTestimonials.map((item) => {
          const status = item.status || "pending";
          const formattedDate = item.created_at
            ? new Date(item.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            : null;

          return (
            <div key={item.id} className={styles.card}>
              {/* Card Header */}
              <div className={styles.cardHeader}>
                <div className={styles.cardUserGroup}>
                  {item.avatar_url ? (
                    <img
                      src={item.avatar_url}
                      alt={`${item.name}'s photo`}
                      className={styles.cardAvatar}
                    />
                  ) : (
                    <div className={styles.cardAvatarFallback}>{getInitials(item.name)}</div>
                  )}

                  <div className={styles.cardUserInfo}>
                    <div className={styles.nameStatusRow}>
                      <h3 className={styles.cardName}>{item.name}</h3>
                      <span
                        className={`${styles.statusBadge} ${
                          status === "approved"
                            ? styles.statusApproved
                            : status === "rejected"
                            ? styles.statusRejected
                            : styles.statusPending
                        }`}
                      >
                        {status.toUpperCase()}
                      </span>
                    </div>

                    {(item.role || item.company) && (
                      <div className={styles.cardRoleCompany}>
                        {item.role} {item.role && item.company && "•"} {item.company}
                      </div>
                    )}

                    {item.email && (
                      <a href={`mailto:${item.email}`} className={styles.cardEmail}>
                        {item.email}
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Testimonial Quote Message */}
              <p className={styles.cardContent}>"{item.content}"</p>

              {/* Links & Meta Badges */}
              <div className={styles.cardMetaRow}>
                <div className={styles.linksGroup}>
                  {item.linkedin_url && (
                    <a
                      href={item.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.linkPill}
                      title="View LinkedIn Profile"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                      </svg>
                      LinkedIn
                    </a>
                  )}
                  {item.website_url && (
                    <a
                      href={item.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.linkPill}
                      title="View Website"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="2" y1="12" x2="22" y2="12" />
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                      </svg>
                      Website
                    </a>
                  )}
                  {item.rating && (
                    <span className={styles.ratingBadge}>★ {item.rating} / 5</span>
                  )}
                </div>

                {formattedDate && <span className={styles.dateLabel}>{formattedDate}</span>}
              </div>

              {/* Action Buttons */}
              <div className={styles.cardActions}>
                {status === "pending" && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleQuickApprove(item.id)}
                      disabled={actionLoadingId === item.id}
                      className={styles.approveBtn}
                    >
                      {actionLoadingId === item.id ? "Processing..." : "✓ Approve"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickReject(item.id)}
                      disabled={actionLoadingId === item.id}
                      className={styles.rejectBtn}
                    >
                      Reject
                    </button>
                  </>
                )}

                {status === "approved" && (
                  <button
                    type="button"
                    onClick={() => handleQuickReject(item.id)}
                    disabled={actionLoadingId === item.id}
                    className={styles.rejectBtn}
                  >
                    Unpublish
                  </button>
                )}

                {status === "rejected" && (
                  <button
                    type="button"
                    onClick={() => handleQuickApprove(item.id)}
                    disabled={actionLoadingId === item.id}
                    className={styles.approveBtn}
                  >
                    Approve
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => openEditForm(item)}
                  className={styles.editBtn}
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => confirmDelete(item.id)}
                  className={styles.deleteBtn}
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}

        {filteredTestimonials.length === 0 && (
          <div className={styles.emptyCardState}>
            <p>
              {searchQuery
                ? `No ${activeTab} testimonials match your search.`
                : `No ${activeTab} testimonials found in this tab.`}
            </p>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
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
              {/* Photo Upload & Preview */}
              <div className={styles.inputGroup}>
                <label className={styles.label}>Profile Photo</label>
                <div className={styles.photoUploadSection}>
                  <div className={styles.avatarPreviewWrapper}>
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className={styles.avatarPreviewImg} />
                    ) : (
                      <div className={styles.avatarPlaceholder}>
                        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
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
                      id="admin-photo-input"
                      disabled={saving}
                    />

                    <div className={styles.uploadActionBtns}>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className={styles.uploadBtn}
                        disabled={saving}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
                    <p className={styles.uploadHint}>JPG, PNG, WebP up to 5MB.</p>
                  </div>
                </div>
              </div>

              {/* Name */}
              <div className={styles.inputGroup}>
                <label className={styles.label}>Full Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. John Doe"
                  required
                  disabled={saving}
                  className={styles.input}
                />
              </div>

              {/* Role & Company */}
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
                    placeholder="e.g. Google"
                    disabled={saving}
                    className={styles.input}
                  />
                </div>
              </div>

              {/* Content */}
              <div className={styles.inputGroup}>
                <label className={styles.label}>Testimonial Content *</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={4}
                  placeholder="Testimonial quote text..."
                  required
                  disabled={saving}
                  className={styles.textarea}
                />
              </div>

              {/* LinkedIn & Website */}
              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>LinkedIn URL</label>
                  <input
                    type="url"
                    value={formData.linkedin_url}
                    onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                    placeholder="https://linkedin.com/in/username"
                    disabled={saving}
                    className={styles.input}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Website URL</label>
                  <input
                    type="url"
                    value={formData.website_url}
                    onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                    placeholder="https://example.com"
                    disabled={saving}
                    className={styles.input}
                  />
                </div>
              </div>

              {/* Status & Display Order */}
              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Moderation Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value as TestimonialStatus })
                    }
                    disabled={saving}
                    className={styles.input}
                  >
                    <option value="pending">Pending Review</option>
                    <option value="approved">Approved & Published</option>
                    <option value="rejected">Rejected / Hidden</option>
                  </select>
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Rating (1-5)</label>
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
              </div>

              {uploadStatus && (
                <div className={styles.uploadStatus}>
                  <div className={styles.spinner} />
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
                <button type="submit" className={styles.saveBtn} disabled={saving}>
                  {saving ? "Saving..." : editingTestimonial ? "Save Changes" : "Create Testimonial"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteOpen && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.modalContent} ${styles.deleteConfirm}`}>
            <h3>Confirm Permanent Deletion</h3>
            <p>
              Are you sure you want to permanently delete this testimonial? This action cannot be undone.
            </p>

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
