import { PortfolioKnowledge } from "./knowledgeBase";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface DispatchOptions {
  messages: ChatMessage[];
  systemPrompt: string;
  knowledge: PortfolioKnowledge;
}

// -------------------------------------------------------------
// Provider 1: Google Gemini (Native REST)
// -------------------------------------------------------------
async function callGemini(apiKey: string, options: DispatchOptions): Promise<ReadableStream<Uint8Array>> {
  // Convert standard messages to Gemini format
  const contents = options.messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?alt=sse&key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents,
      systemInstruction: {
        parts: [{ text: options.systemPrompt }],
      },
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 1200,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errorText}`);
  }

  // Parse SSE stream and emit clean text chunks
  const encoder = new TextEncoder();
  const reader = response.body?.getReader();
  if (!reader) throw new Error("No readable stream from Gemini");

  return new ReadableStream({
    async start(controller) {
      let buffer = "";
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += new TextDecoder().decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const dataStr = line.replace(/^data:\s*/, "").trim();
              if (dataStr === "[DONE]") continue;
              try {
                const parsed = JSON.parse(dataStr);
                const textChunk =
                  parsed.candidates?.[0]?.content?.parts?.[0]?.text;
                if (textChunk) {
                  controller.enqueue(encoder.encode(textChunk));
                }
              } catch {
                // Ignore parse errors on keep-alives
              }
            }
          }
        }
      } catch (err) {
        controller.error(err);
      } finally {
        controller.close();
      }
    },
  });
}

// -------------------------------------------------------------
// Provider 2 & 3: OpenAI or Groq (OpenAI-compatible chat completion)
// -------------------------------------------------------------
async function callOpenAICompatible(
  endpoint: string,
  apiKey: string,
  model: string,
  options: DispatchOptions
): Promise<ReadableStream<Uint8Array>> {
  const messages = [
    { role: "system", content: options.systemPrompt },
    ...options.messages.map((m) => ({ role: m.role, content: m.content })),
  ];

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.3,
      max_tokens: 1200,
      stream: true,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API error (${response.status}): ${errorText}`);
  }

  const encoder = new TextEncoder();
  const reader = response.body?.getReader();
  if (!reader) throw new Error("No readable stream from LLM provider");

  return new ReadableStream({
    async start(controller) {
      let buffer = "";
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += new TextDecoder().decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const dataStr = line.replace(/^data:\s*/, "").trim();
              if (dataStr === "[DONE]") continue;
              try {
                const parsed = JSON.parse(dataStr);
                const textChunk = parsed.choices?.[0]?.delta?.content;
                if (textChunk) {
                  controller.enqueue(encoder.encode(textChunk));
                }
              } catch {
                // Ignore keep-alives
              }
            }
          }
        }
      } catch (err) {
        controller.error(err);
      } finally {
        controller.close();
      }
    },
  });
}

