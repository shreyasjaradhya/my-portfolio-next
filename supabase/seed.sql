-- Seed file: supabase/seed.sql
-- Description: Inserts verified personal portfolio data

-- ==============================================================================
-- CLEAR EXISTING SEED DATA (Optional, useful during development)
-- ==============================================================================
-- DELETE FROM profiles;
-- DELETE FROM projects;
-- DELETE FROM skills;
-- DELETE FROM experiences;
-- DELETE FROM education;

-- ==============================================================================
-- PROFILES
-- ==============================================================================
INSERT INTO profiles (name, title, bio, email, github_url, linkedin_url)
VALUES (
    'J Shreyas Aradhya',
    'Electronics and Communication Engineering',
    'I''m an Electronics and Communication Engineering student at NMAM Institute of Technology with a strong interest in VLSI design, FPGA development, digital electronics, and embedded systems. I enjoy exploring how hardware and intelligent computing work together to solve real-world engineering problems.

My technical journey involves working with Verilog, C, Python, MATLAB, and FPGA development tools such as Xilinx Vivado. Through academic projects and hands-on engineering experience, I''ve explored digital system design, hardware implementation, control systems, and embedded applications.

My long-term goal is to build a career in VLSI and hardware engineering, developing efficient, reliable, and innovative electronic systems. I''m always eager to learn, collaborate with others, and take on challenging projects that help me grow as an engineer.',
    'shreyasjaradhya@gmail.com',
    'https://github.com/shreyasjaradhya',
    'https://www.linkedin.com/in/shreyas-aradhya-0b9592321'
);

-- ==============================================================================
-- EDUCATION
-- ==============================================================================
INSERT INTO education (institution, degree, field, display_order)
VALUES (
    'NMAM Institute of Technology',
    'B.Tech',
    'Electronics and Communication Engineering',
    1
);

-- ==============================================================================
-- EXPERIENCES
-- ==============================================================================
INSERT INTO experiences (title, organization, description, display_order)
VALUES (
    'Engineering Internship',
    'Manipal',
    'Engineering internship involving a batch reactor and temperature-control project.',
    1
);

