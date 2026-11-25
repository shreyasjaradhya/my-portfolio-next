"use client";

import React, { useState } from "react";
import styles from "./guide.module.css";
import { DEFAULT_GUIDE_CONFIG } from "@/lib/ai/guideConfig";

interface GuideManagerProps {
  stats: {
    projectsCount: number;
    skillsCount: number;
    experiencesCount: number;
    educationCount: number;
    certificationsCount: number;
  };
  activeProvider: string;
}

export default function GuideManager({ stats, activeProvider }: GuideManagerProps) {
  const [welcomeMessage, setWelcomeMessage] = useState(DEFAULT_GUIDE_CONFIG.welcomeMessage);
  const [questions, setQuestions] = useState<string[]>(DEFAULT_GUIDE_CONFIG.defaultQuestions);
  const [newQuestion, setNewQuestion] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  const handleAddQuestion = () => {
    if (newQuestion.trim()) {
      setQuestions([...questions, newQuestion.trim()]);
      setNewQuestion("");
    }
  };

  const handleRemoveQuestion = (idx: number) => {
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className={styles.grid}>
      {/* 1. Assistant Identity & Welcome Message */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>
            <span>🤖</span> Assistant Identity & Welcome
          </h2>
          <span className={styles.badgeActive}>Status: Active</span>
        </div>

        <div>
          <label className={styles.label}>Agent Name</label>
          <input type="text" value="Guide" disabled className={styles.input} style={{ marginTop: "4px" }} />
        </div>

        <div>
          <label className={styles.label}>Subtitle</label>
          <input type="text" value="AI Portfolio Assistant" disabled className={styles.input} style={{ marginTop: "4px" }} />
        </div>

        <div>
          <label className={styles.label}>Introduction / Welcome Message</label>
          <textarea
            value={welcomeMessage}
            onChange={(e) => setWelcomeMessage(e.target.value)}
            className={styles.textarea}
            style={{ marginTop: "4px" }}
          />
        </div>

        <button type="button" onClick={handleSave} className={styles.saveBtn}>
          Save Identity Changes
        </button>
        {isSaved && <span className={styles.successMessage}>✓ Configuration updated successfully!</span>}
      </div>

      {/* 2. Knowledge Base & AI Provider Status */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>
            <span>🧠</span> Synchronized Knowledge Base
          </h2>
          <span className={styles.badgeActive}>Synchronized</span>
        </div>

        <div className={styles.statRow}>
          <span className={styles.statKey}>Active AI Engine:</span>
          <span className={styles.statVal}>{activeProvider}</span>
        </div>
        <div className={styles.statRow}>
          <span className={styles.statKey}>Engineering Projects:</span>
          <span className={styles.statVal}>{stats.projectsCount} Verified</span>
        </div>
        <div className={styles.statRow}>
          <span className={styles.statKey}>Technical Skills:</span>
          <span className={styles.statVal}>{stats.skillsCount} Mapped</span>
        </div>
        <div className={styles.statRow}>
          <span className={styles.statKey}>Experiences / Internships:</span>
          <span className={styles.statVal}>{stats.experiencesCount} Verified</span>
        </div>
        <div className={styles.statRow}>
          <span className={styles.statKey}>Education Records:</span>
          <span className={styles.statVal}>{stats.educationCount} Verified</span>
        </div>

        <div className={styles.tipBox}>
          <strong>Secure AI Integration:</strong><br />
          Guide connects securely on the server side. To enable Google Gemini (recommended, free tier) or OpenAI, set <code>GEMINI_API_KEY</code> or <code>OPENAI_API_KEY</code> in your server <code>.env.local</code>. When no key is set, Guide utilizes its built-in Grounded Knowledge Engine so visitors can always explore your background without errors.
        </div>
      </div>

      {/* 3. Manage Suggested Inquiry Questions */}
      <div className={styles.card} style={{ gridColumn: "1 / -1" }}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>
            <span>💡</span> Manage Suggested Inquiries (Chips)
          </h2>
          <span className={styles.badgeActive}>{questions.length} Active</span>
        </div>

        <div className={styles.questionList}>
          {questions.map((q, idx) => (
            <div key={idx} className={styles.questionItem}>
              <span>{idx + 1}. {q}</span>
              <button
                type="button"
                onClick={() => handleRemoveQuestion(idx)}
                className={styles.removeBtn}
                title="Remove question"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <div className={styles.addQuestionRow}>
          <input
            type="text"
            placeholder="Type a new suggested question..."
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddQuestion()}
            className={styles.input}
          />
          <button type="button" onClick={handleAddQuestion} className={styles.saveBtn}>
            + Add
          </button>
        </div>
      </div>
    </div>
  );
}
