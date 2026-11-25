-- Migration: 024_update_project_reports
-- Description: Populates thorough detailed_description summaries for all 8 portfolio projects

UPDATE projects
SET detailed_description = 'Developed a Python-based Hospital Management System to automate hospital workflows from registration to discharge. Supports patient registration, record listing, ID-based lookup, record deletion, itemized discharge billing (Ward Charges = Days × Daily Rate + Medicine Charges + Consultation Fee) with datetime logging, persistent patients.txt storage, and automated SMTP email dispatch of invoices.',
    updated_at = NOW()
WHERE slug = 'hospital-management-system-python';

UPDATE projects
SET detailed_description = 'Designed, simulated in LTspice, and verified on Zero PCB a single-input analog frequency-selective indicator for Analog Electronics Circuits (AEC). Uses a Low-Pass Filter (R = 3.3 kΩ, C = 0.01 µF for 0–5 kHz) and cascaded Band-Pass Filter (2.7 kΩ HPF + 1.3 kΩ LPF for 6–12 kHz), LM358/LM311 buffers and comparators, 1N5819 diode peak detectors, resistive Vref network, and 330 Ω current-limited LEDs verified at 3 kHz and 8 kHz via Function Generator and DSO.',
    updated_at = NOW()
WHERE slug = 'frequency-selective-circuit';

UPDATE projects
SET detailed_description = 'Designed and verified a parameterized FIFO buffer RTL design (always_ff / always_comb) in SystemVerilog supporting configurable width/depth, byte-enable writes, flush, synchronous/asynchronous reset, First-Word Fall-Through (FWFT) mode, status flags, and error counters. Built an OOP verification testbench using interface modport BFM tasks (do_write, do_read, do_flush), constrained-random transaction classes (50% write, 30% read, 20% burst), mailboxes, events, fork-join, and a queue scoreboard simulated at 100 MHz in ModelSim/QuestaSim and GTKWave.',
    updated_at = NOW()
WHERE slug = 'fifo-buffer-systemverilog';

UPDATE projects
SET detailed_description = 'Completed a two-week Internship I survey evaluating Autodesk Tinkercad (3D CSG CAD & circuit simulator) at NMAMIT under Pradyumna G R. Simulated and cross-verified Series LED circuits (3 V CR2032 split across two 2 V LEDs), Parallel LED circuits (equal branch potential across three LED legs), Ohm''s Law verification (9 V battery with 450 Ω resistor and LED), and simple Arduino circuits against theoretical multimeter measurements.',
    updated_at = NOW()
WHERE slug = 'tinkercad-electronic-circuit-design';

UPDATE projects
SET detailed_description = 'Engineered a synchronous FPGA digital timer in Verilog HDL using single-clock-domain tick division, cascaded BCD counters (00–59 seconds and minutes), synchronized Start/Pause/Reset FSM control, and time-division multiplexed 7-segment display drivers verified in behavioral RTL simulation.',
    updated_at = NOW()
WHERE slug = 'digital-timer-fpga' AND (detailed_description IS NULL OR TRIM(detailed_description) = '');

UPDATE projects
SET detailed_description = 'Modeled and verified a deterministic Moore Finite State Machine (FSM) intersection traffic controller in Verilog HDL cycling across NS_GREEN, NS_YELLOW, EW_GREEN, and EW_YELLOW phases with synchronous dwell counters, reset recovery, and mutual-exclusion green phase checks.',
    updated_at = NOW()
WHERE slug = 'traffic-light-controller' AND (detailed_description IS NULL OR TRIM(detailed_description) = '');

UPDATE projects
SET detailed_description = 'Built an autonomous Arduino hospital utility robot prototype integrating HC-SR04 ultrasonic obstacle detection (d = echo_us * 0.0343 / 2), ambient ward temperature/humidity sensing, and dual H-bridge PWM motor control written in Embedded C/C++.',
    updated_at = NOW()
WHERE slug = 'arduino-hospital-robot' AND (detailed_description IS NULL OR TRIM(detailed_description) = '');

UPDATE projects
SET detailed_description = 'Explored closed-loop batch reactor temperature regulation addressing non-linear thermal inertia and dead-time lags through predictive trajectory forecasting, adaptive ramp/setpoint error weighting, and reinforcement-learning reward concepts connected to batch reactor internship work in Manipal.',
    updated_at = NOW()
WHERE slug = 'reactor-temperature-control' AND (detailed_description IS NULL OR TRIM(detailed_description) = '');
