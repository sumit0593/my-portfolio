const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf-8');
let key = '';
for (const line of env.split('\n')) {
  if (line.startsWith('GEMINI_API_KEY=')) {
    key = line.split('=')[1].trim().replace(/^["']|["']$/g, '');
  }
}
const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({ apiKey: key });

(async () => {
  const models = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-3.1-flash-lite'];
  for (const m of models) {
    try {
      const res = await ai.models.generateContent({ model: m, contents: 'hello' });
      console.log(`[${m}] SUCCESS:`, res.text ? res.text.slice(0, 40) : 'No text');
    } catch(e) {
      console.error(`[${m}] ERROR:`, e.message);
    }
  }
})();
