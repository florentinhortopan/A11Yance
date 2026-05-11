"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Sparkles, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import type { AnalyzeResponse } from "@/app/api/analyze/route";
import type { RewriteOutput } from "@/lib/prompts/rewrite";
import {
  getProfile,
  type ColorBlindMode,
  type ProfileId,
} from "@/lib/a11y/profiles";
import { ProfileSwitcher } from "@/components/profile-switcher";
import { AccessibleRenderer } from "@/components/accessible-renderer";
import { VoiceoverPlayer } from "@/components/voiceover-player";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props {
  data: AnalyzeResponse;
}

const REWRITE_CACHE_TTL = 1000 * 60 * 60; // 1 hour, client-side only

export function ResultExperience({ data }: Props) {
  const [profileId, setProfileId] = useState<ProfileId>("default");
  const [colorBlind, setColorBlind] = useState<ColorBlindMode>("none");
  const [rewrite, setRewrite] = useState<RewriteOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cacheRef = useRef(new Map<ProfileId, { at: number; r: RewriteOutput }>());
  const inflightRef = useRef<AbortController | null>(null);

  const profile = useMemo(() => getProfile(profileId), [profileId]);

  async function runRewrite(id: ProfileId) {
    const cached = cacheRef.current.get(id);
    if (cached && Date.now() - cached.at < REWRITE_CACHE_TTL) {
      setRewrite(cached.r);
      return;
    }

    inflightRef.current?.abort();
    const ctrl = new AbortController();
    inflightRef.current = ctrl;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/rewrite", {
        method: "POST",
        signal: ctrl.signal,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          url: data.finalUrl,
          profileId: id,
          content: data.content,
          violations: data.violations,
        }),
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e?.error ?? `Rewrite failed (${res.status})`);
      }
      const out = (await res.json()) as RewriteOutput;
      cacheRef.current.set(id, { at: Date.now(), r: out });
      setRewrite(out);
    } catch (err: any) {
      if (err?.name === "AbortError") return;
      setError(err?.message ?? "Rewrite failed");
      toast.error(err?.message ?? "Rewrite failed");
    } finally {
      if (inflightRef.current === ctrl) inflightRef.current = null;
      setLoading(false);
    }
  }

  // Kick off the first rewrite when the user clicks the CTA, OR auto-run on
  // profile change once we already have one rewrite (so switching profiles
  // is fluid).
  useEffect(() => {
    if (rewrite || loading) {
      if (rewrite) runRewrite(profileId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileId]);

  return (
    <div className="space-y-6">
      <ProfileSwitcher
        profileId={profileId}
        onProfileChange={setProfileId}
        colorBlind={colorBlind}
        onColorBlindChange={setColorBlind}
      />

      {!rewrite && !loading && !error && (
        <Intro onStart={() => runRewrite(profileId)} content={data.content} />
      )}

      {loading && <RewriteLoading />}

      {error && !loading && (
        <div className="border border-[var(--color-stamp)] bg-[color-mix(in_oklab,var(--color-stamp)_8%,transparent)] p-5">
          <p className="font-serif text-lg text-[var(--color-stamp)]">
            {error}
          </p>
          <Button
            variant="ink"
            size="md"
            className="mt-3"
            onClick={() => runRewrite(profileId)}
          >
            <RefreshCw /> Try again
          </Button>
        </div>
      )}

      {rewrite && (
        <>
          <VoiceoverPlayer
            text={rewrite.funnyVoiceoverScript}
            voice={profile.id === "screenReader" ? "alloy" : "fable"}
          />
          <AccessibleRenderer
            rewrite={rewrite}
            profile={profile}
            colorBlind={colorBlind}
          />
        </>
      )}
    </div>
  );
}

function Intro({
  onStart,
  content,
}: {
  onStart: () => void;
  content: AnalyzeResponse["content"];
}) {
  return (
    <section className="border border-[var(--color-rule)] p-6 md:p-8">
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--color-mute)] mb-2">
        Up next
      </p>
      <h2 className="font-serif text-3xl md:text-4xl leading-[1.05] tracking-[-0.01em] mb-3">
        Re-publish this page for the human you choose.
      </h2>
      <p className="text-[var(--color-ink-2)] max-w-[65ch] leading-relaxed">
        We&rsquo;ll write a short, friendly voiceover summary, generate a
        semantic, profile-aware re-rendering, and suggest alt text for the
        images. Pick a profile above (or stay on the default), then start.
      </p>
      <dl className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
        <Meta label="Words" value={String(estimateWords(content.textContent))} />
        <Meta
          label="Headings"
          value={String(content.headings.length)}
        />
        <Meta label="Images" value={String(content.images.length)} />
        <Meta label="Lang" value={content.lang ?? "—"} />
      </dl>
      <Button
        variant="stamp"
        size="xl"
        shape="sharp"
        className="mt-6"
        onClick={onStart}
      >
        <Sparkles /> Translate this page
      </Button>
    </section>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-mute)]">
        {label}
      </dt>
      <dd className="font-serif text-2xl tabular-nums">{value}</dd>
    </div>
  );
}

function RewriteLoading() {
  return (
    <section
      className="border border-[var(--color-rule)] p-6 md:p-8"
      aria-busy="true"
      aria-live="polite"
    >
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--color-mute)]">
        Editing
      </p>
      <p className="font-serif text-2xl md:text-3xl leading-snug mt-2">
        Trimming jargon, restoring headings, writing the voiceover
        <span className="caret" />
      </p>
      <div className="mt-6 space-y-3">
        <SkeletonLine className="w-[88%]" />
        <SkeletonLine className="w-[72%]" />
        <SkeletonLine className="w-[80%]" />
        <SkeletonLine className="w-[60%]" />
      </div>
    </section>
  );
}

function SkeletonLine({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "h-3 rounded-[2px] bg-gradient-to-r from-[var(--color-paper-2)] via-[var(--color-rule)] to-[var(--color-paper-2)] bg-[length:200%_100%] animate-[shimmer_1.6s_linear_infinite]",
        className
      )}
    />
  );
}

function estimateWords(s: string): number {
  if (!s) return 0;
  return s.split(/\s+/).filter(Boolean).length;
}
