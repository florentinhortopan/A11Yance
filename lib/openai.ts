import OpenAI from "openai";

let _client: OpenAI | null = null;

export function getOpenAI(): OpenAI {
  if (_client) return _client;
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY is not set. Add it to .env.local or your Vercel project."
    );
  }
  _client = new OpenAI({ apiKey });
  return _client;
}

export const MODELS = {
  rewrite: "gpt-4o-mini",
  tts: "tts-1",
  ttsHd: "tts-1-hd",
} as const;
