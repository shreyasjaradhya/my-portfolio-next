import type { Project } from "@/lib/supabase/types";

export interface ReportMetaItem {
  label: string;
  value: string;
}

export interface ReportStage {
  step: string;
  title: string;
  detail: string;
}

export interface ReportSpecRow {
  parameter: string;
  formulaOrMethod?: string;
  targetValue: string;
  notes?: string;
}

export interface ReportTestCase {
  name: string;
  inputCondition: string;
  expectedOutcome: string;
  observedResult: string;
}

export interface ReportSectionBlock {
  heading: string;
  summary?: string;
  bullets?: string[];
}

export interface ProjectReport {
  slug: string;
  category: string;
  documentType: string;
  subtitle: string;
  courseOrContext: string;
  dateLabel: string;
  authors: string[];
  mentorOrDept?: string;
  abstract: string;
  aimOrProblem: string;
  metadata: ReportMetaItem[];
  architectureStages: ReportStage[];
  designSpecs?: {
    title: string;
    rows: ReportSpecRow[];
  };
  componentsOrStack: {
    name: string;
    purpose: string;
  }[];
  testAndSimulation?: {
    title: string;
    tools: string[];
    cases: ReportTestCase[];
    observations: string[];
  };
  deepDiveSections: ReportSectionBlock[];
  achievementsOrOutcomes: string[];
  futureScope: string[];
  references?: { label: string; detail: string; url?: string }[];
}

