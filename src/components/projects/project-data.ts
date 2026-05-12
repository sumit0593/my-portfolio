export type Project = {
  id: string;
  title: string;
  category: "GenAI" | "Frontend" | "Backend" | "Full Stack" | "Multi-Agent Systems" | "Enterprise";
  description: string;
  techStack: string[];
  githubUrl?: string;
  liveUrl?: string;
  image: string;
  featured?: boolean;
  architecture?: string[];
  aiFeatures?: string[];
};

export const PROJECTS_DATA: Project[] = [
  {
    id: "hireflow-ai",
    title: "HireFlow AI",
    category: "GenAI",
    description: "A production-grade AI Resume Search platform utilizing Hybrid Search (BM25 + Pinecone) and Reciprocal Rank Fusion (RRF). Features a scalable FastAPI backend microservice, LangChain orchestration, and Gemini LLMs for AI-powered candidate evaluation.",
    techStack: ["FastAPI", "BM25", "RAGAS", "HuggingFace", "Pinecone", "Gemini", "LangChain", "Streamlit"],
    liveUrl: "https://hireflow---ai-resume-search-gw6ot8m2ph3huktrjcaz35.streamlit.app/",
    githubUrl: "https://github.com/sumit0593/HireFlow---AI-Resume-Search",
    image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=800&auto=format&fit=crop",
    featured: true,
    architecture: ["FastAPI Microservices", "Hybrid Search Pipeline", "RRF Ranking System"],
    aiFeatures: ["RAG Architecture", "Gemini AI Evaluation", "Multi-Query Expansion"]
  },
  {
    id: "scam-guard-ai",
    title: "Scam Guard AI",
    category: "Backend",
    description: "A modular, real-time AI security platform designed to detect digital scams. Built with advanced NLP Transformers utilizing a configurable prompt engineering architecture and robust Python-based decision engine.",
    techStack: ["Prompt Engineering", "NLP Pipelines", "LLM Orchestration", "Streamlit", "Gemini"],
    liveUrl: "https://scam-detector-ai.streamlit.app/",
    githubUrl: "https://github.com/sumit0593/scam_guard_ai",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=800&auto=format&fit=crop",
    featured: true,
    architecture: ["Configurable Workflows", "Real-time Decision Engine"],
    aiFeatures: ["Config-driven Prompt Engineering", "Modular LLM Orchestration Pipeline"]
  },
  {
    id: "kent-risengine",
    title: "Kent Risengine",
    category: "Enterprise",
    description: "Built an AI-based invoice parser to automate data extraction. Created React/Node.js validation layers, NGINX load balancing, and dynamic Zoho Analytics dashboards with JWT/OAuth2 role-based access.",
    techStack: ["React", "Node.js", "Zoho Analytics", "Mistral LLM", "AWS Textract", "NGINX"],
    liveUrl: "https://risengine.com/sign-in",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop",
    featured: true,
    architecture: ["High-availability NGINX", "JWT/OAuth2 RBAC", "Enterprise Data Pipelines"],
    aiFeatures: ["OCR Data Extraction", "Mistral LLM Integration"]
  },
  {
    id: "portfolio-ai",
    title: "Portfolio AI",
    category: "Frontend",
    description: "A modern, AI-powered portfolio website featuring a RAG-based chatbot powered by Gemini and Pinecone. Includes premium Framer Motion animations, ultra-responsive design, and a sleek 3D-infused tech stack orbit.",
    techStack: ["Next.js", "Tailwind CSS", "Three.js", "Framer Motion", "Gemini", "Pinecone"],
    liveUrl: "https://my-portfolio-six-gold-86.vercel.app/",
    githubUrl: "https://github.com/sumit0593/my-portfolio",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop",
    featured: true,
    architecture: ["Next.js App Router", "Serverless Chatbot Backend"],
    aiFeatures: ["Context-Aware RAG Bot", "Vector Embeddings"]
  },
  {
    id: "cam-attendance",
    title: "Cam Attendance",
    category: "Full Stack",
    description: "Maintained a highly scalable full-stack attendance platform managing thousands of concurrent employees. Designed Spring Boot microservices, Angular frontend modules, and robust REST APIs.",
    techStack: ["Spring Boot", "Angular", "REST APIs", "SQL", "Microservices"],
    liveUrl: "https://www.kentcam.com/camattendance/thank-you",
    image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=800&auto=format&fit=crop",
    featured: false,
    architecture: ["Spring Boot Microservices", "Automated Data Pipelines", "High-Concurrency APIs"]
  },
  {
    id: "tios-revamp",
    title: "TIOS Revamp",
    category: "Full Stack",
    description: "Spearheaded the legacy-to-modern migration of an enterprise HRMS platform to Next.js. Developed scalable MERN-stack UI components and established robust CI/CD testing pipelines using Cypress and Playwright.",
    techStack: ["Next.js", "TypeScript", "Tailwind CSS", "Cypress", "Playwright"],
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800&auto=format&fit=crop",
    featured: false,
    architecture: ["Modular React Architecture", "CI/CD Deployment Pipelines"]
  }
];
