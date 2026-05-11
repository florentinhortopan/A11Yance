"use client";

import { useId } from "react";
import { AlertTriangle, Info, StickyNote } from "lucide-react";
import type { RewriteBlock, RewriteOutput } from "@/lib/prompts/rewrite";
import type { ColorBlindMode, Profile } from "@/lib/a11y/profiles";
import { cn } from "@/lib/utils";

interface Props {
  rewrite: RewriteOutput;
  profile: Profile;
  colorBlind: ColorBlindMode;
}

export function AccessibleRenderer({ rewrite, profile, colorBlind }: Props) {
  const titleId = useId();

  return (
    <article
      aria-labelledby={titleId}
      lang="en"
      className={cn(
        "renderer relative border border-[var(--color-rule)] bg-[var(--r-bg)] text-[var(--r-fg)] p-6 md:p-10 transition-colors",
        colorBlind !== "none" && `cb-filter--${colorBlind}`
      )}
    >
      {/* Profile masthead */}
      <header className="flex items-baseline justify-between flex-wrap gap-3 mb-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--r-mute)]">
          Re-published for · {profile.shortName} · {rewrite.languageLevel}
        </p>
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--r-mute)]">
          ~{Math.max(1, Math.round(rewrite.estimatedReadingMinutes))} min read
        </p>
      </header>

      <h1
        id={titleId}
        className="!mt-0"
        style={{ fontFamily: "var(--r-font-heading)" }}
      >
        {rewrite.title}
      </h1>

      {rewrite.summary && (
        <p className="!max-w-none text-[1.05em] leading-relaxed text-[var(--r-mute)] italic border-l-2 border-[var(--r-accent)] pl-4 -ml-4 mt-0">
          {rewrite.summary}
        </p>
      )}

      <hr className="my-6 border-[var(--r-rule)]" />

      {profile.readingRuler && <ReadingRuler />}

      <div className="space-y-1">
        {rewrite.blocks.map((block, i) => (
          <Block key={i} block={block} />
        ))}
      </div>

      {rewrite.altTextSuggestions.length > 0 && !profile.hideDecorative && (
        <section
          aria-labelledby="alt-suggest"
          className="mt-10 pt-6 border-t border-[var(--r-rule)]"
        >
          <h2 id="alt-suggest" className="!mt-0">
            Alt-text suggestions for the original page
          </h2>
          <ul>
            {rewrite.altTextSuggestions.map((s, i) => (
              <li key={i}>
                <span className="font-mono text-[12px] text-[var(--r-mute)] break-all">
                  {s.src}
                </span>
                <span className="block">&ldquo;{s.alt}&rdquo;</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {rewrite.pronunciationNotes.length > 0 && (
        <section
          aria-labelledby="pron-notes"
          className="mt-8 pt-6 border-t border-[var(--r-rule)]"
        >
          <h2 id="pron-notes" className="!mt-0">
            Pronunciation notes
          </h2>
          <ul>
            {rewrite.pronunciationNotes.map((n, i) => (
              <li key={i}>{n}</li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}

function Block({ block }: { block: RewriteBlock }) {
  switch (block.type) {
    case "heading": {
      const level = Math.min(3, Math.max(1, block.level ?? 2));
      const Tag = (`h${level}` as unknown) as "h1" | "h2" | "h3";
      return <Tag>{block.text}</Tag>;
    }
    case "paragraph":
      return <p>{block.text}</p>;
    case "list":
      return (
        <ul>
          {(block.items ?? []).map((it, i) => (
            <li key={i}>{it}</li>
          ))}
        </ul>
      );
    case "quote":
      return (
        <blockquote>
          <p>{block.text}</p>
        </blockquote>
      );
    case "callout": {
      const tone = block.tone ?? "info";
      const Icon =
        tone === "warn" ? AlertTriangle : tone === "note" ? StickyNote : Info;
      return (
        <aside
          role="note"
          className={cn(
            "my-4 p-4 border-l-4 flex gap-3",
            tone === "warn"
              ? "bg-[color-mix(in_oklab,var(--color-stamp)_10%,transparent)] border-[var(--color-stamp)]"
              : tone === "note"
              ? "bg-[color-mix(in_oklab,var(--color-highlight)_20%,transparent)] border-[var(--color-highlight)]"
              : "bg-[color-mix(in_oklab,var(--color-ocean)_10%,transparent)] border-[var(--color-ocean)]"
          )}
        >
          <Icon className="size-5 mt-1 shrink-0" aria-hidden />
          <p className="!m-0">{block.text}</p>
        </aside>
      );
    }
    case "figure":
      return (
        <figure>
          {block.src && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={block.src}
              alt={block.alt ?? ""}
              loading="lazy"
              decoding="async"
              className="max-w-full h-auto border border-[var(--r-rule)]"
            />
          )}
          {block.caption && <figcaption>{block.caption}</figcaption>}
        </figure>
      );
    default:
      return null;
  }
}

function ReadingRuler() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed left-0 right-0 h-10 z-50 mix-blend-multiply"
      style={{
        top: "var(--ruler-y, 50%)",
        background:
          "linear-gradient(180deg, transparent, color-mix(in oklab, var(--color-highlight) 35%, transparent), transparent)",
      }}
      data-reading-ruler
    />
  );
}
