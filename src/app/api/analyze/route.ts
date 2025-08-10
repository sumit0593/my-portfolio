import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

export async function POST(req: NextRequest) {
  const { jd } = await req.json()

  const chat = await openai.chat.completions.create({
    messages: [
      { role: 'system', content: 'You are an expert resume advisor.' },
      { role: 'user', content: `Analyze my resume against this JD: ${jd}` },
    ],
    model: 'gpt-3.5-turbo',
  })

  return NextResponse.json({ result: chat.choices[0].message.content })
}
