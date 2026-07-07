import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Gemini client wrapper.
 *
 * SECURITY NOTE: calling Gemini directly from the browser exposes your API key
 * to anyone who opens devtools. This is acceptable for a personal/local build,
 * but before shipping to real users move this call behind a small serverless
 * function (Vercel Edge Function / Supabase Edge Function) that holds the key
 * server-side and forwards only the prompt. The function signature below is
 * written so swapping the transport later (fetch("/api/gemini") instead of the
 * SDK) requires no changes to callers — see generateContent().
 */

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

const MODEL_NAME = "gemini-3.5-flash"; // fast + cheap, good for personal-scale usage

const model = genAI
  ? genAI.getGenerativeModel({
      model: MODEL_NAME,
      generationConfig: {
        temperature: 0.6,
        maxOutputTokens: 1024,
      },
    })
  : null;

/**
 * Send a prompt to Gemini and get back plain text.
 * @param {string} prompt
 * @returns {Promise<string>}
 */
export async function generateContent(prompt) {
  if (!model) {
    throw new Error(
      "Gemini belum dikonfigurasi. Isi VITE_GEMINI_API_KEY di file .env."
    );
  }
  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (err) {
    console.error("[Gemini API Error]", err);
    throw new Error("Gagal terhubung ke AI. Pastikan VITE_GEMINI_API_KEY di file .env Anda valid (tidak kadaluarsa).");
  }
}

/**
 * Send a prompt and parse the response as JSON. Assumes the prompt instructs
 * Gemini to return ONLY raw JSON (no markdown fences, no preamble).
 * @template T
 * @param {string} prompt
 * @returns {Promise<T>}
 */
export async function generateJSON(prompt) {
  const raw = await generateContent(prompt);
  const cleaned = raw.replace(/```json|```/g, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch (err) {
    console.error("[Gemini] Failed to parse JSON response:", raw);
    throw new Error("AI gagal memproses data. Pastikan VITE_GEMINI_API_KEY di file .env sudah valid dan aktif.");
  }
}

/**
 * Multi-turn chat session for the AI Mentor feature.
 * @param {{role: 'user'|'model', parts: [{text: string}]}[]} history
 */
export function startMentorChat(history = []) {
  if (!model) {
    throw new Error(
      "Gemini belum dikonfigurasi. Isi VITE_GEMINI_API_KEY di file .env."
    );
  }
  return model.startChat({ history });
}
