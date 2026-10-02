"use client";
import * as motion from "framer-motion/client";
import styles from "./Navbar.module.css";
import Link from "next/link";
import { useState } from "react";
import ThemeToggle from "./ThemeToggle";
import type { Profile } from "@/lib/supabase/types";

export default function Navbar({ profile }: { profile: Profile | null }) {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: "Home", href: "#home" },
    { name: "About", href: "#about" },
    { name: "Skills", href: "#skills" },
    { name: "Projects", href: "#projects" },
    { name: "Experience", href: "#experience" },
    { name: "Contact", href: "#contact" },
  ];

  return (
    <motion.nav 
      className={styles.navbar}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <div className={styles.container}>
        <div className={styles.logo}>
          <Link href="#home">{profile?.name?.toUpperCase() || "J SHREYAS ARADHYA"}</Link>
        </div>
        
        <div className={styles.desktopNav}>
          {navLinks.map((link) => (
            <Link key={link.name} href={link.href} className={styles.navLink}>
              {link.name}
            </Link>
          ))}
          {profile?.resume_url && (
            <a 
              href={profile.resume_url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className={styles.navLink}
            >
              Resume
            </a>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ThemeToggle />
          
          <button 
            className={styles.mobileMenuBtn} 
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle Menu"
          >
            <span className={styles.hamburger} style={{ background: isOpen ? 'transparent' : 'var(--text-primary)'}}>
               <span className={isOpen ? styles.cross1 : ''}></span>
               <span className={isOpen ? styles.cross2 : ''}></span>
            </span>
          </button>
        </div>
      </div>

      {isOpen && (
        <motion.div 
          className={styles.mobileNav}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
        >
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              href={link.href} 
              className={styles.mobileNavLink}
              onClick={() => setIsOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          {profile?.resume_url && (
            <a 
              href={profile.resume_url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className={styles.mobileNavLink}
              onClick={() => setIsOpen(false)}
            >
              Resume
            </a>
          )}
        </motion.div>
      )}
    </motion.nav>
  );
}