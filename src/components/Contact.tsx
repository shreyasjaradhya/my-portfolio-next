"use client";

import { useState } from "react";
import * as motion from "framer-motion/client";
import styles from "./Contact.module.css";
import type { Profile } from "@/lib/supabase/types";
import { supabase } from "@/lib/supabase/client";

export default function Contact({ profile }: { profile: Profile | null }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (status === "error") {
      setStatus("idle");
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) return "Name is required.";
    if (!formData.email.trim()) return "Email is required.";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) return "Please enter a valid email address.";
    if (!formData.message.trim()) return "Message is required.";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setErrorMessage(validationError);
      setStatus("error");
      return;
    }

    setStatus("submitting");
    setErrorMessage("");

    try {
      const { error } = await supabase.from("messages").insert([
        {
          name: formData.name.trim(),
          email: formData.email.trim(),
          subject: formData.subject.trim() || null,
          message: formData.message.trim(),
          status: "unread",
        },
      ]);

      if (error) throw new Error(error.message);

      setStatus("success");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (err: any) {
      console.error("Submission error:", err);
      setErrorMessage("Failed to send message. Please try again later.");
      setStatus("error");
    }
  };

  return (
    <section id="contact" className={styles.contactSection}>
      <motion.div 
        className={styles.container}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
      >
        <h2 className={styles.heading}>Let's build something.</h2>
        <p className={styles.text}>
          Interested in hardware, VLSI, FPGA or intelligent embedded systems? Let's connect.
        </p>
        
        <div className={styles.buttonGroup}>
          {profile?.email && (
            <a href={`mailto:${profile.email}`} className={styles.primaryBtn}>
              Direct Email
            </a>
          )}
          {profile?.github_url && (
            <a href={profile.github_url} target="_blank" rel="noopener noreferrer" className={styles.secondaryBtn}>
              GitHub
            </a>
          )}
          {profile?.linkedin_url && (
            <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className={styles.secondaryBtn}>
              LinkedIn
            </a>
          )}
        </div>

        <div className={styles.formContainer}>
          {status === "success" && (
            <div className={styles.successMsg}>
              Message sent successfully. Thank you for reaching out!
            </div>
          )}
          
          {status === "error" && (
            <div className={styles.errorMsg}>
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="name" className={styles.label}>Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={styles.input}
                disabled={status === "submitting"}
                placeholder="Your Name"
                required
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.label}>Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={styles.input}
                disabled={status === "submitting"}
                placeholder="your.email@example.com"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="subject" className={styles.label}>Subject (Optional)</label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className={styles.input}
                disabled={status === "submitting"}
                placeholder="What is this regarding?"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="message" className={styles.label}>Message *</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                className={styles.textarea}
                disabled={status === "submitting"}
                placeholder="Write your message here..."
                required
              />
            </div>

            <button 
              type="submit" 
              className={styles.submitBtn}
              disabled={status === "submitting"}
            >
              {status === "submitting" ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>
      </motion.div>
    </section>
  );
}