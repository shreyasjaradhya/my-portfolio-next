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
    'I am an Electronics and Communication Engineering student interested in the intersection of hardware and intelligent computing. My interests span VLSI design, FPGA development, digital systems, embedded systems and hardware-oriented programming.',
    NULL,
    NULL,
    NULL
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
INSERT INTO projects (title, slug, description, technologies, featured, display_order)
VALUES 
(
    'Reactor Temperature Control',
    'reactor-temperature-control',
    'Reactor temperature-control project involving predictive modeling, adaptive weighting and reinforcement-learning concepts.',
    ARRAY['Machine Learning', 'Control Systems'],
    true,
    1
),
(
    'Digital Timer using FPGA',
    'digital-timer-fpga',
    'FPGA-based digital timer project.',
    ARRAY['FPGA', 'Verilog', 'Digital Design'],
    true,
    2
),
(
    'Traffic Light Controller',
    'traffic-light-controller',
    'Digital traffic-light controller project.',
    ARRAY['Verilog', 'FSM', 'Digital Electronics'],
    true,
    3
),
(
    'Arduino Hospital Robot',
    'arduino-hospital-robot',
    'Arduino-based prototype integrating ultrasonic obstacle detection, temperature/humidity sensing and motor control.',
    ARRAY['Arduino', 'Sensors', 'C/C++'],
    true,
    4
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
