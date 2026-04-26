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

    console.log(`[Chat] Query: "${userQuery}" | Session: ${sessionId}`);


    let retrievedChunks: any[] = [];
    try {
      retrievedChunks = await retrieveContext(userQuery, 5);

    } catch (err) {
      console.warn(
        "[Chat] Retrieval failed, proceeding without context:",
        err
      );
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
        maxOutputTokens: 1024,
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
        } catch (err) {
          console.error("[Chat] Stream error:", err);
          send({ type: "error", errorText: "Generation failed." });
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
  } catch (error) {
    console.error("Chat API Error:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to process chat request. Please try again.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
