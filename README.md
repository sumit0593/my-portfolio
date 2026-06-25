# Sumit Kumar - Premium AI & Full Stack Portfolio

Welcome to the open-source repository of my personal portfolio! This is a production-grade, highly interactive **Generative AI & Full Stack Architecture** showcase built with cutting-edge web technologies and a fully functional AI RAG (Retrieval-Augmented Generation) Chatbot.

## 🚀 Live Demo
**[Click Here to View Live Portfolio](https://my-portfolio-six-gold-86.vercel.app/)**

---

## 🛠️ Tech Stack & Architecture

This application is built with a modern, scalable, and responsive stack focusing on high-end UX and AI integration.

### Frontend
* **Framework**: [Next.js 14+ (App Router)](https://nextjs.org/)
* **Language**: [TypeScript](https://www.typescriptlang.org/)
* **Styling**: [Tailwind CSS v4.0](https://tailwindcss.com/)
* **Components**: [shadcn/ui](https://ui.shadcn.com/)
* **Animations**: [Framer Motion](https://www.framer.com/motion/)
* **Premium UI**: [Aceternity UI](https://ui.aceternity.com/) (3D Cards, Focus Cards, Images Badge, etc.)

### Backend & AI Pipeline (RAG Architecture)
* **LLM Engine**: Google Gemini API (`gemini-3.5-flash` / `gemini-embedding-001`) Fallback Modal added gemini-3.1-flash-lite 
  
* **Vector Database**: Pinecone
* **Authentication**: NextAuth.js (GitHub, Google, Credentials)
* **API Layer**: Next.js Serverless Route Handlers

### AI Pipeline Workflow (How the Chatbot Works)
1. **Data Ingestion**: My professional resume and project data are chunked and converted into 3072-dimensional vector embeddings using Gemini Embedding models.
2. **Vector Storage**: These embeddings are indexed and securely stored in **Pinecone**.
3. **User Query**: When a user asks the portfolio chatbot a question, the query is embedded on the fly.
4. **Semantic Search**: The backend performs a similarity search against Pinecone to retrieve the most relevant context about my skills and experience.
5. **Generation**: The retrieved context is passed to the Gemini LLM alongside a strict system prompt to generate an accurate, grounded, and professional response.

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
Create a `.env.local` file in the root of the project and add the following keys:
```env
# Next Auth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-a-random-secret-key"

# AI & Vector DB
GEMINI_API_KEY="your_google_gemini_api_key"
PINECONE_API_KEY="your_pinecone_api_key"
PINECONE_INDEX="your_pinecone_index_name"
```

### 5. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result. The application supports hot-reloading.

### 6. Initialize Vector Database (Data Ingestion)
To populate Pinecone and the local MiniSearch index with your resume and project data, run the following command in a new **PowerShell** window while the development server is running:
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/embed" -Method POST
```
This will chunk the text files in `data/profile/`, generate Gemini embeddings, and push them to Pinecone, making your RAG chatbot fully functional!

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