export const PROJECT_REPORTS: Record<string, ProjectReport> = {
  "frequency-selective-circuit": {
    slug: "frequency-selective-circuit",
    category: "Analog Electronics Circuits (AEC)",
    documentType: "Project Report • 19 Pages (Theory, LTspice & Hardware)",
    subtitle:
      "Design, LTspice simulation, and Zero PCB implementation of a dual-band frequency detector with mutually exclusive LED-1 (0–5 kHz) and LED-2 (6–12 kHz) indicators.",
    courseOrContext: "Analog Electronics Circuits (AEC) — NMAM Institute of Technology, Nitte",
    dateLabel: "March 2026",
    authors: [
      "J Shreyas Aradhya (NNM24EC065)",
      "Jayanth (NNM24EC066)",
      "J Anvidh (NNM24EC064)",
    ],
    mentorOrDept: "Department of Electronics & Communication Engineering",
    abstract:
      "This project implements and verifies a single-input analog frequency-selective circuit capable of classifying sinusoidal signals across two distinct frequency bands and driving visual LED indicators. A passive Low-Pass Filter (0–5 kHz) and a cascaded Band-Pass Filter (6–12 kHz) separate the input spectrum. Op-Amp buffer stages, Schottky diode peak detectors, and threshold comparators convert filtered AC amplitudes into stable DC switching levels to drive LED-1 and LED-2 with mutual exclusivity.",
    aimOrProblem:
      "To design, simulate in LTspice, and verify in hardware a cost-effective analog frequency-discrimination system accepting a single input signal where LED-1 turns ON for 0–5 kHz and LED-2 turns ON for 6–12 kHz.",
    metadata: [
      { label: "Course", value: "Analog Electronics Circuits (AEC)" },
      { label: "Band 1 (LED-1)", value: "0 Hz – 5 kHz (LPF Path)" },
      { label: "Band 2 (LED-2)", value: "6 kHz – 12 kHz (BPF Path)" },
      { label: "Supply Rails", value: "±12 V Op-Amp Dual Supply / 5 V LED Logic" },
      { label: "Simulator", value: "LTspice (.tran 10ms / .ac dec)" },
      { label: "Hardware Build", value: "General-Purpose Zero PCB + Function Gen + DSO" },
    ],
    architectureStages: [
      {
        step: "01",
        title: "Input Signal Source & Conditioning",
        detail:
          "Accepts a single sinusoidal waveform across 0–12 kHz from a function generator, conditioned for amplitude stability prior to parallel branching.",
      },
      {
        step: "02",
        title: "Parallel RC Frequency-Selective Filters",
        detail:
          "Upper branch passes 0–5 kHz via an RC Low-Pass Filter (3.3 kΩ, 10 nF). Lower branch passes 6–12 kHz by cascading a High-Pass Filter (2.7 kΩ, 10 nF) with an upper Low-Pass Filter (1.3 kΩ, 10 nF).",
      },
      {
        step: "03",
        title: "Op-Amp Amplification & Buffer Stage",
        detail:
          "LM358 / Op-Amp stages buffer and amplify the attenuated RC filter outputs to isolate filter impedance from detector loading.",
      },
      {
        step: "04",
        title: "Diode-Capacitor Peak Detector",
        detail:
          "1N5819 Schottky diodes coupled with 1 µF capacitors and discharge resistors convert AC band energy into smooth proportional DC voltages.",
      },
      {
        step: "05",
        title: "Comparator Thresholding & LED Stage",
        detail:
          "Comparators evaluate each DC peak against a resistive divider reference voltage (Vref), driving HIGH (~+12 V) to turn ON LED-1 or LED-2 through current-limiting resistors.",
      },
    ],
    designSpecs: {
      title: "Theoretical Design Equations & Selected Component Values",
      rows: [
        {
          parameter: "Low-Pass Filter Cutoff (fc = 5 kHz)",
          formulaOrMethod: "R = 1 / (2π × 5000 × 10×10⁻⁹) ≈ 3.18 kΩ",
          targetValue: "R = 3.3 kΩ, C = 0.01 µF (10 nF)",
          notes: "Passes 0–5 kHz signals cleanly to Channel 1",
        },
        {
          parameter: "High-Pass Filter Lower Cutoff (fc = 6 kHz)",
          formulaOrMethod: "R = 1 / (2π × 6000 × 10×10⁻⁹) ≈ 2.65 kΩ",
          targetValue: "R = 2.7 kΩ, C = 0.01 µF (10 nF)",
          notes: "Rejects frequencies below 6 kHz on Channel 2",
        },
        {
          parameter: "Cascaded Upper LPF Limit (fc = 12 kHz)",
          formulaOrMethod: "R = 1 / (2π × 12000 × 10×10⁻⁹) ≈ 1.32 kΩ",
          targetValue: "R = 1.3 kΩ, C = 0.01 µF (10 nF)",
          notes: "Caps Channel 2 Band-Pass passband at 12 kHz",
        },
        {
          parameter: "LED Current Limiting Resistor",
          formulaOrMethod: "R = (Vcc - V_LED) / I = (5 - 2) / 0.01 = 300 Ω",
          targetValue: "330 Ω (hardware) / 1 kΩ (LTspice 12 V)",
          notes: "Maintains safe ~10 mA diode current",
        },
      ],
    },
    componentsOrStack: [
      { name: "Resistors", purpose: "1.3 kΩ, 2.7 kΩ, 3.3 kΩ (RC filters), 330 Ω (LED protection), 10 kΩ / 1.5 kΩ / 100 kΩ / 1 MΩ (Vref & bleeder)" },
      { name: "Ceramic & Peak Capacitors", purpose: "0.01 µF (10 nF) for RC timing networks; 1 µF for peak detection envelope holding" },
      { name: "LM358 / LM311 Op-Amp & Comparator", purpose: "Signal buffering/amplification and analog-to-digital threshold comparison" },
      { name: "1N5819 Schottky Diodes", purpose: "Low forward-drop rectification in the AC-to-DC peak detection stages" },
      { name: "LED-1 & LED-2 + Dual Supply", purpose: "Visual band indicators powered via regulated ±12 V (Op-Amps) and 5 V logic supply" },
      { name: "LTspice & Zero PCB Bench Gear", purpose: "Circuit simulation, soldered prototype assembly, Function Generator, and DSO verification" },
    ],
    testAndSimulation: {
      title: "LTspice Simulation & Hardware Verification Results",
      tools: ["LTspice", "Function Generator", "Digital Storage Oscilloscope (DSO)", "Zero PCB"],
      cases: [
        {
          name: "Case 1: High Band (8 kHz Input)",
          inputCondition: "Sinusoidal input at f = 8 kHz (within 6–12 kHz band)",
          expectedOutcome: "BPF path dominant -> Comparator 2 HIGH (+12 V), Comparator 1 LOW -> LED-2 ON, LED-1 OFF",
          observedResult: "Steady HIGH output (~10.38 V node voltage at 9.59 ms) on Channel 2; LED-2 illuminated exclusively.",
        },
        {
          name: "Case 2: Low Band (3 kHz Input)",
          inputCondition: "Sinusoidal input at f = 3 kHz (within 0–5 kHz band)",
          expectedOutcome: "LPF path dominant -> Comparator 1 HIGH (+12 V), Comparator 2 LOW -> LED-1 ON, LED-2 OFF",
          observedResult: "Steady HIGH output (~11.73 V node voltage at 9.73 ms) on Channel 1; LED-1 illuminated exclusively.",
        },
        {
          name: "Case 3: Transition Region (5–6 kHz Sweep)",
          inputCondition: "Frequency swept across the 5 kHz – 6 kHz crossover gap",
          expectedOutcome: "Gradual first-order roll-off transition between channels",
          observedResult: "Minor simultaneous glow/overlap observed near 5–6 kHz due to first-order passive 20 dB/decade roll-off.",
        },
      ],
      observations: [
        "Peak detector RC holding provides stable, flicker-free DC input levels to comparators.",
        "Zero PCB hardware matched LTspice AC/transient characteristics within standard component tolerance limits.",
        "Clean mutual exclusivity achieved across primary 0–5 kHz and 6–12 kHz operating bands.",
      ],
    },
    deepDiveSections: [
      {
        heading: "Methodology: Theoretical Analysis to Hardware Validation",
        summary:
          "The project followed a three-phase hardware engineering workflow ensuring alignment between analytical calculations, SPICE waveforms, and soldered hardware.",
        bullets: [
          "Phase A (Theoretical Design): Derived RC cutoff values for 5 kHz, 6 kHz, and 12 kHz using fc = 1 / (2πRC) and selected nearest E24 standard resistors.",
          "Phase B (LTspice Verification): Built complete dual-supply op-amp schematic with Vref voltage divider (12 V source across 10 kΩ and 1.5 kΩ) and verified .tran 10ms / .ac dec responses.",
          "Phase C (Hardware Implementation): Assembled permanently on a Zero PCB and swept sinusoidal frequencies using a laboratory function generator and DSO.",
        ],
      },
      {
        heading: "Practical Applications & Engineering Insights",
        bullets: [
          "Audio crossover detection, simple analog spectrum monitoring, and tone/frequency classification without microcontrollers.",
          "Demonstrates why buffer amplification between passive RC networks and peak detectors prevents impedance loading.",
        ],
      },
    ],
    achievementsOrOutcomes: [
      "Validated analytical RC filter equations against LTspice transient/AC plots and real DSO hardware traces.",
      "Successfully fabricated a working Zero PCB prototype demonstrating deterministic LED switching.",
      "Documented practical non-ideal filter roll-off behavior inside the 5–6 kHz transition region.",
    ],
    futureScope: [
      "Upgrade passive first-order RC sections to second-order Sallen-Key active Butterworth filters for steeper roll-off and sharper 5–6 kHz separation.",
      "Add hysteresis (Schmitt trigger feedback) around the comparators to eliminate flicker near threshold boundaries.",
      "Expand into a multi-band 4- or 8-channel analog spectrum visualizer.",
    ],
    references: [
      {
        label: "Coughlin, R. F. & Driscoll, F. F.",
        detail: "Operational Amplifiers and Linear Integrated Circuits (6th Edition) and NE555 Timer Reference",
      },
      {
        label: "AEC Course Reference Repository",
        detail: "GitHub reference linked in report documentation",
        url: "https://github.com/Youknowho1312/AEC_PWM_Controller",
      },
    ],
  },

  "hospital-management-system-python": {
    slug: "hospital-management-system-python",
    category: "Python Automation & Data Workflows",
    documentType: "Project Presentation (PPTX) & System Specification",
    subtitle:
      "Streamlining hospital workflows from patient admission to discharge with persistent file storage, itemized billing calculations, and automated SMTP email dispatch.",
    courseOrContext: "Python Programming Project — Dept. of ECE, NMAMIT, Nitte",
    dateLabel: "2025",
    authors: [
      "Shreyas Aradhya (NNM24EC065)",
      "J Anvidh (NNM24EC064)",
      "Jayanth (NNM24EC066)",
    ],
    mentorOrDept: "Department of Electronics & Communication Engineering, NMAMIT",
    abstract:
      "The Hospital Management System is a Python-based CLI administration solution engineered to digitize daily hospital workflows from patient registration through discharge. It eliminates manual paper ledger errors by combining structured persistent text-file record management, transparent itemized bill calculation, timestamp logging, and automated email bill delivery via SMTP.",
    aimOrProblem:
      "Replace error-prone manual hospital registration and discharge paperwork with an automated, menu-driven Python workflow handling patient lookup, billing calculation, and instant email notifications.",
    metadata: [
      { label: "Language", value: "Python 3" },
      { label: "Persistence", value: "Local File Storage (patients.txt)" },
      { label: "Email Engine", value: "Python Built-in SMTP Library" },
      { label: "Timestamps", value: "Python datetime Module" },
      { label: "Core Scope", value: "Registration, Lookup, Discharge, Billing, Email" },
    ],
    architectureStages: [
      {
        step: "01",
        title: "Start & Session Launch",
        detail: "Initializes application state and verifies access to the persistent patients.txt record store.",
      },
      {
        step: "02",
        title: "Main Menu Dispatch",
        detail:
          "Conditional menu loop routes operators to Register Patient, View Records, Search by Patient ID, Discharge & Billing, or Record Deletion.",
      },
      {
        step: "03",
        title: "Itemized Bill Generation",
        detail:
          "Calculates Ward Charges, Medicine Costs, and Consultation Fees dynamically on discharge and attaches an accurate datetime timestamp.",
      },
      {
        step: "04",
        title: "Automated SMTP Email Delivery",
        detail:
          "Invokes Python's smtplib module to transmit the generated itemized invoice directly to the patient's registered email address.",
      },
      {
        step: "05",
        title: "Storage Sync & Clean Exit",
        detail:
          "Commits updated patient status/discharge state back to patients.txt and exits cleanly.",
      },
    ],
    designSpecs: {
      title: "Bill Generation Logic — Transparency in Charges",
      rows: [
        {
          parameter: "Ward Charges",
          formulaOrMethod: "Days Stayed × Daily Room Rate",
          targetValue: "Duration-scaled accommodation fee",
          notes: "Computed automatically during discharge flow",
        },
        {
          parameter: "Medicine Charges",
          formulaOrMethod: "Σ (Individual Prescribed Medicine Costs)",
          targetValue: "Cumulative pharmacy cost",
          notes: "Supports itemized medication summation",
        },
        {
          parameter: "Consultation Fee",
          formulaOrMethod: "Fixed Amount per Consultation",
          targetValue: "Standardized physician charge",
          notes: "Added cleanly into discharge breakdown",
        },
        {
          parameter: "Final Invoice Total",
          formulaOrMethod: "Ward + Medicine + Consultation",
          targetValue: "Grand Total + Date/Time Stamp",
          notes: "Saved to records and dispatched via SMTP email",
        },
      ],
    },
    componentsOrStack: [
      { name: "Python Core", purpose: "Modular CLI logic, input validation, loops, and conditional routing" },
      { name: "File Handling (.txt)", purpose: "Persistent patient data read, search, append, and delete inside patients.txt" },
      { name: "SMTP Library (smtplib)", purpose: "Automated email transport for delivering discharge bills and notifications" },
      { name: "Date & Time Module", purpose: "Accurate admission/discharge and invoice timestamping" },
    ],
    deepDiveSections: [
      {
        heading: "Core Functional Capabilities (Slide Highlights)",
        bullets: [
          "Register new patients with complete personal, contact email, and admission details.",
          "View comprehensive lists of all or currently admitted patients.",
          "Instant ID-based record lookup for fast administrative retrieval.",
          "Streamlined discharge calculation paired with automated itemized bill generation.",
          "Secure removal/cleanup of outdated patient entries.",
          "Hands-free email delivery of finalized bills via SMTP.",
        ],
      },
      {
        heading: "Real-World Healthcare Impact",
        bullets: [
          "Enhanced Efficiency: Automates repetitive manual data entry, freeing staff for critical patient care.",
          "Improved Accuracy: Eliminates arithmetic mistakes during multi-line bill summation.",
          "Patient Transparency: Clear breakdown emailed promptly improves trust and communication.",
          "Maintainable Design: Structured behind-the-scenes file parsing designed for future database expansion.",
        ],
      },
    ],
    achievementsOrOutcomes: [
      "Automated end-to-end patient record management, cutting manual bookkeeping errors.",
      "Delivered transparent, itemized billing calculations verified with datetime logging.",
      "Integrated live SMTP email notifications directly into the Python discharge workflow.",
    ],
    futureScope: [
      "GUI Implementation using Tkinter or PyQt for point-and-click hospital desk usability.",
      "Database Integration migrating flat .txt records to MySQL / PostgreSQL for concurrent multi-user access.",
      "Automated PDF Bill Generation for formal printable hospital invoices.",
      "Companion Mobile Application for remote patient record lookup and notifications.",
    ],
  },

  "tinkercad-electronic-circuit-design": {
    slug: "tinkercad-electronic-circuit-design",
    category: "Electronics Simulation & Foundations",
    documentType: "Internship I Report • 9 Pages (Dec 2024)",
    subtitle:
      "Two-week technical survey evaluating Autodesk Tinkercad Circuits for designing, measuring, and verifying foundational DC circuits and simple Arduino setups.",
    courseOrContext: "Internship I — NMAM Institute of Technology, Nitte",
    dateLabel: "December 2024",
    authors: ["J Shreyas Aradhya (NNM24EC065)"],
    mentorOrDept:
      "Mentor: Pradyumna G R (Assistant Professor) | Team: Harshit Shetty, Jeethesh, Jayanth, Anvidh, Inchara",
    abstract:
      "This internship evaluated Autodesk Tinkercad—a browser-accessible Constructive Solid Geometry (CSG) 3D CAD and interactive electronic circuit simulation suite—for designing and understanding fundamental electronic circuits. Multiple circuits including series LED chains, parallel resistor-LED branches, Ohm's Law verification setups, voltage dividers, and simple Arduino circuits were modeled and cross-checked with multimeter measurements against theoretical electrical calculations.",
    aimOrProblem:
      "Assess the accuracy, educational value, and simulation usability of Autodesk Tinkercad when building foundational DC circuits and comparing virtual multimeter readings against theoretical Ohm's Law and Kirchhoff principles.",
    metadata: [
      { label: "Program", value: "Internship I (2 Weeks)" },
      { label: "Institution", value: "NMAM Institute of Technology, Nitte" },
      { label: "Faculty Mentor", value: "Pradyumna G R (Assistant Professor)" },
      { label: "Platform", value: "Autodesk Tinkercad (Circuits + 3D CSG)" },
      { label: "Core Focus", value: "Series/Parallel LEDs, Ohm's Law, Arduino Basics" },
    ],
    architectureStages: [
      {
        step: "01",
        title: "Component Selection & Placement",
        detail:
          "Selected power sources (3 V CR2032 coin cells, 9 V batteries), resistors, LEDs, and microcontrollers inside Tinkercad's virtual workbench.",
      },
      {
        step: "02",
        title: "Dual-Multimeter Instrumentation",
        detail:
          "Wired virtual multimeters in series (ammeter mode) and parallel (voltmeter mode) to inspect voltage drops, branch currents, and resistance.",
      },
      {
        step: "03",
        title: "Theoretical Cross-Verification",
        detail:
          "Compared simulated brightness, LED conduction thresholds, and current levels directly against KVL, KCL, and I = V / R math.",
      },
    ],
    designSpecs: {
      title: "Simulated Circuit Implementations & Verification",
      rows: [
        {
          parameter: "Series LED Circuit (Fig 1)",
          formulaOrMethod: "3 V Coin Battery across two 2 V forward-voltage LEDs -> 1.5 V per LED",
          targetValue: "V_LED = 1.5 V < Vf (2.0 V)",
          notes: "Verifies KVL voltage splitting; middle LED barely glows with near-zero conduction",
        },
        {
          parameter: "Parallel LED Circuit (Fig 2)",
          formulaOrMethod: "3 V Coin Battery across 3 independent resistor-LED branches",
          targetValue: "V_branch = 3.0 V across all branches",
          notes: "Current divides across branches while every LED lights at full brightness",
        },
        {
          parameter: "Ohm's Law Verification (Fig 3 & 4)",
          formulaOrMethod: "I = V / R using 9 V Battery, 450 Ω resistor & LED load",
          targetValue: "V_bat = 9 V, R = 450 Ω",
          notes: "Current stays safely regulated; LED illuminates steadily during simulation",
        },
      ],
    },
    componentsOrStack: [
      { name: "Autodesk Tinkercad Circuits", purpose: "Zero-setup cloud circuit simulation and interactive debugging" },
      { name: "Virtual Multimeters", purpose: "Real-time voltage, current, and resistance probing across circuit nodes" },
      { name: "CR2032 3 V & 9 V DC Sources", purpose: "Powering series/parallel diode networks and Ohm's law tests" },
      { name: "Resistors & LEDs", purpose: "Current limiting (450 Ω) and visual forward-voltage drop analysis" },
      { name: "Arduino Virtual Prototyping", purpose: "Introductory programmable circuit testing integrated within Tinkercad" },
    ],
    testAndSimulation: {
      title: "Observed Circuit Behavior vs. Theoretical Expectations",
      tools: ["Tinkercad Circuit Simulator", "Virtual Voltmeter & Ammeter"],
      cases: [
        {
          name: "Series Connection (Two 2 V LEDs on 3 V Supply)",
          inputCondition: "CR2032 3.0 V source driving two LEDs in series",
          expectedOutcome: "Voltage divides equally (1.5 V each), below the 2.0 V turn-on threshold",
          observedResult: "Middle LED barely glowed due to insufficient forward voltage per diode, confirming series voltage division.",
        },
        {
          name: "Parallel Connection (Three LED Branches on 3 V Supply)",
          inputCondition: "Three separate resistor-LED legs wired in parallel to CR2032 3.0 V",
          expectedOutcome: "Same 3.0 V potential difference across all 3 legs; independent branch currents",
          observedResult: "All three LEDs illuminated uniformly during simulation.",
        },
        {
          name: "Ohm's Law Circuit (9 V Source + 450 Ω Resistor)",
          inputCondition: "9 V battery in series with 450 Ω resistor and LED",
          expectedOutcome: "Resistor limits current safely per I = V / R so LED glows without damage",
          observedResult: "LED lit brightly and safely throughout simulation run.",
        },
      ],
      observations: [
        "Confirmed linear proportionality between voltage, current, and resistance under ideal virtual conditions.",
        "Assessed Tinkercad's accessibility and browser workflow as effective for early hardware verification prior to lab breadboarding.",
      ],
    },
    deepDiveSections: [
      {
        heading: "Platform Evaluation Findings",
        bullets: [
          "Ease of Use: Drag-and-drop CSG 3D + circuit environment requires only a browser, lowering setup friction for quick lab prototyping.",
          "Diagnostic Power: Built-in multimeter warnings and instant short-circuit/overcurrent feedback accelerate intuition for KVL/KCL laws.",
        ],
      },
    ],
    achievementsOrOutcomes: [
      "Successfully completed the two-week NMAMIT Internship I program in December 2024.",
      "Demonstrated practical alignment between simulated multimeter telemetry and textbook circuit equations.",
      "Built foundational confidence in schematic wiring prior to physical PCB soldering and Verilog/FPGA design.",
    ],
    futureScope: [
      "Combine Tinkercad 3D CSG mechanical enclosures with Arduino sensor assemblies for physical 3D-printed prototypes.",
      "Transition complex analog designs from conceptual Tinkercad circuits into full SPICE modeling in LTspice.",
    ],
  },

  "fifo-buffer-systemverilog": {
    slug: "fifo-buffer-systemverilog",
    category: "SystemVerilog RTL & OOP Verification",
    documentType: "Lab Project Report • 16 Pages (RTL + Testbench Architecture)",
    subtitle:
      "Parameterized First-In-First-Out buffer RTL design paired with a layered SystemVerilog class-based constrained-random verification environment.",
    courseOrContext: "Project-Based SystemVerilog Laboratory — Dept. of ECE, NMAMIT",
    dateLabel: "May 2025",
    authors: [
      "J Shreyas Aradhya (NNM24EC065)",
      "J Anvidh (NNM24EC064)",
      "Jayanth Reddy (NNM24EC066)",
    ],
    mentorOrDept: "Department of Electronics & Communication Engineering",
    abstract:
      "This project implements both the synthesizable RTL design and a complete object-oriented verification environment for a parameterized First-In-First-Out (FIFO) buffer in SystemVerilog. Beyond standard read/write logic, the RTL supports configurable data width and depth, byte-enable writes, synchronous/asynchronous reset, flush, First-Word Fall-Through (FWFT) mode, status flags, and error/performance counters. A class-based testbench using inheritance, constrained randomization, modport BFMs, mailboxes, events, fork-join concurrency, and a queue-based scoreboard validates corner cases and randomized traffic.",
    aimOrProblem:
      "Move beyond simple directed Verilog testbenches to a reusable, structured SystemVerilog OOP verification architecture capable of exposing subtle overflow, underflow, flush, and concurrent timing bugs.",
    metadata: [
      { label: "HDL / HVL", value: "SystemVerilog (IEEE 1800)" },
      { label: "Simulation Clock", value: "100 MHz System Clock" },
      { label: "RTL Top Module", value: "fifo_buffer (always_ff / always_comb)" },
      { label: "Testbench Top", value: "tb_fifo_top (Generator -> Driver -> Scoreboard)" },
      { label: "CRV Mix", value: "50% Write • 30% Read • 20% Burst" },
      { label: "EDA Tools", value: "ModelSim / QuestaSim + GTKWave" },
    ],
    architectureStages: [
      {
        step: "01",
        title: "Interface & Modport BFM (fifo_if)",
        detail:
          "Encapsulates wr_en, rd_en, data buses, resets, flush, and status flags with separate dut_mp and tb_mp modports plus reusable BFM tasks (do_write, do_read, do_flush).",
      },
      {
        step: "02",
        title: "Parameterized FIFO RTL (fifo_buffer)",
        detail:
          "Synthesizable memory array and pointer arithmetic implemented with always_ff sequential blocks and always_comb status/byte-enable logic; validates parameters via $fatal guards.",
      },
      {
        step: "03",
        title: "OOP Transaction Hierarchy & Generator",
        detail:
          "Extends base fifo_transaction into fifo_write_txn, fifo_read_txn, and fifo_burst_txn with weighted constraints; generator streams randomized items into a mailbox.",
      },
      {
        step: "04",
        title: "Driver & Concurrent Execution (fork-join)",
        detail:
          "Driver consumes mailbox transactions and invokes BFM tasks on the 100 MHz clock while Monitor captures pin activity, synchronized via SystemVerilog events.",
      },
      {
        step: "05",
        title: "Queue Reference Model & Scoreboard",
        detail:
          "Compares actual DUT read outputs against an internal SystemVerilog reference queue and maintains overflow, underflow, and data-mismatch metrics in an associative array.",
      },
    ],
    designSpecs: {
      title: "RTL Features & Verification Specification",
      rows: [
        {
          parameter: "Configurability & Guards",
          formulaOrMethod: "Parameterized DATA_WIDTH & DEPTH + $fatal parameter checks",
          targetValue: "Flexible width / depth instantiation",
          notes: "Prevents invalid zero or non-compliant parameter builds",
        },
        {
          parameter: "Data & Control Modes",
          formulaOrMethod: "always_comb byte-enable mask + always_ff pointers & FWFT",
          targetValue: "Byte-Enable + First-Word Fall-Through",
          notes: "Supports flush, synchronous reset, and asynchronous reset",
        },
        {
          parameter: "Observability & Flags",
          formulaOrMethod: "Fill-level counter + comparator thresholds",
          targetValue: "Full, Empty, Almost Full, Almost Empty + Error Counters",
          notes: "Tracks total writes, reads, overflows, and underflows",
        },
        {
          parameter: "Constrained Random Traffic",
          formulaOrMethod: "Weighted distribution constraint block",
          targetValue: "50% Write / 30% Read / 20% Burst",
          notes: "Runs alongside directed corner-case regression",
        },
      ],
    },
    componentsOrStack: [
      { name: "SystemVerilog RTL", purpose: "always_ff, always_comb, parameterized arrays, pointer wrap & FWFT output mux" },
      { name: "SystemVerilog OOP & CRV", purpose: "Inheritance, polymorphism, dynamic arrays, and constrained randomization classes" },
      { name: "Interfaces, Modports & Mailboxes", purpose: "Signal abstraction via fifo_if BFM tasks and safe generator-to-driver queuing" },
      { name: "Queues & Associative Arrays", purpose: "Golden reference queue model and structured scoreboard error logging" },
      { name: "ModelSim / QuestaSim & GTKWave", purpose: "100 MHz RTL compilation, regression logs, and waveform signal debugging" },
    ],
    testAndSimulation: {
      title: "Directed & Constrained Random Verification Matrix",
      tools: ["ModelSim", "QuestaSim", "GTKWave"],
      cases: [
        {
          name: "Overflow Directed Test",
          inputCondition: "Write requests driven beyond configured FIFO DEPTH while full flag is asserted",
          expectedOutcome: "FIFO blocks corrupting stored entries, asserts overflow flag, increments error counter",
          observedResult: "Overflow detected reliably; scoreboard confirmed zero data corruption of existing queue items.",
        },
        {
          name: "Underflow Directed Test",
          inputCondition: "Read transactions issued when fill-level equals 0 (empty asserted)",
          expectedOutcome: "Assert underflow flag, preserve pointer state, increment underflow counter",
          observedResult: "Underflow flag and error counter triggered accurately without false reads.",
        },
        {
          name: "Flush Recovery Test",
          inputCondition: "Partially fill FIFO, assert synchronous flush signal, then resume reads/writes",
          expectedOutcome: "Clear internal counters & pointers immediately and restore empty status",
          observedResult: "Empty state cleanly restored; subsequent transactions matched scoreboard queue 100%.",
        },
        {
          name: "Constrained Random Regression (50/30/20)",
          inputCondition: "Mixed randomized writes (50%), reads (30%), and multi-beat bursts (20%)",
          expectedOutcome: "Strict FIFO ordering & accurate fill-level status across full/empty boundaries",
          observedResult: "Scoreboard queue matched DUT outputs with performance counters reflecting all executed ops.",
        },
      ],
      observations: [
        "Interface-based BFM abstraction kept driver logic clean and insulated from low-level pin timing changes.",
        "Queue + associative array scoreboard caught mismatches immediately and summarized overflow/underflow statistics.",
      ],
    },
    deepDiveSections: [
      {
        heading: "Key Implementation Challenges & Resolutions",
        bullets: [
          "Boundary Corruption Prevention: Resolved simultaneous/boundary overflow and underflow hazards via gated write/read pointer logic and counter checks.",
          "Process Synchronization: Prevented race conditions between generator, driver, and monitor through mailboxes, named SystemVerilog events, and fork-join blocks.",
          "Configuration Safety: Added $fatal parameter validation checks to catch misconfigured depth/width parameters at elaboration time.",
        ],
      },
    ],
    achievementsOrOutcomes: [
      "Engineered a reusable SystemVerilog RTL + OOP testbench bridging classroom HDL exercises and industry UVM concepts.",
      "Verified byte-enable masking, FWFT read latency reduction, flush recovery, and boundary flags via automated scoreboard checking.",
      "Analyzed complete 100 MHz timing waveforms in ModelSim/QuestaSim and GTKWave.",
    ],
    futureScope: [
      "Add SystemVerilog Assertions (SVA) for formal concurrent protocol & flag invariant checking.",
      "Implement functional covergroups and cross-coverage to measure verification closure quantitatively.",
      "Extend to an Asynchronous Dual-Clock CDC FIFO using Gray-coded pointer synchronizers.",
      "Migrate testbench components into a standardized UVM agent/env/scoreboard hierarchy.",
    ],
    references: [
      { label: "SystemVerilog FIFO Design & Verification Tutorials", detail: "Verification lectures and architectural discussions referenced in Section 8" },
      { label: "AI Architecture Consultation Log", detail: "Claude conversation reference noted in report bibliography", url: "https://claude.ai/share/3a71de48-2485-477a-944f-c02ea019856b" },
    ],
  },

  "digital-timer-fpga": {
    slug: "digital-timer-fpga",
    category: "FPGA & Verilog HDL Design",
    documentType: "Engineering Technical Report (Portfolio Documentation)",
    subtitle:
      "Synchronous FPGA digital timer architecture utilizing hierarchical clock division, BCD counters, FSM control logic, and time-multiplexed 7-segment display drivers.",
    courseOrContext: "Digital Systems & FPGA Design — Dept. of ECE, NMAMIT, Nitte",
    dateLabel: "2025",
    authors: ["J Shreyas Aradhya (NNM24EC065)"],
    mentorOrDept: "Department of Electronics & Communication Engineering",
    abstract:
      "This project implements a synchronous digital timer in Verilog HDL targeting FPGA deployment. High-frequency onboard crystal clock ticks are divided down into deterministic 1 Hz and multiplexed scan enables via parameterizable synchronous modulus counters. The timing core tracks minutes and seconds in Binary-Coded Decimal (BCD) format under an FSM controller supporting start, pause, and synchronous reset states while driving multi-digit 7-segment LEDs without flicker.",
    aimOrProblem:
      "Eliminate clock skew and asynchronous ripple-counter glitches commonly seen in discrete timer circuits by designing a single-clock-domain, fully synchronous Verilog RTL timer for FPGA synthesis.",
    metadata: [
      { label: "Target Platform", value: "FPGA Architecture (Xilinx Vivado Compatible)" },
      { label: "HDL Language", value: "Verilog HDL (Synthesizable RTL)" },
      { label: "Clocking Scheme", value: "Single Global Clock + Synchronous Clock Enable" },
      { label: "Counting Format", value: "Cascaded 00–59 BCD Seconds & Minutes" },
      { label: "Display Driver", value: "Time-Division Multiplexed 7-Segment Decoder" },
    ],
    architectureStages: [
      {
        step: "01",
        title: "Parameterizable Clock Enable Divider",
        detail:
          "Generates single-cycle synchronous enable pulses (e.g., 1 Hz timebase and kHz display scan tick) directly from the master FPGA oscillator—avoiding gated or derived ripple clocks.",
      },
      {
        step: "02",
        title: "FSM Control Unit & Input Synchronization",
        detail:
          "Synchronizes external Start/Pause/Reset push buttons across two-flop synchronizers and manages IDLE, RUNNING, and PAUSED operational states cleanly.",
      },
      {
        step: "03",
        title: "Cascaded BCD Counter Hierarchy",
        detail:
          "Implements mod-10 units and mod-6 tens counters for Seconds (00–59) cascading into Minutes (00–59), ensuring clean decimal rollover without expensive binary-to-BCD division.",
      },
      {
        step: "04",
        title: "7-Segment Multiplexer & LUT Decoder",
        detail:
          "Cycles digit select anodes continuously at a flicker-free refresh frequency while translating active BCD nibbles into 7-segment cathode patterns via combinational lookup.",
      },
    ],
    designSpecs: {
      title: "RTL Module Structure & Timing Considerations",
      rows: [
        {
          parameter: "Timebase Tick Generation",
          formulaOrMethod: "MAX_COUNT = (F_clk / F_tick) - 1; 1-cycle tick pulse",
          targetValue: "1 Hz Count Enable + ~1 kHz Refresh Enable",
          notes: "Preserves single synchronous clock domain for static timing closure",
        },
        {
          parameter: "Seconds / Minutes Rollover",
          formulaOrMethod: "Unit == 9 && Ten == 5 -> Roll over to 00 & emit carry",
          targetValue: "00:00 through 59:59 BCD range",
          notes: "Each digit stored natively in 4-bit BCD register",
        },
        {
          parameter: "Control FSM Transitions",
          formulaOrMethod: "Reset -> IDLE; Start -> RUNNING; Pause -> PAUSED",
          targetValue: "Deterministic Synchronous Transitions",
          notes: "Retains count value while PAUSED until resumed or cleared",
        },
      ],
    },
    componentsOrStack: [
      { name: "Verilog HDL", purpose: "Modular RTL blocks: top wrapper, clock enable generator, BCD counters, and 7-segment LUT" },
      { name: "FPGA Toolchain (Xilinx Vivado)", purpose: "RTL elaboration, XDC pin constraint mapping, synthesis, and bitstream flow" },
      { name: "Verilog Testbench", purpose: "Behavioral simulation with scaled divider parameters to verify rollover & pause edge cases" },
    ],
    testAndSimulation: {
      title: "RTL Simulation & Verification Scenarios",
      tools: ["Verilog HDL Testbench", "Behavioral Waveform Simulation"],
      cases: [
        {
          name: "Synchronous Reset Test",
          inputCondition: "Assert reset during active counting mid-minute",
          expectedOutcome: "All BCD digits return cleanly to 00:00 on next active clock edge",
          observedResult: "Zeroed registers deterministically with FSM returning to IDLE.",
        },
        {
          name: "59 -> 00 Seconds Rollover",
          inputCondition: "Advance timebase enable when seconds register holds 59",
          expectedOutcome: "Seconds reset to 00 simultaneously as minutes increments by 1",
          observedResult: "Clean single-cycle carry propagation across BCD digits.",
        },
        {
          name: "Start / Pause Hold Verification",
          inputCondition: "Toggle pause mid-count for multiple clock periods, then resume",
          expectedOutcome: "Counter holds value stably while paused and resumes without skipping beats",
          observedResult: "Count held invariant while enable gated off; seamless continuation on resume.",
        },
      ],
      observations: [
        "Using synchronous tick enables rather than divided register clocks simplifies static timing analysis (STA) on FPGA fabric.",
        "Parameterized divider counts allow rapid simulation (using small N) and full hardware timing (using 50/100 MHz N) from one RTL source.",
      ],
    },
    deepDiveSections: [
      {
        heading: "Key Digital Design Practices Applied",
        bullets: [
          "Eliminated combinational glitches on 7-segment output lines by latching display scan selects synchronously.",
          "Kept BCD counting independent of binary arithmetic conversions to minimize FPGA LUT utilization.",
        ],
      },
    ],
    achievementsOrOutcomes: [
      "Designed a clean, modular, synthesizable Verilog digital timer suitable for FPGA development boards.",
      "Demonstrated single-clock synchronous design principles covering reset recovery, BCD cascade, and display multiplexing.",
    ],
    futureScope: [
      "Add preset countdown mode loaded via onboard slide switches with an audible piezo buzzer alarm at 00:00.",
      "Integrate UART telemetry output to stream elapsed lap intervals to a host terminal.",
    ],
  },

  "traffic-light-controller": {
    slug: "traffic-light-controller",
    category: "FSM & Sequential Digital Design",
    documentType: "Engineering Technical Report (Portfolio Documentation)",
    subtitle:
      "Deterministic Moore Finite State Machine (FSM) sequential controller in Verilog HDL ensuring mutually exclusive intersection phasing and timed safety intervals.",
    courseOrContext: "Digital Electronics & Verilog Design — Dept. of ECE, NMAMIT, Nitte",
    dateLabel: "2025",
    authors: ["J Shreyas Aradhya (NNM24EC065)"],
    mentorOrDept: "Department of Electronics & Communication Engineering",
    abstract:
      "This project models and verifies an automated multi-way intersection traffic light controller built around a deterministic Moore Finite State Machine (FSM) in Verilog HDL. By separating sequential state storage, next-state timing transitions, and pure state-based signal lamp decoding, the architecture structurally guarantees that conflicting directional Green signals can never assert simultaneously—even during reset or transitional yellow phases.",
    aimOrProblem:
      "Architect a collision-free, deterministic digital intersection controller in Verilog HDL managing timed Green, Yellow, and Red signal phases across intersecting axes.",
    metadata: [
      { label: "Design Paradigm", value: "Moore Finite State Machine (FSM)" },
      { label: "HDL Language", value: "Verilog HDL" },
      { label: "Safety Invariant", value: "Mutually Exclusive Orthogonal Green Phases" },
      { label: "Timing Control", value: "Synchronous Down/Up Dwell Interval Counter" },
      { label: "Core Focus", value: "State Encoding, Timing Transitions, Reset Safety" },
    ],
    architectureStages: [
      {
        step: "01",
        title: "State Register Block (Sequential)",
        detail:
          "Updates `current_state` strictly on rising clock edges and initializes to a known safe ALL-RED or primary default state upon reset.",
      },
      {
        step: "02",
        title: "Programmable Dwell Timer",
        detail:
          "Counts clock ticks inside each phase and generates a `timer_done` pulse matching distinct Green dwell duration and shorter Yellow caution intervals.",
      },
      {
        step: "03",
        title: "Next-State Combinational Logic",
        detail:
          "Transitions deterministically through `NS_GREEN -> NS_YELLOW -> EW_GREEN -> EW_YELLOW` (plus safety clearance/sensor priority checks when enabled).",
      },
      {
        step: "04",
        title: "Moore Output Decoder",
        detail:
          "Maps `current_state` exclusively to North-South `[R, Y, G]` and East-West `[R, Y, G]` vectors, ensuring glitch-free lamp assertion.",
      },
    ],
    designSpecs: {
      title: "FSM State Transition & Signal Output Table",
      rows: [
        {
          parameter: "S0: NS_GREEN",
          formulaOrMethod: "Transitions to S1 when Green dwell timer expires",
          targetValue: "NS = GREEN | EW = RED",
          notes: "Primary North-South traffic flow active; East-West safely locked Red",
        },
        {
          parameter: "S1: NS_YELLOW",
          formulaOrMethod: "Transitions to S2 after fixed caution interval",
          targetValue: "NS = YELLOW | EW = RED",
          notes: "Intersection clearing window before cross-axis release",
        },
        {
          parameter: "S2: EW_GREEN",
          formulaOrMethod: "Transitions to S3 when Green dwell timer expires",
          targetValue: "NS = RED | EW = GREEN",
          notes: "East-West traffic active; North-South strictly held Red",
        },
        {
          parameter: "S3: EW_YELLOW",
          formulaOrMethod: "Wraps cleanly back to S0 after caution interval",
          targetValue: "NS = RED | EW = YELLOW",
          notes: "Completes full intersection period safely",
        },
      ],
    },
    componentsOrStack: [
      { name: "Verilog HDL", purpose: "Three-process FSM coding style (state register, next-state logic, output decoder)" },
      { name: "Digital Logic & FSM Theory", purpose: "State minimization, binary/one-hot encoding, and hazard avoidance" },
      { name: "Verilog Testbench Verification", purpose: "Full multi-cycle simulation asserting mutual-exclusion checks on output vectors" },
    ],
    testAndSimulation: {
      title: "FSM Verification & Safety Assertions",
      tools: ["Verilog HDL Testbench", "Waveform Inspection"],
      cases: [
        {
          name: "Full 4-State Cycle Traversal",
          inputCondition: "Allow clock cycles to advance uninterrupted through multiple complete periods",
          expectedOutcome: "Strict sequence S0 -> S1 -> S2 -> S3 -> S0 with exact dwell ratios",
          observedResult: "State machine stepped monotonically with zero skipped states or illegal encodings.",
        },
        {
          name: "Mutual Exclusion Safety Check",
          inputCondition: "Monitor NS_GREEN and EW_GREEN simultaneously on every clock cycle",
          expectedOutcome: "!(NS_GREEN && EW_GREEN) must hold true unconditionally across all cycles",
          observedResult: "Zero conflicting green assertions detected across transitions and resets.",
        },
        {
          name: "Mid-Cycle Reset Recovery",
          inputCondition: "Assert reset during EW_GREEN phase",
          expectedOutcome: "Controller exits EW_GREEN safely and resets counters back to initial state",
          observedResult: "Timers zeroed cleanly and FSM recovered immediately.",
        },
      ],
      observations: [
        "Moore architecture keeps output LEDs purely dependent on flip-flop state, eliminating input-induced combinational glitches.",
        "Explicit `default:` case clause in the combinational block prevents unintended latch inference and recovers gracefully from single-event upsets.",
      ],
    },
    deepDiveSections: [
      {
        heading: "RTL Design Discipline",
        bullets: [
          "Adopted industry-standard `localparam` state definitions with full `default` state assignment to ensure safe hardware synthesis.",
          "Isolated counter comparison logic from lamp outputs for predictable timing closure.",
        ],
      },
    ],
    achievementsOrOutcomes: [
      "Verified a deterministic Moore FSM traffic controller in Verilog HDL with strict mutual exclusion.",
      "Demonstrated practical sequential circuit design combining state registers, timing counters, and glitch-free output decoding.",
    ],
    futureScope: [
      "Integrate pedestrian walk push-button request latching during Green intervals.",
      "Add vehicle-sensor inputs to dynamically shorten idle minor-road cycles.",
    ],
  },

  "arduino-hospital-robot": {
    slug: "arduino-hospital-robot",
    category: "Embedded Systems & Robotics Prototype",
    documentType: "Engineering Technical Report (Portfolio Documentation)",
    subtitle:
      "Autonomous Arduino-based hospital utility prototype integrating ultrasonic time-of-flight obstacle avoidance, ambient temperature/humidity telemetry, and PWM H-bridge motor control.",
    courseOrContext: "Embedded Prototyping & Microcontroller Integration — Dept. of ECE, NMAMIT, Nitte",
    dateLabel: "2025",
    authors: ["J Shreyas Aradhya (NNM24EC065)"],
    mentorOrDept: "Department of Electronics & Communication Engineering",
    abstract:
      "The Arduino Hospital Robot is an embedded mobile robotics prototype built to demonstrate contactless corridor navigation and ward environmental sensing. Powered by an Arduino microcontroller programmed in Embedded C/C++, the platform continuously measures obstacle distance via ultrasonic time-of-flight ranging, monitors ambient temperature and humidity, and executes real-time differential drive actuation through a dual H-bridge motor driver.",
    aimOrProblem:
      "Combine obstacle avoidance, ward environmental monitoring, and differential wheel actuation on a single Arduino microcontroller platform for autonomous indoor mobility.",
    metadata: [
      { label: "Microcontroller", value: "Arduino Development Platform" },
      { label: "Firmware Language", value: "Embedded C / C++" },
      { label: "Ranging Sensor", value: "Ultrasonic Distance Module (Time-of-Flight)" },
      { label: "Telemetry Sensor", value: "Ambient Temperature & Humidity Module" },
      { label: "Actuation Stage", value: "Dual H-Bridge DC Motor Driver (PWM Speed Control)" },
    ],
    architectureStages: [
      {
        step: "01",
        title: "Sensor Telemetry Acquisition",
        detail:
          "Triggers periodic 10 µs ultrasonic pulses to measure echo return duration while sampling ward ambient temperature and humidity.",
      },
      {
        step: "02",
        title: "Obstacle Threshold Decision Logic",
        detail:
          "Calculates forward clearance via distance = (echo_us × 0.0343) / 2 and compares against safe stopping threshold in real time.",
      },
      {
        step: "03",
        title: "Navigation State Execution",
        detail:
          "Selects FORWARD drive when corridor is clear, or executes STOP -> Reverse/Turn recovery maneuver whenever an obstacle enters the safety zone.",
      },
      {
        step: "04",
        title: "H-Bridge PWM Motor Actuation",
        detail:
          "Drives directional IN1–IN4 control pins and PWM enable channels to regulate left/right wheel torque and turning radius smoothly.",
      },
    ],
    designSpecs: {
      title: "Embedded Control & Sensing Architecture",
      rows: [
        {
          parameter: "Ultrasonic Ranging Calculation",
          formulaOrMethod: "d (cm) = (pulseDuration_µs × 0.0343 cm/µs) / 2",
          targetValue: "Real-Time Collision Margin",
          notes: "Halts forward drive and initiates turn when d < safety threshold",
        },
        {
          parameter: "Environmental Sensing",
          formulaOrMethod: "Periodic Digital Temperature & Relative Humidity Polling",
          targetValue: "Ward Temperature (°C) & RH (%)",
          notes: "Logged over Serial interface for ward condition monitoring",
        },
        {
          parameter: "Differential Drive PWM Control",
          formulaOrMethod: "analogWrite(ENA/ENB, dutyCycle) + IN1..IN4 polarity",
          targetValue: "Forward / Stop / Pivot Steering",
          notes: "Enables smooth speed scaling and tight corridor turns",
        },
      ],
    },
    componentsOrStack: [
      { name: "Arduino Microcontroller", purpose: "Executes main real-time sensing, threshold evaluation, and motor control firmware" },
      { name: "Embedded C / C++", purpose: "Timing pulse measurement, state handling, and serial telemetry formatting" },
      { name: "Ultrasonic Distance Sensor", purpose: "Non-contact forward obstacle detection via acoustic echo timing" },
      { name: "Temperature & Humidity Sensor", purpose: "Tracks ambient ward climate telemetry alongside mobility" },
      { name: "H-Bridge Motor Driver + DC Motors", purpose: "Bidirectional current steering and PWM velocity regulation" },
    ],
    testAndSimulation: {
      title: "Prototype Bench & Corridor Validation",
      tools: ["Arduino IDE Serial Monitor", "Physical Benchtop Chassis"],
      cases: [
        {
          name: "Clear Path Forward Traversal",
          inputCondition: "No corridor obstacles inside threshold range",
          expectedOutcome: "Equal forward PWM drive applied to both wheels",
          observedResult: "Prototype navigated steadily along straight corridor while streaming sensor telemetry.",
        },
        {
          name: "Dynamic Obstacle Intervention",
          inputCondition: "Place obstacle directly ahead inside safety cutoff distance",
          expectedOutcome: "Immediate motor halt followed by steering turn away from obstruction",
          observedResult: "Motors braked promptly on ultrasonic detection and pivoted to resume clear-path motion.",
        },
        {
          name: "Environmental Telemetry Stream",
          inputCondition: "Continuous monitoring across room ambient shifts",
          expectedOutcome: "Periodic temperature and humidity telemetry updated cleanly without blocking drive loop",
          observedResult: "Consistent readings verified on serial debug monitor.",
        },
      ],
      observations: [
        "Separating motor supply rails from microcontroller logic rails reduces brownout resets during high-torque motor starts.",
        "Ultrasonic pulse timeouts safeguard the control loop against missing echo pulses in open rooms.",
      ],
    },
    deepDiveSections: [
      {
        heading: "Hardware Integration Insights",
        bullets: [
          "Managed acoustic reflection edge cases by enforcing finite pulse-in timeouts and multi-sample sanity bounds.",
          "Combined mobility actuation and ambient sensing in a unified embedded firmware loop without external OS overhead.",
        ],
      },
    ],
    achievementsOrOutcomes: [
      "Built and tested a multi-sensor Arduino robotic prototype combining autonomy with environmental telemetry.",
      "Demonstrated practical Embedded C/C++ interfacing across PWM actuators, acoustic rangefinders, and climate sensors.",
    ],
    futureScope: [
      "Add IR / optical line-following array or AprilTag camera module for structured multi-ward waypoint routing.",
      "Integrate ESP32 Wi-Fi telemetry to push live ward temperature/humidity and robot status to a web dashboard.",
    ],
  },

  "reactor-temperature-control": {
    slug: "reactor-temperature-control",
    category: "Control Systems & Predictive Modeling",
    documentType: "Engineering Technical Report (Portfolio Documentation)",
    subtitle:
      "Batch reactor thermal regulation exploring predictive trajectory modeling, adaptive error weighting, and reinforcement-learning control strategies.",
    courseOrContext: "Engineering Internship & Control Modeling — Manipal",
    dateLabel: "2025",
    authors: ["J Shreyas Aradhya (NNM24EC065)"],
    mentorOrDept: "Control Systems & Batch Reactor Process Exploration",
    abstract:
      "Industrial batch reactors present demanding temperature control challenges characterized by non-linear reaction kinetics, asymmetric heating/cooling actuator capacities, and substantial thermal dead-time lags. Building on hands-on internship exposure to batch reactor processes in Manipal, this project explores predictive modeling, adaptive error weighting, and reinforcement-learning concepts to stabilize reactor temperature tightly while minimizing thermal overshoot.",
    aimOrProblem:
      "Overcome fixed-gain overshoot and slow disturbance recovery in non-linear batch reactor thermal processes by investigating predictive state forecasting paired with adaptive and reinforcement-learning control weights.",
    metadata: [
      { label: "Domain", value: "Process Control & Predictive Modeling" },
      { label: "Internship Link", value: "Batch Reactor Engineering Internship (Manipal)" },
      { label: "Core Concepts", value: "Predictive Horizon, Adaptive Weighting, RL Policy Concepts" },
      { label: "Primary Challenge", value: "Non-linear Thermal Inertia & Actuator Dead-Time" },
      { label: "Control Goals", value: "Minimal Overshoot, Fast Settling, Disturbance Rejection" },
    ],
    architectureStages: [
      {
        step: "01",
        title: "Thermal Process Modeling",
        detail:
          "Characterizes reactor vessel temperature response, jacket thermal transfer inertia, and transport dead-time lags under load changes.",
      },
      {
        step: "02",
        title: "Predictive Trajectory Forecasting",
        detail:
          "Estimates future temperature trend over a finite horizon using recent states and heating inputs, enabling proactive throttling prior to setpoint crossing.",
      },
      {
        step: "03",
        title: "Adaptive Error Weighting",
        detail:
          "Modulates control weighting dynamically between large-error ramp-up (aggressive heating) and near-setpoint approach (damped braking to suppress overshoot).",
      },
      {
        step: "04",
        title: "Reinforcement Learning Formulation",
        detail:
          "Models control tuning as a closed-loop agent observing error and dT/dt, selecting heater/cooling commands to maximize cumulative tracking smoothness reward.",
      },
    ],
    designSpecs: {
      title: "Control Formulation & Evaluation Metrics",
      rows: [
        {
          parameter: "Predictive Horizon Feedback",
          formulaOrMethod: "y_pred(t + k) driven by energy-balance model & trend dT/dt",
          targetValue: "Lead Compensation Before Thermal Overshoot",
          notes: "Counteracts dead-time lag inherent to heavy reactor jackets",
        },
        {
          parameter: "Adaptive Weighting Law",
          formulaOrMethod: "w(e, dT/dt) scales penalty between IAE & control slew",
          targetValue: "High Gain on Ramp / High Damping Near Setpoint",
          notes: "Prevents thermal runaway in exothermic regimes",
        },
        {
          parameter: "RL Reward Shaping",
          formulaOrMethod: "Reward = -(α·|e| + β·e² + γ·Δu²)",
          targetValue: "Minimal Tracking Error + Smooth Actuator Duty",
          notes: "Balances setpoint precision against valve/SSR actuator wear",
        },
      ],
    },
    componentsOrStack: [
      { name: "Control Systems Theory", purpose: "Closed-loop stability analysis, dead-time compensation, and damping trade-offs" },
      { name: "Predictive Modeling", purpose: "Forecasting reactor temperature trajectories ahead of physical sensor lag" },
      { name: "Adaptive Weighting & RL Concepts", purpose: "Self-adjusting control emphasis across shifting batch thermal phases" },
    ],
    testAndSimulation: {
      title: "Simulation Exploration & Performance Scenarios",
      tools: ["Process Control Simulation Models", "Numerical Step-Response Evaluation"],
      cases: [
        {
          name: "Cold Start Setpoint Ramp",
          inputCondition: "Large positive step reference from ambient temperature to reaction target",
          expectedOutcome: "Rapid rise phase tapering smoothly before reaching target to avoid overshoot",
          observedResult: "Adaptive weighting reduced early overshoot relative to static aggressive gain tuning.",
        },
        {
          name: "Exothermic Load Disturbance",
          inputCondition: "Inject mid-batch heat release perturbation",
          expectedOutcome: "Predictive dT/dt awareness engages early counter-cooling correction",
          observedResult: "Faster stabilization window with bounded temperature excursion.",
        },
      ],
      observations: [
        "Predictive derivative awareness significantly improves stability when actuator dead-time exceeds dominant lag.",
        "Penalizing rapid control jumps (Δu²) in adaptive/RL cost functions avoids actuator oscillation.",
      ],
    },
    deepDiveSections: [
      {
        heading: "Connection to Industrial Hardware Practice",
        bullets: [
          "Grounded in practical exposure during the Manipal Engineering Internship involving real batch reactor thermal monitoring.",
          "Bridges high-level intelligent control concepts directly toward hardware-in-the-loop embedded PWM heater/valve implementation.",
        ],
      },
    ],
    achievementsOrOutcomes: [
      "Connected practical Manipal internship batch-reactor exposure with modern predictive and RL-inspired control formulations.",
      "Demonstrated how adaptive weighting addresses non-linear overshoot and dead-time trade-offs in thermal loops.",
    ],
    futureScope: [
      "Deploy trained lightweight control policy on an embedded microcontroller driving solid-state relays (SSRs) via RTD feedback.",
      "Validate real-time Hardware-in-the-Loop (HIL) tracking against physical heater-sensor test rigs.",
    ],
  },
};

