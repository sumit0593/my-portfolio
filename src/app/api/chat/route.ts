import { ai, CHAT_MODEL } from "@/lib/gemini";
import { retrieveContext, buildRAGPrompt, conversationMemory } from "@/lib/rag";

export const maxDuration = 60;

/**
 * POST /api/chat
 * Handles chat queries, retrieves Pinecone context, and streams Gemini responses.
 */
export async function POST(req: Request) {
  try {
    const { messages } = await req.json();


    const lastUserMessage = messages
      .filter((m: any) => m.role === "user")
      .pop();
    let userQuery = "";
    if (lastUserMessage) {
      if (lastUserMessage.parts && Array.isArray(lastUserMessage.parts)) {
        userQuery = lastUserMessage.parts
          .filter((p: any) => p.type === "text")
          .map((p: any) => p.text)
          .join(" ");
      } else if (lastUserMessage.content) {
        userQuery = lastUserMessage.content;
      }
    }

    if (!userQuery.trim()) {
      return new Response(
        JSON.stringify({ error: "Empty query received." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }


    const sessionId =
      req.headers.get("x-session-id") || "default-session";



    let retrievedChunks: any[] = [];
    try {
      retrievedChunks = await retrieveContext(userQuery, 5);

    } catch {
      // Retrieval failed, proceed without context
    }


    const conversationHistory = conversationMemory.getHistory(sessionId);


    const systemPrompt = buildRAGPrompt(
      retrievedChunks,
      conversationHistory,
      userQuery
    );


    conversationMemory.addMessage(sessionId, {
      role: "user",
      content: userQuery,
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

        const send = (data: object) => {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
          );
        };


        send({ type: "start" });
        send({ type: "start-step" });
        send({ type: "text-start", id: textId });

        try {
          for await (const chunk of stream) {
            const text = chunk.text ?? "";
            if (text) {
              fullResponse += text;
              send({ type: "text-delta", id: textId, delta: text });
            }
          }
        } catch (streamErr: any) {
          const errMsg = streamErr?.message || "";
          const isRateLimit = errMsg.includes("429") || errMsg.toLowerCase().includes("rate") || errMsg.toLowerCase().includes("quota");
          const fallback = isRateLimit
            ? "AI services are currently busy. Please try again after a short interval."
            : "I'm having trouble generating a response right now. Please try again.";
          send({ type: "text-delta", id: textId, delta: fallback });
          fullResponse += fallback;
        }


        send({ type: "text-end", id: textId });
        send({ type: "finish-step" });
        send({ type: "finish", finishReason: "stop" });
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));


        if (fullResponse) {
          conversationMemory.addMessage(sessionId, {
            role: "assistant",
            content: fullResponse,
          });

        }

        controller.close();
      },
    });

    return new Response(sseStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "X-Vercel-AI-UI-Message-Stream": "v1",
      },
    });
  } catch (err: any) {
    const errMsg = err?.message || "";
    const isRateLimit = errMsg.includes("429") || errMsg.toLowerCase().includes("rate") || errMsg.toLowerCase().includes("quota");
    const userMessage = isRateLimit
      ? "AI services are currently busy or rate-limited. Please try again after some time."
      : "Failed to process chat request. Please try again.";
    return new Response(
      JSON.stringify({ error: userMessage }),
      { status: isRateLimit ? 429 : 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
