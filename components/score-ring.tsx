/**
 * A Pitchfork-style typographic score, not a circular progress ring.
 * Big numeric mark + grade letter + impact breakdown.
 */

import type { ScoreResult } from "@/lib/a11y/score";
import { gradeColor } from "@/lib/a11y/score";
import { cn } from "@/lib/utils";

interface Props {
  score: ScoreResult;
  url: string;
}

const IMPACT_LABELS = [
  { key: "critical", label: "Critical" },
  { key: "serious", label: "Serious" },
  { key: "moderate", label: "Moderate" },
  { key: "minor", label: "Minor" },
] as const;

export function ScoreRing({ score, url }: Props) {
  const host = safeHost(url);

  return (
    <section
      aria-labelledby="score-heading"
      className="border border-[var(--color-rule)] bg-[var(--color-paper-2)]/40 p-6 md:p-8"
    >
      <div className="flex items-baseline justify-between gap-4 mb-2">
        <h2
          id="score-heading"
          className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--color-mute)]"
        >
          A11y score
        </h2>
        <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--color-mute)] truncate max-w-[60%]">
          {host}
        </span>
      </div>

      <div className="flex items-end gap-6">
        <div
          className="font-serif leading-[0.85] tracking-[-0.04em]"
          style={{ color: gradeColor(score.grade) }}
        >
          <span className="text-[clamp(5rem,12vw,9rem)] font-semibold tabular-nums">
            {score.score}
          </span>
          <span className="ml-1 text-[clamp(2rem,5vw,3.5rem)] font-medium align-baseline">
            /100
          </span>
        </div>
        <div className="pb-3">
          <div
            className="text-5xl md:text-6xl font-serif font-semibold"
            style={{ color: gradeColor(score.grade) }}
            aria-label={`Grade ${score.grade}`}
          >
            {score.grade}
          </div>
          <div className="text-xs font-mono uppercase tracking-[0.18em] text-[var(--color-mute)] mt-1">
            grade
          </div>
        </div>
      </div>

      <hr className="rule my-5" />

      <dl className="grid grid-cols-4 gap-3">
        {IMPACT_LABELS.map(({ key, label }) => (
          <div
            key={key}
            className="flex flex-col items-start"
          >
            <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-mute)]">
              {label}
            </dt>
            <dd
              className={cn(
                "text-2xl font-serif tabular-nums mt-0.5",
                score.breakdown[key] > 0
                  ? key === "critical"
                    ? "text-[var(--color-stamp)]"
                    : "text-[var(--color-ink)]"
                  : "text-[var(--color-mute)]"
              )}
            >
              {score.breakdown[key]}
            </dd>
          </div>
        ))}
      </dl>

      <p className="mt-4 text-[12px] font-mono uppercase tracking-[0.18em] text-[var(--color-mute)]">
        {score.totalRules} rules failed · {score.totalNodes} elements affected
      </p>
    </section>
  );
}

function safeHost(u: string) {
  try {
    return new URL(u).hostname.replace(/^www\./, "");
  } catch {
    return u;
  }
}
