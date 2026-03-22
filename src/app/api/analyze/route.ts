import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

export async function POST(req: NextRequest) {
  try {
    const { jd } = await req.json()

    const chat = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are an expert resume advisor.' },
        { role: 'user', content: `Analyze my resume against this JD: ${jd}` },
      ],
      model: 'gpt-4o-mini',
    })

    return NextResponse.json({ result: chat.choices[0].message.content })
  } catch (error) {
    console.error("Analyze API Error:", error)
    return NextResponse.json({ result: "We are currently down due to traffic. Please wait some time." })
  }
}
