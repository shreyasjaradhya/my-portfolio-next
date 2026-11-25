// Configuration and constants for Guide AI Assistant

export interface GuideConfig {
  enabled: boolean;
  name: string;
  subtitle: string;
  welcomeMessage: string;
  defaultQuestions: string[];
  shufflePools: string[][];
}

export const DEFAULT_GUIDE_CONFIG: GuideConfig = {
  enabled: true,
  name: "Guide",
  subtitle: "AI Portfolio Assistant",
  welcomeMessage:
    "Hello! I'm Guide, your AI portfolio assistant. I'm here to help you explore Shreyas's engineering journey, technical skills, projects, experience, achievements, and interests. Ask me anything!",
  defaultQuestions: [
    "Tell me about Shreyas.",
    "What are his strongest technical skills?",
    "Explain his Reactor Temperature Control project.",
    "What is his experience with FPGA and Verilog?",
    "What projects has he developed?",
    "What are his career interests?",
  ],
  shufflePools: [
    [
      "Tell me about Shreyas.",
      "What are his strongest technical skills?",
      "Explain his Reactor Temperature Control project.",
      "What is his experience with FPGA and Verilog?",
      "What projects has he developed?",
      "What are his career interests?",
    ],
    [
      "Explain his Frequency-Selective circuit project.",
      "How did he verify the FIFO Buffer in SystemVerilog?",
      "What did he do during his Manipal Internship?",
      "Does Shreyas have experience with Python and C?",
      "What is his educational background at NMAMIT?",
      "How does the Hospital Management System work?",
    ],
    [
      "Explain the FPGA Digital Timer architecture.",
      "What is his experience with LTspice and circuit design?",
      "How does the Traffic Light Controller FSM work?",
      "What sensors does the Arduino Hospital Robot use?",
      "Where can I find his GitHub repositories?",
      "How can I connect with or contact Shreyas?",
    ],
  ],
};
