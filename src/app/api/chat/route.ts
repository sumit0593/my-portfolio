import { ai, CHAT_MODEL } from "@/lib/gemini";
import { retrieveHybridContext, buildOrchestratedPrompt, conversationMemory } from "@/lib/orchestrator";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const lastUserMessage = messages.filter((m: any) => m.role === "user").pop();
    let userQuery = "";
    if (lastUserMessage) {
      userQuery = lastUserMessage.content || 
                  (Array.isArray(lastUserMessage.parts) ? lastUserMessage.parts.map((p:any) => p.text).join(" ") : "");
    }

    if (!userQuery.trim()) {
      return new Response(JSON.stringify({ error: "Empty query received." }), { status: 400 });
    }

    const sessionId = req.headers.get("x-session-id") || "default-session";

    // Retrieve via Orchestrator (Pinecone + MiniSearch)
    const { chunks: retrievedChunks, intent } = await retrieveHybridContext(userQuery, 5);
    const conversationHistory = conversationMemory.getHistory(sessionId);

    const systemPrompt = buildOrchestratedPrompt(retrievedChunks, conversationHistory, userQuery, intent);

    conversationMemory.addMessage(sessionId, { role: "user", content: userQuery });

    // AbortController handling for stream cancellation
    const abortController = new AbortController();
    req.signal.addEventListener("abort", () => {
      abortController.abort();
    });

    const stream = await ai.models.generateContentStream({
      model: CHAT_MODEL,
      contents: userQuery,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.15,
        topP: 0.8,
        maxOutputTokens: 512,
      },
    });

    const textId = "0";
    let fullResponse = "";

    const sseStream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        const send = (data: object) => controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));

        send({ type: "start" });
        send({ type: "start-step" });
        send({ type: "text-start", id: textId });

        try {
          for await (const chunk of stream) {
            if (abortController.signal.aborted) break;
            const text = chunk.text ?? "";
            if (text) {
              fullResponse += text;
              send({ type: "text-delta", id: textId, delta: text });
            }
          }
        } catch {
          if (!abortController.signal.aborted) {
            send({ type: "text-delta", id: textId, delta: "I'm having trouble connecting right now. Please try again." });
          }
        }

        if (!abortController.signal.aborted) {
          send({ type: "text-end", id: textId });
          send({ type: "finish-step" });
          send({ type: "finish", finishReason: "stop" });
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));

          if (fullResponse) {
            conversationMemory.addMessage(sessionId, { role: "assistant", content: fullResponse });
          }
        }
        controller.close();
      },
    });

    return new Response(sseStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "X-Vercel-AI-UI-Message-Stream": "v1",
      },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || "Failed to process chat request." }), { status: 500 });
  }
}
