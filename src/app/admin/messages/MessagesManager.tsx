"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import type { Message } from "@/lib/supabase/types";
import styles from "./messages.module.css";

type FilterStatus = 'all' | 'unread' | 'read' | 'archived';

export default function MessagesManager({ initialMessages }: { initialMessages: Message[] }) {
  const router = useRouter();
  
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredMessages = initialMessages.filter(msg => {
    if (filter === 'all') return true;
    return msg.status === filter;
  });

  const openMessage = (msg: Message) => {
    setSelectedMessage(msg);
    setError(null);
  };

  const closeMessage = () => {
    setSelectedMessage(null);
  };

  const confirmDelete = () => {
    setIsDeleteOpen(true);
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!selectedMessage) return;
    setUpdating(true);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from('messages')
        .update({ status: newStatus })
        .eq('id', selectedMessage.id);

      if (updateError) throw new Error(updateError.message);

      setSelectedMessage({ ...selectedMessage, status: newStatus });
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'An error occurred while updating status.');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedMessage) return;
    setUpdating(true);
    setError(null);

    try {
      const { error: deleteError } = await supabase
        .from('messages')
        .delete()
        .eq('id', selectedMessage.id);

      if (deleteError) throw new Error(deleteError.message);

      setIsDeleteOpen(false);
      setSelectedMessage(null);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'An error occurred while deleting.');
      setIsDeleteOpen(false); // Close delete modal to show error on detail modal
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <div className={styles.actionHeader}>
        <h2 className={styles.sectionTitle}>Inbox</h2>
        <div className={styles.filters}>
          <button 
            className={`${styles.filterBtn} ${filter === 'all' ? styles.filterBtnActive : ''}`} 
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button 
            className={`${styles.filterBtn} ${filter === 'unread' ? styles.filterBtnActive : ''}`} 
            onClick={() => setFilter('unread')}
          >
            Unread
          </button>
          <button 
            className={`${styles.filterBtn} ${filter === 'read' ? styles.filterBtnActive : ''}`} 
            onClick={() => setFilter('read')}
          >
            Read
          </button>
          <button 
            className={`${styles.filterBtn} ${filter === 'archived' ? styles.filterBtnActive : ''}`} 
            onClick={() => setFilter('archived')}
          >
            Archived
          </button>
        </div>
      </div>

      <div className={styles.messagesList}>
        {filteredMessages.map(msg => (
          <div 
            key={msg.id} 
            className={`${styles.messageCard} ${msg.status === 'unread' ? styles.messageCardUnread : ''}`}
            onClick={() => openMessage(msg)}
          >
            <div className={styles.messageHeader}>
              <div className={styles.senderInfo}>
                <span className={styles.senderName}>{msg.name}</span>
                <span className={styles.senderEmail}>{msg.email}</span>
              </div>
              <div className={styles.messageMeta}>
                <span className={styles.messageDate}>{formatDate(msg.created_at)}</span>
                <div className={styles.badges}>
                  <span className={`${styles.badge} ${
                    msg.status === 'unread' ? styles.badgeUnread :
                    msg.status === 'read' ? styles.badgeRead :
                    styles.badgeArchived
                  }`}>
                    {msg.status}
                  </span>
                </div>
              </div>
            </div>
            
            {msg.subject && <div className={styles.messageSubject}>{msg.subject}</div>}
            
            <p className={styles.messagePreview}>{msg.message}</p>
          </div>
        ))}
        {filteredMessages.length === 0 && (
          <p style={{ color: 'var(--text-secondary)' }}>No messages found.</p>
        )}
      </div>

      {/* Message Detail Modal */}
      {selectedMessage && !isDeleteOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>Message Details</h2>
              <button onClick={closeMessage} className={styles.closeBtn}>×</button>
            </div>
            
            <div className={styles.detailBody}>
              <div className={styles.detailInfo}>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>From:</span>
                  <span className={styles.detailValue}><strong>{selectedMessage.name}</strong> &lt;{selectedMessage.email}&gt;</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Date:</span>
                  <span className={styles.detailValue}>{formatDate(selectedMessage.created_at)}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Status:</span>
                  <span className={`${styles.badge} ${
                    selectedMessage.status === 'unread' ? styles.badgeUnread :
                    selectedMessage.status === 'read' ? styles.badgeRead :
                    styles.badgeArchived
                  }`}>
                    {selectedMessage.status}
                  </span>
                </div>
                {selectedMessage.subject && (
                  <div className={styles.detailSubject}>Subject: {selectedMessage.subject}</div>
                )}
              </div>
              
              <div className={styles.detailMessage}>
                {selectedMessage.message}
              </div>

              {error && <div className={styles.error}>{error}</div>}
            </div>

            <div className={styles.modalFooter}>
              <div className={styles.footerLeft}>
                <select 
                  className={styles.statusSelect}
                  value={selectedMessage.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  disabled={updating}
                >
                  <option value="unread">Mark as Unread</option>
                  <option value="read">Mark as Read</option>
                  <option value="archived">Archive</option>
                </select>
                <button onClick={confirmDelete} className={`${styles.actionBtn} ${styles.deleteBtn}`} disabled={updating}>
                  Delete
                </button>
              </div>
              <div className={styles.footerRight}>
                <button onClick={closeMessage} className={styles.actionBtn} disabled={updating}>Close</button>
                <a 
                  href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(selectedMessage.subject || 'Your message')}`}
                  className={`${styles.actionBtn} ${styles.replyBtn}`}
                >
                  Reply
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteOpen && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.modalContent} ${styles.deleteConfirm}`}>
            <h3>Confirm Deletion</h3>
            <p>Are you sure you want to delete this message? This action cannot be undone.</p>
            <div className={styles.deleteConfirmActions}>
              <button onClick={() => setIsDeleteOpen(false)} className={styles.actionBtn} disabled={updating}>Cancel</button>
              <button onClick={handleDelete} className={styles.confirmDeleteBtn} disabled={updating}>
                {updating ? "Deleting..." : "Delete Message"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
