/**
 * POST /api/rewrite
 * Body: { url, profile, content, violations }
 *
 * Calls OpenAI gpt-4o-mini in JSON mode and returns the full RewriteOutput.
 * We do NOT stream incrementally because we need the structured JSON to be
 * valid before the renderer can read it. (Streaming partial JSON across
 * structural blocks isn't worth the complexity for the hackathon.)
 *
 * Node runtime (uses the openai SDK).
 */

import { NextRequest, NextResponse } from "next/server";
import { getOpenAI, MODELS } from "@/lib/openai";
import {
  buildRewritePrompt,
  type RewriteInput,
  type RewriteOutput,
} from "@/lib/prompts/rewrite";
import { getProfile, type ProfileId } from "@/lib/a11y/profiles";

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

interface RewriteRequestBody {
  url: string;
  profileId: ProfileId;
  content: RewriteInput["content"];
  violations: RewriteInput["violations"];
}

export async function POST(req: NextRequest) {
  let body: RewriteRequestBody;
  try {
    body = (await req.json()) as RewriteRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body?.url || !body?.content || !body?.profileId) {
    return NextResponse.json(
      { error: "Missing url, profileId or content" },
      { status: 400 }
    );
  }

  const profile = getProfile(body.profileId);
  const { system, user } = buildRewritePrompt({
    url: body.url,
    profile,
    content: body.content,
    violations: body.violations ?? [],
  });

  try {
    const client = getOpenAI();
    const completion = await client.chat.completions.create({
      model: MODELS.rewrite,
      response_format: { type: "json_object" },
      temperature: 0.85,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    });

    const text = completion.choices[0]?.message?.content ?? "{}";
    let parsed: RewriteOutput;
    try {
      parsed = JSON.parse(text) as RewriteOutput;
    } catch {
      return NextResponse.json(
        { error: "Model returned invalid JSON", raw: text.slice(0, 800) },
        { status: 502 }
      );
    }

    // Minimal shape sanity check + defaults
    parsed.blocks = Array.isArray(parsed.blocks) ? parsed.blocks : [];
    parsed.altTextSuggestions = Array.isArray(parsed.altTextSuggestions)
      ? parsed.altTextSuggestions
      : [];
    parsed.pronunciationNotes = Array.isArray(parsed.pronunciationNotes)
      ? parsed.pronunciationNotes
      : [];
    parsed.funnyVoiceoverScript = String(parsed.funnyVoiceoverScript ?? "");
    parsed.title = String(parsed.title ?? body.content.title ?? "");
    parsed.summary = String(parsed.summary ?? "");
    parsed.estimatedReadingMinutes = Number(parsed.estimatedReadingMinutes ?? 1);
    parsed.languageLevel = String(parsed.languageLevel ?? profile.languageLevel);

    return NextResponse.json(parsed);
  } catch (err: any) {
    console.error("rewrite error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Rewrite failed" },
      { status: 500 }
    );
  }
}
