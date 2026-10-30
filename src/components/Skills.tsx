"use client";

import { motion } from "framer-motion";
import styles from "./Skills.module.css";
import type { Skill } from "@/lib/supabase/types";
import {
  PythonLogo,
  CLogo,
  JavaLogo,
  VerilogLogo,
  VLSILogo,
  DigitalElectronicsLogo,
  FPGALogo,
  MatlabLogo,
  VivadoLogo,
  KiCadLogo,
  LTspiceLogo,
  ArduinoLogo,
  MicrocontrollerLogo,
  PCBDesignLogo,
  EmbeddedSystemsLogo,
} from "./TechLogos";

// Helper to match skill names with official SVG tech logos
function getSkillLogo(name: string) {
  const n = name.toLowerCase();
  if (n.includes("verilog")) return VerilogLogo;
  if (n.includes("vlsi")) return VLSILogo;
  if (n.includes("fpga")) return FPGALogo;
  if (n.includes("digital")) return DigitalElectronicsLogo;
  if (n.includes("microcontroller")) return MicrocontrollerLogo;
  if (n.includes("embedded")) return EmbeddedSystemsLogo;
  if (n.includes("pcb")) return PCBDesignLogo;
  if (n.includes("arduino")) return ArduinoLogo;
  if (n.includes("matlab")) return MatlabLogo;
  if (n.includes("vivado")) return VivadoLogo;
  if (n.includes("kicad")) return KiCadLogo;
  if (n.includes("spice")) return LTspiceLogo;
  if (n.includes("python")) return PythonLogo;
  if (n === "c" || n.startsWith("c ") || n.includes(" c ")) return CLogo;
  if (n.includes("java")) return JavaLogo;
  return null;
}

// Canonical fallback data when database has no records
const DEFAULT_SKILL_GROUPS: Record<string, string[]> = {
  "Hardware & VLSI": [
    "VLSI Design",
    "Verilog / SystemVerilog",
    "FPGA Development",
    "Digital Electronics",
    "Hardware Verification",
  ],
  "Embedded Systems": [
    "Microcontrollers",
    "Embedded Systems",
    "PCB Design",
    "Arduino",
  ],
  "Tools & Software": [
    "Xilinx Vivado",
    "MATLAB",
    "KiCad",
    "LTSpice",
  ],
  "Programming": [
    "Python",
    "C",
    "Java",
  ],
};

export default function Skills({ skills }: { skills?: Skill[] }) {
  // Group skills by category from database, or use default groups
  let groupedSkills: Record<string, Array<{ id: string; name: string }>> = {};

  if (skills && skills.length > 0) {
    groupedSkills = skills.reduce((acc, skill) => {
      const category = skill.category || "General";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push({ id: skill.id, name: skill.name });
      return acc;
    }, {} as Record<string, Array<{ id: string; name: string }>>);
  } else {
    groupedSkills = Object.entries(DEFAULT_SKILL_GROUPS).reduce(
      (acc, [category, skillNames]) => {
        acc[category] = skillNames.map((name, i) => ({
          id: `${category}-${i}`,
          name,
        }));
        return acc;
      },
      {} as Record<string, Array<{ id: string; name: string }>>
    );
  }

  const categories = Object.keys(groupedSkills);

  if (categories.length === 0) return null;

  return (
    <section id="skills" className={styles.skillsSection}>
      <div className={styles.container}>
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <div className={styles.subtitle}>// Technical Expertise</div>
          <h2 className={styles.heading}>Technical Skills.</h2>
        </motion.div>

        <div className={styles.grid}>
          {categories.map((category, idx) => (
            <motion.div
              key={category}
              className={styles.card}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: 0.1 * idx }}
              whileHover={{ y: -5 }}
            >
              <div className={styles.cardTitle}>
                <span>{category}</span>
                <span className={styles.categoryTag}>
                  {groupedSkills[category].length} Skills
                </span>
              </div>
              <ul className={styles.list}>
                {groupedSkills[category].map((skill) => {
                  const Logo = getSkillLogo(skill.name);
                  return (
                    <li key={skill.id} className={styles.listItem}>
                      {Logo ? (
                        <span className={styles.iconWrap}>
                          <Logo size={18} />
                        </span>
                      ) : (
                        <span className={styles.bullet} />
                      )}
                      <span>{skill.name}</span>
                    </li>
                  );
                })}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
