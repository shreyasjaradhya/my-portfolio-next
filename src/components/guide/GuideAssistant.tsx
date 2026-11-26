"use client";

import React, { useState, useEffect, useRef } from "react";
import styles from "./GuideAssistant.module.css";
import { DEFAULT_GUIDE_CONFIG } from "@/lib/ai/guideConfig";
import { AiIcon } from "@/components/SocialIcons";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export default function GuideAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [poolIndex, setPoolIndex] = useState(0);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-msg",
      role: "assistant",
      content: DEFAULT_GUIDE_CONFIG.welcomeMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const chatBodyRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll inside chat body without shifting the modal window position
  const scrollToBottom = () => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTo({
        top: chatBodyRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      textareaRef.current?.focus();
    }
  }, [isOpen, messages, isLoading]);

  // Prevent background page scrolling on mobile when Guide is open
  useEffect(() => {
    if (isOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [isOpen]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Robust close handler supporting both touch and click
  const handleClose = (e?: React.MouseEvent | React.TouchEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsOpen(false);
  };

  // Auto-resize textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 110)}px`;
    }
  };

  // Shuffle suggestion pool
  const handleShuffle = () => {
    setPoolIndex((prev) => (prev + 1) % DEFAULT_GUIDE_CONFIG.shufflePools.length);
  };

  // Clear conversation
  const handleClear = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: "assistant",
        content: DEFAULT_GUIDE_CONFIG.welcomeMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  // Send message
  const sendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    const userTimestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userMsgId = `user-${Date.now()}`;
    const userMessage: ChatMessage = {
      id: userMsgId,
      role: "user",
      content: query,
      timestamp: userTimestamp,
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsLoading(true);

    const assistantMsgId = `assistant-${Date.now()}`;
    const assistantTimestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    try {
      const response = await fetch("/api/guide/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error ${response.status}`);
      }

      // Stream the response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      // Add empty assistant bubble
      setMessages((prev) => [
        ...prev,
        {
          id: assistantMsgId,
          role: "assistant",
          content: "",
          timestamp: assistantTimestamp,
        },
      ]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          accumulated += chunk;

          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMsgId ? { ...msg, content: accumulated } : msg
            )
          );
        }
      } else {
        const text = await response.text();
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId ? { ...msg, content: text } : msg
          )
        );
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: `⚠️ ${err.message || "Guide could not connect to the assistant server. Please try asking again."}`,
          timestamp: assistantTimestamp,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Enter key (Shift+Enter for newline)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Simple Markdown renderer
  const renderFormattedContent = (content: string) => {
    const lines = content.split("\n");
    return lines.map((line, idx) => {
      // Heading ###
      if (line.startsWith("### ")) {
        return <h3 key={idx}>{parseInlineFormatting(line.replace("### ", ""))}</h3>;
      }
      if (line.startsWith("#### ")) {
        return <h4 key={idx}>{parseInlineFormatting(line.replace("#### ", ""))}</h4>;
      }
      // Bullet point * or -
      if (line.startsWith("* ") || line.startsWith("- ")) {
        return (
          <li key={idx} style={{ marginLeft: "1rem" }}>
            {parseInlineFormatting(line.replace(/^(\*|-)\s+/, ""))}
          </li>
        );
      }
      // Empty line
      if (!line.trim()) {
        return <div key={idx} style={{ height: "6px" }} />;
      }
      // Regular paragraph
      return <p key={idx}>{parseInlineFormatting(line)}</p>;
    });
  };

  // Helper for inline bold, links, code
  const parseInlineFormatting = (text: string) => {
    // Basic regex replacer for bold, inline code, and links
    const parts = text.split(/(\*\*.*?\*\*|`.*?`|\[.*?\]\(.*?\))/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return <code key={i}>{part.slice(1, -1)}</code>;
      }
      const linkMatch = part.match(/\[(.*?)\]\((.*?)\)/);
      if (linkMatch) {
        return (
          <a key={i} href={linkMatch[2]} target="_blank" rel="noopener noreferrer">
            {linkMatch[1]}
          </a>
        );
      }
      return part;
    });
  };

  const currentQuestions = DEFAULT_GUIDE_CONFIG.shufflePools[poolIndex] || DEFAULT_GUIDE_CONFIG.defaultQuestions;

  return (
    <>
      {/* 1. Floating Launch Button (Glittery Black Circular FAB Icon) */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={styles.floatingTrigger}
          aria-label="Ask Guide - AI Portfolio Assistant"
          title="Ask Guide - AI Portfolio Assistant"
        >
          <AiIcon size={24} className={styles.triggerIcon} />
          <span className={styles.floatingTooltip}>
            Ask Guide <span className={styles.statusDotPulse} />
          </span>
        </button>
      )}

      {/* 2. Chat Modal & Overlay */}
      {isOpen && (
        <div
          className={`${styles.modalBackdrop} ${isFullScreen ? styles.modalBackdropFullScreen : ""}`}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsOpen(false);
          }}
        >
          <div
            className={`${styles.chatWindow} ${isFullScreen ? styles.chatWindowFullScreen : ""}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="guide-agent-title"
          >
            {/* Header */}
            <div className={styles.chatHeader}>
              {/* Mobile Swipe/Tap Down Handle */}
              <div 
                className={styles.mobileCloseBar}
                onClick={handleClose}
                onTouchEnd={handleClose}
                aria-label="Tap to close Guide"
                role="button"
                tabIndex={0}
              >
                <div className={styles.mobileClosePill} />
              </div>

              <div className={styles.headerContentRow}>
                <div className={styles.headerLeft}>
                  <div className={styles.guideAvatarBadge}>
                    <AiIcon size={20} />
                  </div>
                  <div className={styles.headerText}>
                    <div className={styles.headerTitleRow}>
                      <h2 id="guide-agent-title" className={styles.agentName}>Guide</h2>
                      <span className={styles.statusIndicator}>
                        <span className={styles.statusDot} /> Online
                      </span>
                    </div>
                    <p className={styles.agentSubtitle}>AI Portfolio Assistant</p>
                  </div>
                </div>

                <div className={styles.headerActions}>
                  {/* Full Screen Toggle (Desktop Only) */}
                  <button
                    type="button"
                    onClick={() => setIsFullScreen((prev) => !prev)}
                    className={`${styles.headerBtn} ${styles.desktopOnlyBtn}`}
                    title={isFullScreen ? "Exit Full Screen" : "Full Screen Mode"}
                    aria-label="Toggle Full Screen"
                  >
                    {isFullScreen ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="4 14 10 14 10 20" />
                        <polyline points="20 10 14 10 14 4" />
                        <line x1="14" y1="10" x2="21" y2="3" />
                        <line x1="3" y1="21" x2="10" y2="14" />
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="15 3 21 3 21 9" />
                        <polyline points="9 21 3 21 3 15" />
                        <line x1="21" y1="3" x2="14" y2="10" />
                        <line x1="3" y1="21" x2="10" y2="14" />
                      </svg>
                    )}
                  </button>

                  {/* Close Button (Large High-Priority Touch Target) */}
                  <button
                    type="button"
                    onClick={handleClose}
                    onTouchEnd={handleClose}
                    className={`${styles.headerBtn} ${styles.closeBtn}`}
                    title="Close Guide"
                    aria-label="Close Guide"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Messages Body */}
            <div ref={chatBodyRef} className={styles.chatBody}>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`${styles.messageRow} ${
                    msg.role === "user" ? styles.messageRowUser : styles.messageRowAssistant
                  }`}
                >
                  {msg.role === "assistant" && (
                    <div className={styles.messageAvatar}>
                      <AiIcon size={15} />
                    </div>
                  )}

                  <div className={styles.messageContentWrapper}>
                    <div
                      className={`${styles.bubble} ${
                        msg.role === "user" ? styles.userBubble : styles.assistantBubble
                      }`}
                    >
                      {msg.role === "assistant" ? renderFormattedContent(msg.content) : msg.content}
                    </div>
                    <span className={styles.messageTimestamp}>{msg.timestamp}</span>
                  </div>
                </div>
              ))}

              {/* Typing animation when waiting */}
              {isLoading && (
                <div className={`${styles.messageRow} ${styles.messageRowAssistant}`}>
                  <div className={styles.messageAvatar}>
                    <AiIcon size={15} />
                  </div>
                  <div className={styles.typingIndicator}>
                    <div className={styles.dot} />
                    <div className={styles.dot} />
                    <div className={styles.dot} />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Inquiries (Pills + Shuffle) */}
            <div className={styles.suggestionsContainer}>
              <div className={styles.suggestionsHeader}>
                <span className={styles.suggestionsLabel}>Suggested Inquiries</span>
                <button
                  type="button"
                  onClick={handleShuffle}
                  className={styles.shuffleBtn}
                  title="Shuffle Suggestions"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="23 4 23 10 17 10" />
                    <polyline points="1 20 1 14 7 14" />
                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                  </svg>
                  <span>Shuffle</span>
                </button>
              </div>

              <div className={styles.suggestionsGrid}>
                {currentQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => sendMessage(q)}
                    disabled={isLoading}
                    className={styles.suggestionChip}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Message Input Toolbar */}
            <div className={styles.inputContainer}>
              <div className={styles.inputRow}>
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask Guide anything..."
                  rows={1}
                  className={styles.textarea}
                  disabled={isLoading}
                />

                <div className={styles.inputActions}>
                  {messages.length > 1 && (
                    <button
                      type="button"
                      onClick={handleClear}
                      className={styles.clearBtn}
                      title="Clear conversation"
                      aria-label="Clear conversation"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => sendMessage()}
                    disabled={!input.trim() || isLoading}
                    className={styles.sendBtn}
                    aria-label="Send message"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className={styles.inputFooterHint}>
                <span>Powered by verified portfolio intelligence</span>
                <span className={styles.desktopOnlyHint}>Enter ↵ to send • Shift+Enter for new line</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