-- ==============================================================================
-- PROJECTS
-- ==============================================================================
INSERT INTO projects (title, slug, description, detailed_description, technologies, featured, display_order)
VALUES 
(
    'Hospital Management System using Python',
    'hospital-management-system-python',
    'Developed a Python-based hospital management system to manage patient registration, records, discharge, billing, and automated email delivery of bills.',
    'Developed a Python-based Hospital Management System to automate and optimize hospital administration from patient admission to discharge. Features menu-driven patient registration, ID-based record lookup, deletion of outdated records, persistent file handling (patients.txt), timestamped itemized billing (Ward Charges = Days × Daily Rate + Medicine Charges + Consultation Fee), and automated discharge bill delivery via SMTP.',
    ARRAY['Python', 'File Handling', 'SMTP', 'Email Automation', 'Date and Time Module'],
    true,
    1
),
(
    'Digital Timer using FPGA',
    'digital-timer-fpga',
    'FPGA-based digital timer project.',
    'Designed a synchronous FPGA digital timer in Verilog HDL using hierarchical clock-enable division, cascaded BCD seconds/minutes counters (00-59), Start/Pause/Reset FSM control, and a time-division multiplexed 7-segment display driver verified through behavioral RTL testbenches.',
    ARRAY['FPGA', 'Verilog', 'Digital Design'],
    true,
    2
),
(
    'Traffic Light Controller',
    'traffic-light-controller',
    'Digital traffic-light controller project.',
    'Modeled and verified a deterministic Moore Finite State Machine (FSM) intersection traffic controller in Verilog HDL cycling safely across NS_GREEN, NS_YELLOW, EW_GREEN, and EW_YELLOW phases with synchronous dwell timers and mutual-exclusion lamp checks.',
    ARRAY['Verilog', 'FSM', 'Digital Electronics'],
    true,
    3
),
(
    'Arduino Hospital Robot',
    'arduino-hospital-robot',
    'Arduino-based prototype integrating ultrasonic obstacle detection, temperature/humidity sensing and motor control.',
    'Engineered an embedded autonomous hospital utility prototype using Arduino and Embedded C/C++ integrating HC-SR04 ultrasonic time-of-flight collision avoidance, ward temperature and humidity telemetry, and PWM differential H-bridge DC motor control.',
    ARRAY['Arduino', 'Sensors', 'C/C++'],
    true,
    4
),
(
    'Frequency-Selective Circuit',
    'frequency-selective-circuit',
    'Designed and implemented a frequency-selective analog circuit that detects input signal frequencies and activates two LEDs for the 0–5 kHz and 6–12 kHz ranges.',
    'Designed, simulated in LTspice, and verified on Zero PCB a single-input analog frequency-selective indicator for Analog Electronics Circuits (AEC). Uses a Low-Pass Filter (R = 3.3 kOhm, C = 0.01 uF for 0-5 kHz) and cascaded Band-Pass Filter (2.7 kOhm HPF + 1.3 kOhm LPF for 6-12 kHz), LM358/LM311 buffers & comparators, 1N5819 peak detectors, and 330 Ohm current-limited LED outputs tested with a function generator and DSO.',
    ARRAY['Analog Electronics', 'LTspice', 'RC Filters', 'Operational Amplifiers', 'Comparators'],
    true,
    5
),
(
    'FIFO Buffer Design and Verification using SystemVerilog',
    'fifo-buffer-systemverilog',
    'Designed and verified a parameterized FIFO buffer using SystemVerilog, with automated testbench verification for read/write operations, overflow, underflow, and reset conditions.',
    'Implemented a parameterized FIFO RTL design (always_ff / always_comb) supporting byte-enable writes, flush, sync/async resets, First-Word Fall-Through (FWFT) mode, status flags, and error counters. Built an OOP SystemVerilog testbench (fifo_if modport BFM tasks, constrained-random transaction classes 50% write / 30% read / 20% burst, mailboxes, events, fork-join, and queue scoreboard) simulated at 100 MHz in ModelSim/QuestaSim and GTKWave.',
    ARRAY['SystemVerilog', 'RTL Design', 'ModelSim', 'GTKWave', 'Constrained Random Verification'],
    true,
    6
),
(
    'Electronic Circuit Design and Simulation using Tinkercad',
    'tinkercad-electronic-circuit-design',
    'Completed a two-week academic internship exploring Tinkercad for designing and simulating basic electronic circuits, including series and parallel circuits, Ohm’s law, and Arduino circuits.',
    'Two-week Internship I survey evaluating Autodesk Tinkercad (3D CSG & circuit simulator) at NMAMIT under Pradyumna G R. Modeled and compared Series LED circuits (3 V CR2032 split to 1.5 V per 2 V LED), Parallel LED branches (full 3 V supply illumination), and Ohm''s Law verification (9 V battery, 450 Ohm resistor, LED) against multimeter instrumentation.',
    ARRAY['Tinkercad', 'Circuit Simulation', 'Basic Electronics', 'Ohm’s Law', 'Arduino'],
    false,
    7
),
(
    'Reactor Temperature Control',
    'reactor-temperature-control',
    'Reactor temperature-control project involving predictive modeling, adaptive weighting and reinforcement-learning concepts.',
    'Explored closed-loop thermal regulation for industrial batch reactors exhibiting non-linear inertia and transport dead-time lags, combining predictive trajectory forecasting, adaptive ramp/setpoint error weighting, and reinforcement-learning reward concepts connected to batch reactor internship work in Manipal.',
    ARRAY['Machine Learning', 'Control Systems'],
    true,
    9
);

-- ==============================================================================
-- SKILLS
-- ==============================================================================
INSERT INTO skills (category, name, display_order) VALUES 
-- Hardware & VLSI
('Hardware & VLSI', 'VLSI Design', 1),
('Hardware & VLSI', 'FPGA', 2),
('Hardware & VLSI', 'Digital Electronics', 3),
('Hardware & VLSI', 'Hardware Verification', 4),
('Hardware & VLSI', 'PCB Design', 5),
('Hardware & VLSI', 'Verilog / SystemVerilog', 6),

-- Programming
('Programming', 'Python', 7),
('Programming', 'C', 8),
('Programming', 'Java', 9),

-- Tools
('Tools', 'Xilinx Vivado', 10),
('Tools', 'MATLAB', 11),
('Tools', 'KiCad', 12),
('Tools', 'LTSpice', 13),

-- Embedded
('Embedded', 'Embedded Systems', 14);
