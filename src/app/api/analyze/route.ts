import { NextRequest, NextResponse } from 'next/server'
import { ai, CHAT_MODEL } from '@/lib/gemini'

export async function POST(req: NextRequest) {
  try {
    const { jd } = await req.json()

    const stream = await ai.models.generateContentStream({
      model: CHAT_MODEL,
      contents: `Analyze my resume against this JD: ${jd}`,
      config: {
        systemInstruction: 'You are an expert resume advisor.',
      }
    })

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.text;
            if (text) {
              controller.enqueue(new TextEncoder().encode(text));
            }
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      }
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'no-cache',
      }
    })
  } catch {
    return NextResponse.json({ result: "We are currently down due to traffic. Please wait some time." }, { status: 500 })
  }
}
