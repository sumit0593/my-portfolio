const fs = require('fs');
const path = require('path');
const MiniSearch = require('minisearch');

const INDEX_PATH = path.join(__dirname, 'processed', 'minisearch-index.json');
const PROFILE_DIR = path.join(__dirname, 'profile');
const METADATA_PATH = path.join(__dirname, 'metadata', 'metadata.json');

// Build Search Documents
const docs = [];

// 1. Process profile text files
if (fs.existsSync(PROFILE_DIR)) {
  const files = fs.readdirSync(PROFILE_DIR).filter(f => f.endsWith(".txt"));
  for (const file of files) {
    const sectionName = file.replace(".txt", "");
    const content = fs.readFileSync(path.join(PROFILE_DIR, file), "utf-8");
    docs.push({
      id: `profile-${sectionName}-0`,
      text: content,
      title: `Profile: ${sectionName}`,
      source: `data/profile/${file}`,
      type: "profile",
      section: sectionName
    });
  }
}

// 2. Process metadata json
if (fs.existsSync(METADATA_PATH)) {
  const raw = fs.readFileSync(METADATA_PATH, "utf-8");
  const meta = JSON.parse(raw);

  // Projects
  if (meta.projects) {
    meta.projects.forEach((proj, i) => {
      docs.push({
        id: `meta-project-${i}`,
        text: `Project: ${proj.title}. ${proj.description}. Tech: ${proj.tech_stack ? proj.tech_stack.join(", ") : ""}. Live: ${proj.live_url || ""}. GitHub: ${proj.github || ""}.`,
        title: proj.title,
        source: "metadata.json",
        type: "project",
        section: "projects",
        recruiter_keywords: proj.recruiter_keywords || [],
        semantic_tags: proj.semantic_tags || []
      });
    });
  }

  // Certifications
  if (meta.certifications) {
    meta.certifications.forEach((cert, i) => {
      let pdfUrlText = "";
      if (cert.pdf_url) pdfUrlText = `Link: ${cert.pdf_url}`;
      if (cert.pdf_urls) {
        pdfUrlText = `Prompt Certificate: ${cert.pdf_urls["Prompt Engineering"]} | RAG Certificate: ${cert.pdf_urls["RAG Engineering"]}`;
      }
      docs.push({
        id: `meta-cert-${i}`,
        text: `Certification: ${cert.title}. Institution: ${cert.institution}. Duration: ${cert.duration}. ${pdfUrlText}`,
        title: cert.title,
        source: "metadata.json",
        type: "certification",
        section: "certifications"
      });
    });
  }

  // Contact details
  if (meta.personal_info && meta.personal_info.contact) {
    const contact = meta.personal_info.contact;
    docs.push({
      id: `meta-contact-0`,
      text: `Contact Links: GitHub: ${contact.github}. LinkedIn: ${contact.linkedin}. LeetCode: ${contact.leetcode || ""}. Portfolio: ${contact.portfolio}. Resume PDF: ${contact.resume_pdf || ""}. Resume DOCX: ${contact.resume_docx || ""}. Email: ${meta.personal_info.email || ""}. Phone: ${meta.personal_info.phone || ""}.`,
      title: "Contact Info & Links",
      source: "metadata.json",
      type: "contact",
      section: "personal_info"
    });
  }
}

// 3. Initialize MiniSearch and index documents
const miniSearch = new MiniSearch({
  fields: ['title', 'text', 'section', 'recruiter_keywords', 'semantic_tags'],
  storeFields: ['title', 'text', 'source', 'type', 'section', 'recruiter_keywords', 'semantic_tags']
});

miniSearch.addAll(docs);

// 4. Save to json
const json = JSON.stringify(miniSearch);
fs.writeFileSync(INDEX_PATH, json, 'utf-8');
console.log(`[Offline Indexer] MiniSearch Index built successfully with ${docs.length} docs and saved to: ${INDEX_PATH}`);
