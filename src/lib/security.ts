/**
 * Security utility functions for input/output sanitization.
 */

/**
 * Escape HTML special characters to prevent XSS in email templates.
 */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

/**
 * Sanitize user input for AI prompts to mitigate prompt injection.
 * Removes common injection patterns while preserving normal queries.
 */
export function sanitizePromptInput(input: string): string {
  let cleaned = input;

  // Remove common prompt injection patterns
  const injectionPatterns = [
    /ignore\s+(all\s+)?(previous|above|prior|earlier|system)\s+(instructions|prompts|rules|context)/gi,
    /you\s+are\s+now\s+(a|an)\s+/gi,
    /forget\s+(all|everything|your)\s+(previous|instructions|rules)/gi,
    /new\s+instructions?\s*:/gi,
    /system\s*:\s*/gi,
    /\[system\]/gi,
    /\[INST\]/gi,
    /<<SYS>>/gi,
    /<\/?s>/gi,
  ];

  for (const pattern of injectionPatterns) {
    cleaned = cleaned.replace(pattern, "[filtered]");
  }

  // Hard limit on input length
  return cleaned.slice(0, 2000);
}

/**
 * Sanitize AI output to prevent PII leakage.
 * Redacts patterns that look like sensitive data if they shouldn't be in the output.
 */
export function sanitizeAIOutput(output: string): string {
  // Redact potential API keys (long alphanumeric strings that look like keys)
  let cleaned = output.replace(
    /(?:api[_-]?key|secret|password|token)\s*[:=]\s*['"]?[A-Za-z0-9_\-]{20,}['"]?/gi,
    "[REDACTED]"
  );

  // Redact SMTP passwords (app passwords pattern)
  cleaned = cleaned.replace(/[a-z]{4}\s[a-z]{4}\s[a-z]{4}\s[a-z]{4}/g, "[REDACTED]");

  return cleaned;
}