// -------------------------------------------------------------
// Provider 4: Fallback Knowledge Engine (When no cloud API key is configured)
// -------------------------------------------------------------
function generateFallbackResponse(
  query: string,
  knowledge: PortfolioKnowledge
): string {
  const q = query.toLowerCase();

  // 1. Shreyas Introduction / Who is he
  if (q.includes("shreyas") || q.includes("who are you") || q.includes("about you") || q.includes("tell me about") || q.includes("introduce")) {
    return `### About J Shreyas Aradhya\n\n**J Shreyas Aradhya** is an **Electronics and Communication Engineering** undergraduate student at **NMAM Institute of Technology (NMAMIT), Nitte**.\n\nHis technical focus lies in:\n* **VLSI Design & Hardware Verification**\n* **FPGA Development** (Xilinx Vivado, synthesizable Verilog/SystemVerilog)\n* **Digital Electronics & State Machine Design**\n* **Embedded Systems** (microcontrollers, sensor telemetry, and motor control)\n\nShreyas is passionate about building dependable hardware systems and bridging synthesizable silicon architectures with intelligent control algorithms. You can explore his repositories on [GitHub](https://github.com/shreyasjaradhya) or connect on [LinkedIn](https://www.linkedin.com/in/shreyas-aradhya-0b9592321).`;
  }

  // 2. Strongest Technical Skills
  if (q.includes("skill") || q.includes("technolog") || q.includes("stack") || q.includes("tools")) {
    const skillsList = Object.entries(knowledge.skillsByCategory)
      .map(([cat, list]) => `* **${cat}**: ${list.join(", ")}`)
      .join("\n");
    return `### Shreyas's Core Technical Skills\n\nShreyas has structured hands-on expertise across hardware design, programming, and EDA tooling:\n\n${skillsList}\n\nHis primary engineering strengths center on writing clean, synthesizable **Verilog/SystemVerilog RTL**, simulating analog and digital circuits in **LTspice** and **ModelSim**, and developing firmware in **C** and **Python**.`;
  }

  // 3. Reactor Temperature Control Project
  if (q.includes("reactor") || q.includes("temperature control") || q.includes("manipal")) {
    return `### Reactor Temperature Control System\n\n* **Domain**: Control Systems & Predictive Modeling\n* **Context**: Inspired by industrial batch chemical reactor processes during his internship in Manipal.\n\n#### Key Architectural Details:\n* **Process Challenge**: Industrial batch chemical reactors exhibit high thermal inertia, non-linear jacket heat exchange, and significant transport dead-time lags.\n* **Implementation**: Modeled and simulated closed-loop thermal regulation combining **anti-windup PID control** and **adaptive trajectory forecasting** to minimize temperature overshoot.\n* **Algorithms Explored**: Evaluated Bang-Bang thresholding vs. PID control with back-calculation anti-windup, alongside adaptive weighting concepts for setpoint tracking.\n\nYou can inspect the simulation code and engineering documentation in his [Reactor Temperature Control Repository](https://github.com/shreyasjaradhya/reactor-temperature-control).`;
  }

  // 4. FPGA and Verilog Experience
  if (q.includes("fpga") || q.includes("verilog") || q.includes("timer")) {
    return `### FPGA & Verilog Experience\n\nShreyas actively designs and synthesizes synchronous digital hardware using **Verilog HDL** and **SystemVerilog** with **Xilinx Vivado** and **ModelSim**.\n\n#### Key FPGA & Verilog Highlights:\n1. **Digital Timer using FPGA**: Designed a synchronous digital timer featuring a hierarchical 50 MHz to 1 Hz clock divider, cascaded BCD modulo-10 and modulo-6 counters (00–59 seconds, 00–59 minutes), and a 1 kHz time-division multiplexed 4-digit 7-segment display driver.\n2. **FIFO Buffer Design & Verification**: Implemented a synthesizable circular FIFO with byte-enable masking and First-Word Fall-Through (FWFT), verified through a layered OOP SystemVerilog testbench with scoreboards and mailboxes.\n3. **Traffic Light Controller**: Designed a deterministic Moore Finite State Machine (FSM) with dwell counters and safety lamp interlocks.`;
  }

  // 5. All Projects Overview
  if (q.includes("project") || q.includes("portfolio work") || q.includes("what has he built")) {
    return `### Featured Engineering Projects Developed by Shreyas\n\nShreyas has implemented and hardware-verified **8 comprehensive engineering projects**:\n\n1. **Dual-Band Frequency-Selective Circuit** (Analog Electronics / LTspice / LM358 filters for 0–5 kHz and 6–12 kHz)\n2. **Hospital Management System using Python** (Flat-file storage, billing engine, automated SMTP email dispatch)\n3. **FIFO Buffer Design & Verification** (SystemVerilog RTL with byte-enables, OOP constrained-random testbench)\n4. **Circuit Design & Simulation using Tinkercad** (Ohm's law validation, series/parallel LED analysis, Arduino)\n5. **Digital Timer using FPGA** (Synchronous 50 MHz Verilog RTL, cascaded BCD counters, 7-segment multiplexer)\n6. **Traffic Light Controller** (Deterministic Moore FSM in Verilog with dwell timers and safety interlocks)\n7. **Autonomous Hospital Utility Robot** (Arduino C++, ultrasonic obstacle avoidance, L298N motor drivers)\n8. **Reactor Temperature Control System** (Batch reactor thermal dynamics simulation, anti-windup PID)\n\nEach project includes full source code, testbenches, and reports on his [GitHub Profile](https://github.com/shreyasjaradhya).`;
  }

  // 6. Career Interests / Goals
  if (q.includes("career") || q.includes("interest") || q.includes("goal") || q.includes("future")) {
    return `### Shreyas's Career Interests & Direction\n\nShreyas's primary career aspiration is to build a high-impact engineering career in **VLSI Design, Silicon Engineering, and Hardware Architecture**.\n\nHis specific focus areas include:\n* **RTL Design & Synthesis**: Developing efficient, synthesizable digital architectures in Verilog/SystemVerilog.\n* **Hardware Verification**: Constrained-random verification, assertion-based checks, and coverage-driven testbenches.\n* **FPGA Prototyping & Emulation**: Testing and mapping complex logic designs onto hardware development boards.\n* **Hardware-Software Co-Design**: Integrating low-level firmware and embedded drivers with underlying silicon accelerators.`;
  }

  // 7. Education
  if (q.includes("education") || q.includes("college") || q.includes("university") || q.includes("nmamit") || q.includes("degree")) {
    return `### Educational Background\n\n* **Degree**: Bachelor of Technology (B.Tech)\n* **Discipline**: Electronics and Communication Engineering\n* **Institution**: **NMAM Institute of Technology (NMAMIT), Nitte**\n\nHis academic curriculum encompasses VLSI Design, Digital Electronics, Analog Electronic Circuits, Computer Architecture, Embedded Systems, and Control Systems.`;
  }

  // 8. Contact Information
  if (q.includes("contact") || q.includes("email") || q.includes("reach") || q.includes("hire") || q.includes("connect")) {
    return `### How to Connect with Shreyas\n\nYou can reach out to Shreyas directly through any of his verified channels:\n* **LinkedIn**: [linkedin.com/in/shreyas-aradhya-0b9592321](https://www.linkedin.com/in/shreyas-aradhya-0b9592321)\n* **GitHub**: [@shreyasjaradhya](https://github.com/shreyasjaradhya)\n* **Email**: [shreyasjaradhya@gmail.com](mailto:shreyasjaradhya@gmail.com)\n* **Portfolio Contact Form**: Scroll down to the **Contact** section at the bottom of this website.`;
  }

  // 9. General Technical Topic or Catch-All Grounded Answer
  return `### Information Regarding: "${query.trim()}"\n\nBased on Shreyas's verified portfolio:\n\n* **Primary Disciplines**: Electronics & Communication Engineering, VLSI Design, FPGA Development, and Embedded Systems.\n* **Key Tools & Languages**: Verilog HDL, SystemVerilog, Python, C, Xilinx Vivado, MATLAB, LTspice, and ModelSim.\n\nFor deep dives into his 8 engineering projects (such as his FPGA Digital Timer, Frequency-Selective Analog Circuit, or SystemVerilog FIFO Buffer), feel free to ask a specific project question or click one of the suggested prompts above!`;
}

