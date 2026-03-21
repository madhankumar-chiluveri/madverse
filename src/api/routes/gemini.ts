// ─────────────────────────────────────────────────────────────
// src/api/routes/gemini.ts
//
// Pure fetch helpers that wrap Gemini REST API.
// These are used inside Convex Actions (server-side) AND
// optionally from client hooks when Convex actions aren't
// available offline.
// ─────────────────────────────────────────────────────────────
import { API_CONFIG } from "@/api/config/constants";
import type { MaddyCommand } from "@/types/maddy";

// ── Helper ──────────────────────────────────────────────────
async function geminiFetch<T>(
  path: string,
  apiKey: string,
  body: object
): Promise<T> {
  const url = `${API_CONFIG.GEMINI_BASE_URL}/${path}?key=${apiKey}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`Gemini ${path} failed: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

function extractText(data: GeminiGenerateResponse): string {
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}

// ── Types ────────────────────────────────────────────────────
interface GeminiGenerateResponse {
  candidates?: Array<{
    content: { parts: Array<{ text: string }> };
  }>;
}
interface GeminiEmbedResponse {
  embedding?: { values: number[] };
}

const GENERATE_CONFIG = (maxTokens = 500, temp = 0.4) => ({
  generationConfig: { temperature: temp, maxOutputTokens: maxTokens },
});

// ── Public API ───────────────────────────────────────────────

/** Generate tags for a page from its title + content preview */
export async function generateTags(
  title: string,
  contentPreview: string,
  apiKey: string
): Promise<string[]> {
  const prompt = `You are Maddy, an AI knowledge organiser. Generate 3-7 relevant tags for this note.
Return ONLY a JSON array of tag strings, no explanation.

Title: ${title}
Content: ${contentPreview.slice(0, 1000)}

Return format: ["tag1", "tag2", "tag3"]`;

  const data = await geminiFetch<GeminiGenerateResponse>(
    `${API_CONFIG.GEMINI_TEXT_MODEL}:generateContent`,
    apiKey,
    { contents: [{ parts: [{ text: prompt }] }], ...GENERATE_CONFIG(200, 0.3) }
  );

  const text = extractText(data);
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) return [];
  try {
    const tags: string[] = JSON.parse(match[0]);
    return tags.slice(0, API_CONFIG.MAX_TAG_COUNT);
  } catch {
    return [];
  }
}

/** Summarise a page in 3-5 bullet points */
export async function summarisePage(
  title: string,
  contentPreview: string,
  apiKey: string
): Promise<string> {
  const prompt = `Summarise the following content in 3-5 concise bullet points starting with •.

Title: ${title}
Content: ${contentPreview.slice(0, 2000)}`;

  const data = await geminiFetch<GeminiGenerateResponse>(
    `${API_CONFIG.GEMINI_TEXT_MODEL}:generateContent`,
    apiKey,
    { contents: [{ parts: [{ text: prompt }] }], ...GENERATE_CONFIG(400, 0.4) }
  );
  return extractText(data);
}

/** Extract action items / tasks from page content */
export async function extractTasks(
  title: string,
  contentPreview: string,
  apiKey: string
): Promise<string[]> {
  const prompt = `Extract all actionable tasks from the following content.
Return ONLY a JSON array of task strings.

Title: ${title}
Content: ${contentPreview.slice(0, 2000)}

Return format: ["task 1", "task 2"]`;

  const data = await geminiFetch<GeminiGenerateResponse>(
    `${API_CONFIG.GEMINI_TEXT_MODEL}:generateContent`,
    apiKey,
    { contents: [{ parts: [{ text: prompt }] }], ...GENERATE_CONFIG(500, 0.3) }
  );

  const text = extractText(data);
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) return [];
  try {
    return JSON.parse(match[0]);
  } catch {
    return [];
  }
}

/** Run an inline Maddy command on a text selection */
export async function runInlineCommand(
  command: MaddyCommand,
  text: string,
  apiKey: string,
  opts?: { targetLanguage?: string }
): Promise<string> {
  const PROMPTS: Record<MaddyCommand, string> = {
    explain: `Explain the following text in simple, clear language:\n\n${text}`,
    rewrite: `Rewrite the following text to be clearer and more concise:\n\n${text}`,
    continue: `Continue writing from this text naturally (1-3 sentences):\n\n${text}`,
    brainstorm: `Generate 10 creative ideas related to:\n\n${text}\n\nReturn as a numbered list.`,
    translate: `Translate to ${opts?.targetLanguage ?? "Spanish"}:\n\n${text}`,
    summarise: `Summarise in 3-5 bullet points starting with •:\n\n${text}`,
    tasks: `Extract all actionable tasks. Return a JSON array.\n\n${text}`,
  };

  const data = await geminiFetch<GeminiGenerateResponse>(
    `${API_CONFIG.GEMINI_TEXT_MODEL}:generateContent`,
    apiKey,
    { contents: [{ parts: [{ text: PROMPTS[command] }] }], ...GENERATE_CONFIG(1000, 0.7) }
  );
  return extractText(data);
}

/** Generate a 768-dim embedding vector for a text string */
export async function generateEmbedding(
  text: string,
  apiKey: string
): Promise<number[]> {
  const clipped = text.slice(0, API_CONFIG.MAX_EMBEDDING_CHARS);
  const data = await geminiFetch<GeminiEmbedResponse>(
    `${API_CONFIG.GEMINI_EMBEDDING_MODEL}:embedContent`,
    apiKey,
    {
      model: `models/${API_CONFIG.GEMINI_EMBEDDING_MODEL.split("/").pop()}`,
      content: { parts: [{ text: clipped }] },
    }
  );
  return data.embedding?.values ?? [];
}

/** Suggest workspace reorganisation */
export async function suggestOrganisation(
  pages: Array<{ id: string; title: string; tags: string[] }>,
  apiKey: string
): Promise<unknown[]> {
  const list = pages
    .slice(0, 50)
    .map((p) => `- "${p.title}" (id:${p.id}, tags:${p.tags.join(", ") || "none"})`)
    .join("\n");

  const prompt = `You are Maddy, an AI knowledge organiser. Suggest how to reorganise these pages.

Pages:
${list}

Return a JSON array:
[{"type":"move","pageId":"<id>","pageTitle":"<title>","description":"<what>","reason":"<why>"}]

Return [] if structure looks fine. Return ONLY a valid JSON array.`;

  const data = await geminiFetch<GeminiGenerateResponse>(
    `${API_CONFIG.GEMINI_TEXT_MODEL}:generateContent`,
    apiKey,
    { contents: [{ parts: [{ text: prompt }] }], ...GENERATE_CONFIG(1500, 0.3) }
  );

  const text = extractText(data);
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) return [];
  try {
    const result = JSON.parse(match[0]);
    return Array.isArray(result) ? result : [];
  } catch {
    return [];
  }
}
