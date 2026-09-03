# Sumit Kumar - Premium AI & Full Stack Portfolio

Welcome to the open-source repository of my personal portfolio! This is a production-grade, highly interactive **Generative AI & Full Stack Architecture** showcase built with cutting-edge web technologies and a fully functional AI RAG (Retrieval-Augmented Generation) Chatbot.

## 🚀 Live Demo
**[Click Here to View Live Portfolio](https://my-portfolio-six-gold-86.vercel.app/)**

---

## 🛠️ Tech Stack & Architecture

This application is built with a modern, scalable, and responsive stack focusing on high-end UX and AI integration.

### Frontend
* **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
* **Language**: [TypeScript](https://www.typescriptlang.org/)
* **Styling**: [Tailwind CSS v4.0](https://tailwindcss.com/)
* **Components**: [shadcn/ui](https://ui.shadcn.com/)
* **Animations**: [Framer Motion](https://www.framer.com/motion/)
* **Premium UI**: [Aceternity UI](https://ui.aceternity.com/) (3D Cards, Focus Cards, Images Badge, etc.)

### Backend & AI Pipeline (RAG Architecture)
* **LLM Engine**: Google Gemini API with Fallback Model support
* **Vector Database**: Pinecone
* **Authentication**: NextAuth.js v5 (GitHub, Google, Credentials-based Guest login)
* **API Layer**: Next.js Serverless Route Handlers

### AI Pipeline Workflow (How the Chatbot Works)
1. **Data Ingestion**: My professional resume and project data are chunked and converted into high-dimensional vector embeddings using Gemini Embedding models.
2. **Vector Storage**: These embeddings are indexed and securely stored in **Pinecone**.
3. **User Query**: When a user asks the portfolio chatbot a question, the query is embedded on the fly.
4. **Semantic Search**: The backend performs a similarity search against Pinecone to retrieve the most relevant context about my skills and experience.
5. **Generation**: The retrieved context is passed to the Gemini LLM alongside a strict system prompt to generate an accurate, grounded, and professional response.

---

## 🔒 Security & Hardening (DevSecOps)

This portfolio implements enterprise-grade DevSecOps security mitigations covering the OWASP Top 10:

*   **Server-Side Route Protection:** Protected routes are strictly guarded server-side using a Next.js Edge-compatible handler. Unauthenticated requests are rejected before rendering to prevent data leaks.
*   **Role-Based Access Control (RBAC):** NextAuth session tokens enforce granular roles (`guest`, `user`, `admin`). Guest sessions generate unique random IDs to prevent session hijacking.
*   **Secure API Route Guards:** All API routes are protected by session-based authentication checks.
*   **Destructive Endpoint Security:** Administrative operations are guarded by a strong private secret key, restricting access to authorized operators only.
*   **Fixed-Window Rate Limiting:** All endpoints are protected against abuse and budget exhaustion using a high-performance, in-memory rate limiter (powered by LRU Cache) configured with strict per-endpoint windows.
*   **Input Validation & Type Safety:** All incoming payloads are strictly validated using **Zod** schemas.
*   **HTML & Markdown Sanitization:**
    *   AI-generated output is sanitized using `rehype-sanitize` before rendering to block markdown-based XSS.
    *   User-supplied emails and messages are HTML-escaped before interpolation into transporter email bodies.
*   **Security Headers:** Configured strict HTTP headers including Content-Security-Policy (CSP), Strict-Transport-Security (HSTS), X-Frame-Options (SAMEORIGIN), and X-Content-Type-Options (nosniff) in `next.config.ts`.
*   **Prompt Injection Protection:** Cleans user queries to filter out instruction overrides and jailbreak phrases before sending payloads to Gemini.

---

## 💻 How to Run Locally (From Scratch)

Follow these steps to set up the project on your local machine.

### 1. Prerequisites
Make sure you have installed:
* [Node.js](https://nodejs.org/) (v18 or higher)
* npm, yarn, pnpm, or bun
* A Pinecone account
* A Google Gemini API Key

### 2. Clone the Repository
```bash
git clone https://github.com/sumit0593/my-portfolio.git
cd my-portfolio
```

### 3. Install Dependencies
```bash
npm install
# or
yarn install
# or
pnpm install
```

### 4. Setup Environment Variables
Create a `.env.local` file in the root of the project with the following keys:

| Variable | Description |
|---|---|
| `NEXTAUTH_URL` | Base URL of your app (e.g. `http://localhost:3000`) |
| `NEXTAUTH_SECRET` | A long, cryptographically random secret string |
| `ADMIN_EMBED_KEY` | A strong, private secret for authorizing admin ingestion |
| `GEMINI_API_KEY` | Your Google Gemini API key |
| `PINECONE_API_KEY` | Your Pinecone API key |
| `PINECONE_INDEX` | Your Pinecone index name |

> **Security Note:** Never commit `.env.local` or any real secret values to version control. Use a password manager or secrets vault to generate and store these values securely.

### 5. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result. The application supports hot-reloading.

### 6. Initialize Vector Database & Search Index (Data Ingestion)

#### Option A: Offline Local Search Index (MiniSearch Only)
If you just want to populate the local offline search index for local development without connecting to Pinecone:
```bash
node data/reindex-minisearch.js
```

#### Option B: Live Server Indexing (Pinecone + MiniSearch)
To populate Pinecone and the local MiniSearch index, trigger the ingestion endpoint while the Next.js development server is running. You must supply your `ADMIN_EMBED_KEY` value as the required authorization header — refer to the source code for the expected header name.

This will securely chunk the profile/metadata text files, generate Gemini embeddings, and push them to Pinecone.

---

## 🏗️ How to Build for Production

To create an optimized production build, run:

```bash
npm run build
```
This command compiles the Next.js application, optimizes images, and resolves all TypeScript types. 
To test the production build locally:
```bash
npm run start
```

---

## 🌍 Deployment

This portfolio is heavily optimized for edge networks and serverless environments. The recommended and easiest way to deploy this Next.js app is via **Vercel**.

### Deploying to Vercel
1. Push your code to a GitHub repository.
2. Go to [Vercel](https://vercel.com/) and sign in with GitHub.
3. Click on **Add New Project** and import your repository.
4. Open the **Environment Variables** section and paste the keys from your `.env.local` file.
5. Click **Deploy**.

Vercel will automatically handle CI/CD pipelines. Every time you push to the `main` branch, Vercel will trigger a new build and update your live portfolio.

---

## 🤝 Contact & Contributions
* **LinkedIn**: [Sumit Kumar](https://www.linkedin.com/in/sumit-kumar0509/)
* **Email**: sumitsumitsumit163@gmail.com
* **GitHub**: [sumit0593](https://github.com/sumit0593)

If you find this repository helpful for building your own AI portfolio, feel free to give it a ⭐!

## 📄 License

**Copyright © 2025–2026 Sumit Kumar. All Rights Reserved.**

This repository is published for **portfolio, educational, and evaluation purposes only**.

The source code, AI workflows, prompts, RAG implementation, system architecture, documentation, and related assets may **not** be copied, modified, redistributed, commercialized, or used to create derivative works without prior written permission from the author.

If you would like to use any part of this project, please contact:

**Email:** sumitsumitsumit163@gmail.com
