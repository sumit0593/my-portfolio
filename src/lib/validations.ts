import { z } from "zod";

// ── Contact Form ──
export const contactSchema = z.object({
  email: z
    .string()
    .email("Invalid email format")
    .max(254, "Email too long"),
  message: z
    .string()
    .min(1, "Message is required")
    .max(5000, "Message too long")
    .trim(),
});

// ── Chat Messages ──
const chatPartSchema = z.object({
  type: z.string(),
  text: z.string().max(4000).optional(),
});

const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string().max(4000).optional(),
  parts: z.array(chatPartSchema).optional(),
});

export const chatRequestSchema = z.object({
  messages: z
    .array(chatMessageSchema)
    .min(1, "At least one message is required")
    .max(50, "Too many messages"),
});

// ── Analyze / AI Tools ──
const validTools = [
  "resume-analyzer",
  "resume-builder",
  "jd-matcher",
  "linkedin-summary",
  "cover-letter",
  "skill-gap",
  "interview-prep",
  "portfolio-content",
  "cold-email",
  "prompt-generator",
] as const;

export const analyzeSchema = z.object({
  jd: z.string().max(10000, "Job description too long").default(""),
  tool: z.enum(validTools).default("resume-analyzer"),
});

// ── Recruiter Summary ──
export const recruiterSummarySchema = z.object({
  role: z.string().max(200, "Role description too long").optional(),
  customJD: z.string().max(10000, "Custom JD too long").optional(),
});

// ── Search ──
export const searchQuerySchema = z.object({
  q: z.string().min(1, "Query is required").max(500, "Query too long"),
  limit: z.coerce.number().int().min(1).max(20).default(5),
});
