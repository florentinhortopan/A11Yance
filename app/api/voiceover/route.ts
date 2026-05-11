/**
 * POST /api/voiceover
 * Body: { text: string, voice?: string }
 *
 * Proxies OpenAI TTS and streams the resulting MP3 back to the browser.
 * Uses the Node SDK (Edge would require manual fetch — keeping consistent).
 */

import { NextRequest, NextResponse } from "next/server";
import { getOpenAI, MODELS } from "@/lib/openai";

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

const VOICES = new Set([
  "alloy",
  "ash",
  "ballad",
  "coral",
  "echo",
  "fable",
  "nova",
  "onyx",
  "sage",
  "shimmer",
]);

export async function POST(req: NextRequest) {
  let body: { text?: string; voice?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const text = (body.text ?? "").trim();
  if (!text) {
    return NextResponse.json({ error: "Missing text" }, { status: 400 });
  }

  const voice =
    body.voice && VOICES.has(body.voice) ? body.voice : "fable";

  try {
    const client = getOpenAI();
    const response = await client.audio.speech.create({
      model: MODELS.tts,
      voice: voice as any,
      input: text.slice(0, 4096),
      response_format: "mp3",
      speed: 1.0,
    });

    return new Response(response.body, {
      headers: {
        "content-type": "audio/mpeg",
        "cache-control": "private, max-age=600",
      },
    });
  } catch (err: any) {
    console.error("voiceover error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Voiceover failed" },
      { status: 500 }
    );
  }
}
