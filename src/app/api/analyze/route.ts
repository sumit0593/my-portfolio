import { NextRequest, NextResponse } from 'next/server'
import { ai, CHAT_MODEL } from '@/lib/gemini'
import fs from 'fs/promises'
import path from 'path'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { jd = '', tool = 'resume-analyzer' } = body

    // Load the user's resume
    const resumePath = path.join(process.cwd(), 'resume.txt')
    let resumeContent = ''
    try {
      resumeContent = await fs.readFile(resumePath, 'utf-8')
    } catch (e) {
      console.error("Could not read resume.txt:", e)
      resumeContent = "Resume data unavailable."
    }

    let systemInstruction = 'You are an expert resume advisor.'
    let promptContext = ''

    // Configure system instructions and prompts based on the tool requested
    switch (tool) {
      case 'resume-analyzer':
        systemInstruction = `You are an elite Senior Tech Recruiter and ATS Optimization Expert. 
        Analyze the provided resume against the provided Job Description.
        Format your response in Markdown using the following structure:
        
        ## ATS Match Score: [Score]%
        **Verdict:** [Short sentence on fit]
        
        ### 🟢 Strengths
        - [Point 1]
        - [Point 2]
        
        ### 🔴 Missing Keywords / Gaps
        - [Point 1]
        - [Point 2]
        
        ### 💡 Actionable Recommendations
        - [Point 1]
        - [Point 2]
        `
        promptContext = `Job Description: ${jd}\n\nMy Resume:\n${resumeContent}`
        break;

      case 'resume-builder':
        systemInstruction = `You are an expert Resume Writer. Optimize the provided resume for the given target role or industry.`
        promptContext = `Target Role/Industry: ${jd}\n\nMy Current Resume:\n${resumeContent}`
        break;

      case 'jd-matcher':
        systemInstruction = `You are a Career Coach. Compare the resume to the JD and provide a highly detailed compatibility matrix.`
        promptContext = `Job Description: ${jd}\n\nMy Resume:\n${resumeContent}`
        break;

      case 'linkedin-summary':
        systemInstruction = `You are a Personal Branding Expert. Create 3 different variations of a LinkedIn summary (Professional, Story-driven, Short) based on this resume.`
        promptContext = `My Resume:\n${resumeContent}`
        break;

      case 'cover-letter':
        systemInstruction = `You are an expert Copywriter. Write a compelling, professional cover letter for the provided job description based on my resume. Do not hallucinate experiences I don't have.`
        promptContext = `Job Description: ${jd}\n\nMy Resume:\n${resumeContent}`
        break;

      case 'skill-gap':
        systemInstruction = `You are a Technical Mentor. Identify the technical skills missing from the resume compared to the JD, and suggest learning resources or project ideas to bridge the gap.`
        promptContext = `Job Description: ${jd}\n\nMy Resume:\n${resumeContent}`
        break;

      case 'interview-prep':
        systemInstruction = `You are a Technical Interviewer. Based on the JD and the candidate's resume, generate 5 highly probable technical questions and 3 behavioral questions they should prepare for.`
        promptContext = `Job Description: ${jd}\n\nMy Resume:\n${resumeContent}`
        break;

      case 'portfolio-content':
        systemInstruction = `You are a UX Writer. Extract the top 3 projects from the resume and rewrite their descriptions to be punchy and focused on business impact for a portfolio website.`
        promptContext = `My Resume:\n${resumeContent}`
        break;

      case 'cold-email':
        systemInstruction = `You are a B2B Sales Expert. Write a short, highly-converting cold email for reaching out to hiring managers for the role described in the JD, leveraging my resume's top achievements.`
        promptContext = `Job Description: ${jd}\n\nMy Resume:\n${resumeContent}`
        break;

      case 'prompt-generator':
        systemInstruction = `You are an AI Prompt Engineer. Suggest 3 advanced ChatGPT/Gemini prompts the user can use to further optimize their job search or interview prep for this specific JD.`
        promptContext = `Job Description: ${jd}\n\nMy Resume:\n${resumeContent}`
        break;

      default:
        systemInstruction = 'You are an expert resume advisor.'
        promptContext = `Prompt: ${jd}\n\nMy Resume:\n${resumeContent}`
    }

    const stream = await ai.models.generateContentStream({
      model: CHAT_MODEL,
      contents: promptContext,
      config: {
        systemInstruction,
        temperature: 0.7,
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
        } catch (err: any) {
          console.error("Stream error:", err);
          
          // Try to handle quota errors nicely during stream
          if (err.message?.includes("429") || err.message?.includes("quota")) {
             controller.enqueue(new TextEncoder().encode("\n\n*Error: Gemini API rate limit exceeded. Please try again later.*"));
          } else {
             controller.enqueue(new TextEncoder().encode("\n\n*An error occurred while generating the response.*"));
          }
          controller.close();
        }
      }
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'no-cache',
      }
    })
  } catch (err: any) {
    console.error("API Error:", err);
    
    if (err.message?.includes("429") || err.message?.includes("quota")) {
       return NextResponse.json({ result: "Gemini API rate limit exceeded. Please try again later." }, { status: 429 })
    }
    
    return NextResponse.json({ result: "We are currently down due to traffic. Please wait some time." }, { status: 500 })
  }
}
