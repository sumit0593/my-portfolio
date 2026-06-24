export type Project = {
  id: string;
  title: string;
  category: "GenAI" | "Frontend" | "Backend" | "Full Stack" | "Multi-Agent Systems" | "Enterprise";
  categories: ("GenAI" | "Frontend" | "Backend" | "Full Stack" | "Enterprise")[];
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
    id: "ai-loan-advisor",
    title: "AI Loan Advisor Chatbot",
    category: "GenAI",
    categories: ["GenAI", "Frontend", "Backend", "Full Stack"],
    description: "A full-stack intelligent lending evaluation application. It uses a multi-agent orchestration graph (built with LangGraph and the Gemini API) to assess borrower profiles, determine loan product eligibility, perform EMI/tenure repayment simulations, and verify lending compliance.",
    techStack: ["React 19", "Vite 8", "LangGraph", "Gemini API", "FastAPI", "SQLite", "SQLAlchemy", "Tailwind CSS 4", "Recharts 3"],
    liveUrl: "https://ai-loan-advisor-chatbot-3mt0oequ0-sumit0593s-projects.vercel.app/",
    githubUrl: "https://github.com/sumit0593/AI-Loan-Advisor-Chatbot",
    image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=800&auto=format&fit=crop",
    featured: true,
    architecture: ["Multi-Agent Graph", "FastAPI ASGI", "SQLite Database"],
    aiFeatures: ["LangGraph Orchestration", "Gemini AI Engine"]
  },
  {
    id: "hireflow-ai",
    title: "HireFlow AI",
    category: "GenAI",
    categories: ["GenAI", "Backend"],
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
    category: "GenAI",
    categories: ["GenAI", "Backend"],
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
    categories: ["Enterprise"],
    description: "Built an AI-based invoice parser to automate data extraction. Created React/Node.js validation layers, serverless functions using AWS Lambda and DynamoDB, and dynamic Zoho Analytics dashboards with JWT/OAuth2 role-based access.",
    techStack: ["React", "Node.js", "Zoho Analytics", "AWS Textract", "Lambda", "DynamoDB"],
    liveUrl: "https://risengine.com/sign-in",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop",
    featured: true,
    architecture: ["JWT/OAuth2 RBAC", "Enterprise Data Pipelines"],
    aiFeatures: ["OCR Data Extraction", "Document Parsing AI", "Mistral LLM Integration", "AWS AI Services"]
  },
  {
    id: "portfolio-ai",
    title: "Portfolio AI",
    category: "Frontend",
    categories: ["Frontend", "Full Stack", "GenAI"],
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
    category: "Enterprise",
    categories: ["Enterprise"],
    description: "Maintained a highly scalable full-stack attendance platform managing thousands of concurrent employees. Built browser automation using Playwright, an HTML scraper, and a text extractor to automate client data. Designed Spring Boot microservices, Angular frontend modules, and robust REST APIs.",
    techStack: ["Spring Boot", "Angular", "REST APIs", "SQL", "Microservices", "Playwright", "HTML Scraper", "Text Extractor"],
    liveUrl: "https://www.kentcam.com/camattendance/thank-you",
    image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=800&auto=format&fit=crop",
    featured: false,
    architecture: ["Spring Boot", "Automated Data Pipelines", "High-Concurrency APIs", "Playwright Automation"],
    aiFeatures: ["Face Recognition AI", "Computer Vision Integration", "HTML Web Scraping", "Text Extraction"]
  }
];
