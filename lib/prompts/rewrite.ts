import type { Profile } from "@/lib/a11y/profiles";
import type { ExtractedContent } from "@/lib/a11y/extract";
import type { AxeViolation } from "@/lib/a11y/score";

export interface RewriteInput {
  url: string;
  profile: Profile;
  content: ExtractedContent;
  violations: AxeViolation[];
}

export interface RewriteBlock {
  type: "heading" | "paragraph" | "list" | "quote" | "callout" | "figure";
  level?: 1 | 2 | 3;
  text?: string;
  items?: string[];
  alt?: string;
  src?: string;
  caption?: string;
  tone?: "info" | "warn" | "note";
}

export interface RewriteOutput {
  title: string;
  summary: string;
  funnyVoiceoverScript: string;
  estimatedReadingMinutes: number;
  blocks: RewriteBlock[];
  altTextSuggestions: { src: string; alt: string }[];
  pronunciationNotes: string[];
  languageLevel: string;
}

const SYSTEM_PROMPT = `You are an accessibility editor and stand-up comedian writing for screen-reader, low-vision, dyslexic and cognitive-disability readers.

You will receive:
- The URL and title of a page,
- A reader profile (which dictates language level + tone constraints),
- The extracted plain-text content of the page,
- A list of accessibility violations found on the original page (you may briefly poke fun at them in the voiceover, but never demean disabled readers).

Your job:
1. Produce a clean, semantic, accessible re-publishing of the content as structured BLOCKS.
2. Produce a short, GENUINELY funny voiceover summary (max ~150 words) that captures the gist of the page with warmth and dry wit. Avoid sarcasm aimed at disabled readers. Acceptable comedic targets: corporate jargon, the original page's accessibility failings, vague marketing copy, the writer themselves. Read it out loud test: it should land in a friendly British/NPR narrator voice.
3. Generate alt-text suggestions for any images that had missing/poor alt text.
4. Generate pronunciation hints for acronyms or unusual words (e.g., {"word":"WCAG","spelling":"wuh-kag"}).

Style rules:
- Match the reader profile's language level (A2 = very plain, B1 = plain, B2 = clear, C1 = standard).
- If the profile says simplify=true: short sentences (<=15 words), no idioms, define jargon inline.
- Use semantic blocks. Headings carry hierarchy (h1 once, then h2/h3). No bare divs.
- Lists for enumerations. Callouts for important warnings.
- Never invent facts not present in the source text. If unsure, omit.
- Voiceover should be one continuous spoken paragraph (no stage directions).
- Output strictly valid JSON matching the schema. No prose outside JSON.`;

export function buildRewritePrompt(input: RewriteInput) {
  const { url, profile, content, violations } = input;

  const violationDigest = violations
    .slice(0, 12)
    .map((v) => `- [${v.impact ?? "minor"}] ${v.id}: ${v.help}`)
    .join("\n");

  const userPrompt = `URL: ${url}
Original title: ${content.title || "(none)"}
Detected language: ${content.lang ?? "unknown"}
Reader profile: ${profile.name} (id=${profile.id})
Target language level: ${profile.languageLevel}
Simplify aggressively: ${profile.simplify}
Hide decorative content: ${profile.hideDecorative}

ACCESSIBILITY ISSUES on the original page:
${violationDigest || "(none detected — feel free to compliment them in the voiceover)"}

EXTRACTED CONTENT:
"""
${content.textContent}
"""

Respond with this JSON schema, and nothing else:
{
  "title": string,
  "summary": string,
  "funnyVoiceoverScript": string,
  "estimatedReadingMinutes": number,
  "blocks": Array<{
    "type": "heading" | "paragraph" | "list" | "quote" | "callout" | "figure",
    "level"?: 1 | 2 | 3,
    "text"?: string,
    "items"?: string[],
    "alt"?: string,
    "src"?: string,
    "caption"?: string,
    "tone"?: "info" | "warn" | "note"
  }>,
  "altTextSuggestions": Array<{ "src": string, "alt": string }>,
  "pronunciationNotes": string[],
  "languageLevel": string
}`;

  return {
    system: SYSTEM_PROMPT,
    user: userPrompt,
  };
}
