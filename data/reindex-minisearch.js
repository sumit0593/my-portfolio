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
        pdfUrlText = `Full Certificate: ${cert.pdf_urls["Full Certificate"] || ""} | Prompt Certificate: ${cert.pdf_urls["Prompt Engineering"]} | RAG Certificate: ${cert.pdf_urls["RAG Engineering"]}`;
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
    const phoneNum = meta.personal_info.phone || "";
    const emailAddr = meta.personal_info.email || "";
    docs.push({
      id: `meta-contact-0`,
      text: `Contact Information for Sumit Kumar:
- Phone / Mobile Number: ${phoneNum} (reachable via WhatsApp, call, or messaging)
- Email Address: ${emailAddr} (primary email)
- GitHub Profile: ${contact.github}
- LinkedIn Profile: ${contact.linkedin}
- LeetCode Profile: ${contact.leetcode || ""}
- Portfolio Website: ${contact.portfolio}
- Resume PDF Download: ${contact.resume_pdf || ""}
- Resume DOCX Download: ${contact.resume_docx || ""}`,
      title: "Contact Info & Links",
      source: "metadata.json",
      type: "contact",
      section: "personal_info",
      recruiter_keywords: ["contact", "phone", "mobile", "number", "email", "mail", "gmail", "github", "linkedin", "leetcode", "resume", "connect", "reach"],
      semantic_tags: ["contact", "personal_info", "socials", "links"]
    });
  }

  // Experience
  if (meta.experience) {
    meta.experience.forEach((exp, i) => {
      docs.push({
        id: `meta-experience-${i}`,
        text: `Experience: ${exp.role} at ${exp.company} (Duration: ${exp.duration}, Location: ${exp.location}).
Highlights:
${exp.highlights.map(h => `- ${h}`).join("\n")}
Tech Stack: ${exp.tags ? exp.tags.join(", ") : ""}`,
        title: `${exp.role} at ${exp.company}`,
        source: "metadata.json",
        type: "experience",
        section: "experience",
        recruiter_keywords: [exp.company, exp.role, "work", "job", "career", "employment", ...(exp.tags || [])],
        semantic_tags: ["experience", "employment", "career", "jobs"]
      });
    });
  }

  // Skills
  if (meta.skills) {
    docs.push({
      id: "meta-skills-0",
      text: `Technical Skills and Tech Stack of Sumit Kumar:
${Object.entries(meta.skills).map(([category, list]) => `- ${category.replace(/_/g, ' ')}: ${list.join(", ")}`).join("\n")}`,
      title: "Technical Skills & Competencies",
      source: "metadata.json",
      type: "skills",
      section: "skills",
      recruiter_keywords: ["skills", "technologies", "languages", "frameworks", "databases", "libraries", "tools", ...Object.values(meta.skills).flat()],
      semantic_tags: ["skills", "technologies", "expertise"]
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
