'use client'
import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'

export default function ResumeAnalyzer() {
  const [jd, setJd] = useState('')
  const [response, setResponse] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const analyzeResume = async () => {
    setIsLoading(true)
    setResponse('')
    
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jd })
      })

      if (!res.ok) {
        throw new Error('Network response was not ok')
      }

      if (res.headers.get('Content-Type')?.includes('application/json')) {
        const data = await res.json()
        setResponse(data.result)
      } else {
        const reader = res.body?.getReader()
        if (!reader) return
        
        const decoder = new TextDecoder()
        let done = false

        while (!done) {
          const { value, done: doneReading } = await reader.read()
          done = doneReading
          const chunkValue = decoder.decode(value, { stream: true })
          setResponse((prev) => prev + chunkValue)
        }
      }
    } catch {
      setResponse("An error occurred while analyzing the resume.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">AI Resume Analyzer</h2>
      <textarea
        className="w-full h-40 p-2 border rounded"
        placeholder="Paste job description here..."
        value={jd}
        onChange={(e) => setJd(e.target.value)}
        disabled={isLoading}
      />
      <button 
        className="mt-4 px-6 py-2.5 bg-black dark:bg-white text-white dark:text-black font-medium rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[140px] hover:bg-gray-800 dark:hover:bg-gray-200 active:scale-95 transition-all duration-200" 
        onClick={analyzeResume}
        disabled={isLoading || !jd.trim()}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
        {isLoading ? 'Analyzing...' : 'Analyze'}
      </button>
      {response && (
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg prose prose-sm dark:prose-invert max-w-none break-words">
          <Markdown remarkPlugins={[remarkGfm, remarkBreaks]}>
            {response}
          </Markdown>
        </div>
      )}
    </div>
  )
}