'use client'
import { useState } from 'react'
import axios from 'axios'

export default function ResumeAnalyzer() {
  const [jd, setJd] = useState('')
  const [response, setResponse] = useState('')

  const analyzeResume = async () => {
    const res = await axios.post('/api/analyze', { jd })
    console.log(res)
    setResponse(res.data.result)
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">AI Resume Analyzer</h2>
      <textarea
        className="w-full h-40 p-2 border rounded"
        placeholder="Paste job description here..."
        value={jd}
        onChange={(e) => setJd(e.target.value)}
      />
      <button className="mt-4 px-4 py-2 bg-black text-white rounded" onClick={analyzeResume}>
        Analyze
      </button>
      {response && <div className="mt-6 p-4 bg-gray-100 rounded">{response}</div>}
    </div>
  )
}