function createTextStream(text: string): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      // Chunk output into readable words for typing cadence
      const words = text.split(" ");
      let i = 0;
      function pushChunk() {
        if (i >= words.length) {
          controller.close();
          return;
        }
        const slice = words.slice(i, i + 3).join(" ") + (i + 3 < words.length ? " " : "");
        controller.enqueue(encoder.encode(slice));
        i += 3;
        setTimeout(pushChunk, 15);
      }
      pushChunk();
    },
  });
}

// -------------------------------------------------------------
// Main Dispatcher Function
// -------------------------------------------------------------
export async function dispatchAIChat(
  options: DispatchOptions
): Promise<{ stream: ReadableStream<Uint8Array>; provider: string }> {
  // 1. Google Gemini API
  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey && geminiKey.trim()) {
    try {
      const stream = await callGemini(geminiKey.trim(), options);
      return { stream, provider: "Google Gemini 2.0 Flash" };
    } catch (err: any) {
      console.warn("Gemini call failed, falling back to next provider:", err.message);
    }
  }

  // 2. OpenAI API
  const openaiKey = process.env.OPENAI_API_KEY;
  if (openaiKey && openaiKey.trim()) {
    try {
      const stream = await callOpenAICompatible(
        "https://api.openai.com/v1/chat/completions",
        openaiKey.trim(),
        "gpt-4o-mini",
        options
      );
      return { stream, provider: "OpenAI GPT-4o-mini" };
    } catch (err: any) {
      console.warn("OpenAI call failed, falling back to next provider:", err.message);
    }
  }

  // 3. Groq API
  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey && groqKey.trim()) {
    try {
      const stream = await callOpenAICompatible(
        "https://api.groq.com/openai/v1/chat/completions",
        groqKey.trim(),
        "llama-3.3-70b-versatile",
        options
      );
      return { stream, provider: "Groq Llama 3.3 70B" };
    } catch (err: any) {
      console.warn("Groq call failed, falling back to fallback engine:", err.message);
    }
  }

  // 4. Fallback Knowledge Engine
  const lastUserMessage =
    [...options.messages].reverse().find((m) => m.role === "user")?.content ||
    "Tell me about Shreyas";
  const answer = generateFallbackResponse(lastUserMessage, options.knowledge);
  const stream = createTextStream(answer);
  return { stream, provider: "Portfolio Knowledge Engine (Grounding Mode)" };
}
