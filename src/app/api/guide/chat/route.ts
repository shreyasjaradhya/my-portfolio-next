import { NextRequest, NextResponse } from "next/server";
import { buildPortfolioKnowledge } from "@/lib/ai/knowledgeBase";
import { generateGuideSystemPrompt } from "@/lib/ai/systemPrompt";
import { dispatchAIChat, ChatMessage } from "@/lib/ai/aiDispatcher";

// In-memory sliding window rate limiter: max 30 requests per IP per 60 seconds
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60000 });
    return true;
  }

  if (entry.count >= 30) {
    return false;
  }

  entry.count += 1;
  return true;
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a moment before sending another message." },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body || !Array.isArray(body.messages) || body.messages.length === 0) {
      return NextResponse.json(
        { error: "Invalid request. 'messages' must be a non-empty array." },
        { status: 400 }
      );
    }

    // Limit conversation context to latest 12 messages to keep latency low & prevent token flooding
    const rawMessages: any[] = body.messages.slice(-12);
    const messages: ChatMessage[] = [];

    for (const msg of rawMessages) {
      if (!msg || typeof msg.content !== "string") continue;
      const role = msg.role === "assistant" ? "assistant" : "user";
      // Sanitize length: max 1200 characters per message
      const sanitizedContent = msg.content.trim().slice(0, 1200);
      if (sanitizedContent) {
        messages.push({ role, content: sanitizedContent });
      }
    }

    if (messages.length === 0) {
      return NextResponse.json(
        { error: "No valid message content provided." },
        { status: 400 }
      );
    }

    // Retrieve fresh portfolio knowledge base
    const knowledge = await buildPortfolioKnowledge();
    const systemPrompt = generateGuideSystemPrompt(knowledge);

    // Dispatch to active AI provider (Gemini -> OpenAI -> Groq -> Local Grounded Engine)
    const { stream, provider } = await dispatchAIChat({
      messages,
      systemPrompt,
      knowledge,
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "X-AI-Provider": provider,
      },
    });
  } catch (err: any) {
    console.error("Guide chat API handler error:", err);
    return NextResponse.json(
      {
        error:
          "Guide encountered an unexpected temporary error. Please try asking again in a moment.",
        details: process.env.NODE_ENV === "development" ? err.message : undefined,
      },
      { status: 500 }
    );
  }
}
