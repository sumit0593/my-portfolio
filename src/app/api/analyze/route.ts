import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

export async function POST(req: NextRequest) {
  try {
    console.log('1234', process.env.OPENAI_API_KEY!)
    const { jd } = await req.json()

    const chat = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are an expert resume advisor.' },
        { role: 'user', content: `Analyze my resume against this JD: ${jd}` },
      ],
      model: 'gpt-3.5-turbo',
    })

    console.log('1234', chat.choices[0].message.content)
    return NextResponse.json({ result: chat.choices[0].message.content })
  } catch (error) {
    console.error("Analyze API Error:", error)
    return NextResponse.json({ result: "we are currenlty down due to traffice pleace wait some time" })
  }
}
