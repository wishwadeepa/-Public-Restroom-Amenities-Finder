import DOMPurify from "isomorphic-dompurify";

/**
 * Sanitizes user-provided string to prevent Cross-Site Scripting (XSS).
 * Strips HTML tags and unsafe script attributes.
 */
export function sanitizeText(input: string | null | undefined): string | null {
  if (!input) return null;
  const cleaned = DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  }).trim();
  return cleaned || null;
}
