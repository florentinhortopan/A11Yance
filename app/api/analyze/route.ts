/**
 * POST/GET /api/analyze
 * Body: { url: string }  (or ?url= for GET)
 *
 * Fetches the URL server-side (with timeout + realistic UA), runs axe-core in
 * JSDOM, extracts main content with @mozilla/readability, returns the score,
 * the violations, the extracted content, and basic metadata.
 *
 * Node runtime required (JSDOM).
 */

import { NextRequest, NextResponse } from "next/server";
import { runAxeOnHtml } from "@/lib/a11y/axe";
import { extractFromHtml } from "@/lib/a11y/extract";
import { computeScore, type AxeViolation, type ScoreResult } from "@/lib/a11y/score";
import { isValidHttpUrl } from "@/lib/utils";

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 A11yTranslator/0.1";

const MAX_HTML_BYTES = 2_000_000; // 2MB safety cap
const FETCH_TIMEOUT_MS = 10_000;

export interface AnalyzeResponse {
  url: string;
  finalUrl: string;
  fetchedAt: string;
  score: ScoreResult;
  violations: AxeViolation[];
  incomplete: AxeViolation[];
  content: Awaited<ReturnType<typeof extractFromHtml>>;
}

async function fetchPage(target: string): Promise<{ html: string; finalUrl: string }> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(target, {
      headers: {
        "user-agent": USER_AGENT,
        accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "accept-language": "en-US,en;q=0.9",
      },
      redirect: "follow",
      signal: ctrl.signal,
    });

    if (!res.ok) {
      throw new Error(`Upstream responded ${res.status} ${res.statusText}`);
    }

    const ct = res.headers.get("content-type") ?? "";
    if (ct && !/text\/html|application\/xhtml/i.test(ct)) {
      throw new Error(
        `Unsupported content-type: ${ct}. Only HTML pages can be audited.`
      );
    }

    // Stream-cap to MAX_HTML_BYTES so a bad URL can't OOM us.
    const reader = res.body?.getReader();
    if (!reader) throw new Error("No response body");
    const chunks: Uint8Array[] = [];
    let total = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        chunks.push(value);
        total += value.length;
        if (total > MAX_HTML_BYTES) break;
      }
    }
    const buf = new Uint8Array(total);
    let offset = 0;
    for (const c of chunks) {
      buf.set(c.subarray(0, Math.min(c.length, buf.length - offset)), offset);
      offset += c.length;
      if (offset >= buf.length) break;
    }
    const html = new TextDecoder("utf-8", { fatal: false }).decode(buf);
    return { html, finalUrl: res.url || target };
  } finally {
    clearTimeout(timer);
  }
}

async function handle(target: string): Promise<NextResponse> {
  if (!isValidHttpUrl(target)) {
    return NextResponse.json(
      { error: "Invalid URL. Must start with http(s)://" },
      { status: 400 }
    );
  }

  let html: string;
  let finalUrl: string;
  try {
    ({ html, finalUrl } = await fetchPage(target));
  } catch (err: any) {
    const msg =
      err?.name === "AbortError"
        ? "Fetch timed out after 10s."
        : err?.message ?? "Failed to fetch the URL.";
    return NextResponse.json({ error: msg }, { status: 502 });
  }

  let violations: AxeViolation[] = [];
  let incomplete: AxeViolation[] = [];
  try {
    const r = await runAxeOnHtml(html, finalUrl);
    violations = r.violations;
    incomplete = r.incomplete;
  } catch (err: any) {
    console.error("axe-core run failed:", err);
    // Don't fail the whole request — return the extracted content with an empty score.
  }

  let content;
  try {
    content = await extractFromHtml(html, finalUrl);
  } catch (err: any) {
    return NextResponse.json(
      { error: `Could not extract content: ${err?.message ?? err}` },
      { status: 500 }
    );
  }

  const score = computeScore(violations);

  const body: AnalyzeResponse = {
    url: target,
    finalUrl,
    fetchedAt: new Date().toISOString(),
    score,
    violations,
    incomplete,
    content,
  };

  return NextResponse.json(body, {
    headers: {
      "cache-control": "private, max-age=60",
    },
  });
}

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) {
    return NextResponse.json({ error: "Missing ?url" }, { status: 400 });
  }
  return handle(url);
}

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  if (!body?.url) {
    return NextResponse.json(
      { error: "Missing url in body" },
      { status: 400 }
    );
  }
  return handle(String(body.url));
}
