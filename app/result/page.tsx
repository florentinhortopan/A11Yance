import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { AnalyzeResponse } from "@/app/api/analyze/route";
import { ScoreRing } from "@/components/score-ring";
import { ViolationsList } from "@/components/violations-list";
import { ResultExperience } from "@/components/result-experience";
import { isValidHttpUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface PageProps {
  searchParams: Promise<{ url?: string }>;
}

async function getOrigin(): Promise<string> {
  const { headers } = await import("next/headers");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  return host ? `${proto}://${host}` : "http://localhost:3000";
}

export default async function ResultPage({ searchParams }: PageProps) {
  const { url } = await searchParams;
  if (!url || !isValidHttpUrl(url)) {
    redirect("/");
  }

  const origin = await getOrigin();
  const res = await fetch(
    `${origin}/api/analyze?url=${encodeURIComponent(url!)}`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({ error: "Unknown error" }));
    return (
      <div className="relative z-10 max-w-[1280px] mx-auto px-6 md:px-10 py-16">
        <BackLink />
        <h1 className="mt-10 font-serif text-4xl">We couldn&rsquo;t read that page.</h1>
        <p className="mt-3 text-[var(--color-mute)] max-w-[60ch]">
          {errBody.error ?? "Something went wrong fetching or parsing the URL."}
        </p>
        <p className="mt-6 font-mono text-sm">
          Try a different URL —{" "}
          <Link href="/" className="underline underline-offset-4">
            back to home
          </Link>
          .
        </p>
      </div>
    );
  }

  const data = (await res.json()) as AnalyzeResponse;

  return (
    <div
      id="main"
      className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-10 py-8 md:py-12"
    >
      <BackLink />

      <div className="mt-6 flex items-baseline justify-between flex-wrap gap-3">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--color-mute)]">
          Audit · {new Date(data.fetchedAt).toLocaleString()}
        </p>
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--color-mute)] truncate max-w-[60%]">
          {data.finalUrl}
        </p>
      </div>

      <h1 className="mt-3 font-serif text-[clamp(2rem,5vw,4rem)] leading-[1.02] tracking-[-0.02em] max-w-[20ch]">
        {data.content.title || "Untitled page"}
      </h1>

      <div className="mt-10 grid grid-cols-12 gap-8">
        <aside className="col-span-12 lg:col-span-5 xl:col-span-4 space-y-6 lg:sticky lg:top-6 lg:self-start lg:max-h-[calc(100dvh-3rem)] lg:overflow-y-auto pr-1">
          <ScoreRing score={data.score} url={data.finalUrl} />
          <ViolationsList
            violations={data.violations}
            incomplete={data.incomplete}
          />
        </aside>

        <section className="col-span-12 lg:col-span-7 xl:col-span-8">
          <ResultExperience data={data} />
        </section>
      </div>
    </div>
  );
}

function BackLink() {
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-2 text-sm font-mono uppercase tracking-[0.18em] text-[var(--color-mute)] hover:text-[var(--color-ink)]"
    >
      <ArrowLeft className="size-4" />
      Back to home
    </Link>
  );
}