/**
 * Resolves a structured ProjectReport for a database project by exact slug
 * or normalized title keyword match.
 */
export function getProjectReport(project: Pick<Project, "slug" | "title">): ProjectReport | null {
  if (project.slug && PROJECT_REPORTS[project.slug]) {
    return PROJECT_REPORTS[project.slug];
  }

  const normalized = `${project.slug || ""} ${project.title || ""}`.toLowerCase();
  if (normalized.includes("frequency-selective")) return PROJECT_REPORTS["frequency-selective-circuit"];
  if (normalized.includes("hospital management") || normalized.includes("python")) {
    return PROJECT_REPORTS["hospital-management-system-python"];
  }
  if (normalized.includes("tinkercad")) return PROJECT_REPORTS["tinkercad-electronic-circuit-design"];
  if (normalized.includes("fifo") || normalized.includes("systemverilog")) {
    return PROJECT_REPORTS["fifo-buffer-systemverilog"];
  }
  if (normalized.includes("timer")) return PROJECT_REPORTS["digital-timer-fpga"];
  if (normalized.includes("traffic")) return PROJECT_REPORTS["traffic-light-controller"];
  if (normalized.includes("robot")) return PROJECT_REPORTS["arduino-hospital-robot"];
  if (normalized.includes("reactor")) return PROJECT_REPORTS["reactor-temperature-control"];

  return null;
}
