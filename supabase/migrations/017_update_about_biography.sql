-- Migration: 017_update_about_biography
-- Description: Update bio field in profiles table with the new biography

UPDATE profiles
SET bio = 'I''m an Electronics and Communication Engineering student at NMAM Institute of Technology with a strong interest in VLSI design, FPGA development, digital electronics, and embedded systems. I enjoy exploring how hardware and intelligent computing work together to solve real-world engineering problems.

My technical journey involves working with Verilog, C, Python, MATLAB, and FPGA development tools such as Xilinx Vivado. Through academic projects and hands-on engineering experience, I''ve explored digital system design, hardware implementation, control systems, and embedded applications.

My long-term goal is to build a career in VLSI and hardware engineering, developing efficient, reliable, and innovative electronic systems. I''m always eager to learn, collaborate with others, and take on challenging projects that help me grow as an engineer.',
    updated_at = NOW();
