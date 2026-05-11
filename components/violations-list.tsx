"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ExternalLink } from "lucide-react";
import type { AxeViolation, Impact } from "@/lib/a11y/score";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const ORDER: Impact[] = ["critical", "serious", "moderate", "minor"];
const TONE: Record<Impact, Parameters<typeof Badge>[0]["tone"]> = {
  critical: "stamp",
  serious: "ink",
  moderate: "highlight",
  minor: "muted",
};

interface Props {
  violations: AxeViolation[];
  incomplete?: AxeViolation[];
}

export function ViolationsList({ violations, incomplete = [] }: Props) {
  const grouped = useMemo(() => {
    const g: Record<Impact, AxeViolation[]> = {
      critical: [],
      serious: [],
      moderate: [],
      minor: [],
    };
    for (const v of violations) {
      const k = (v.impact ?? "minor") as Impact;
      g[k].push(v);
    }
    return g;
  }, [violations]);

  if (!violations.length && !incomplete.length) {
    return (
      <section className="border border-[var(--color-rule)] p-6">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--color-mute)] mb-2">
          Violations
        </h2>
        <p className="font-serif text-xl">
          None detected by the static auditor.
        </p>
        <p className="text-sm text-[var(--color-mute)] mt-2">
          (Dynamic / focus / live-region issues may still exist — a static
          audit can&rsquo;t see them.)
        </p>
      </section>
    );
  }

  return (
    <section className="border border-[var(--color-rule)]">
      {violations.length > 0 && (
        <>
          <h2 className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--color-mute)] px-6 pt-6 pb-3">
            Violations · grouped by impact
          </h2>
          <ul className="divide-y divide-[var(--color-rule)]">
            {ORDER.flatMap((impact) =>
              grouped[impact].map((v) => (
                <ViolationItem key={v.id + impact} v={v} impact={impact} />
              ))
            )}
          </ul>
        </>
      )}
      {incomplete.length > 0 && (
        <div className="border-t border-[var(--color-rule)]">
          <h3 className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--color-mute)] px-6 pt-6 pb-2">
            Needs human review · static audit can&rsquo;t verify
          </h3>
          <ul className="divide-y divide-[var(--color-rule)]">
            {incomplete.map((v) => (
              <ViolationItem
                key={"i-" + v.id}
                v={v}
                impact={(v.impact ?? "minor") as Impact}
                muted
              />
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function ViolationItem({
  v,
  impact,
  muted,
}: {
  v: AxeViolation;
  impact: Impact;
  muted?: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <li>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full px-6 py-4 flex items-start gap-4 text-left hover:bg-[var(--color-paper-2)] transition-colors"
      >
        <Badge tone={muted ? "muted" : TONE[impact]}>
          {muted ? "review" : impact}
        </Badge>
        <div className="flex-1 min-w-0">
          <div className="font-serif text-lg leading-snug">{v.help}</div>
          <div className="font-mono text-[11px] text-[var(--color-mute)] uppercase tracking-[0.14em] mt-1">
            {v.id} · {v.nodes.length} {v.nodes.length === 1 ? "element" : "elements"}
          </div>
        </div>
        <ChevronDown
          className={cn(
            "size-5 mt-1 text-[var(--color-mute)] transition-transform",
            open && "rotate-180"
          )}
          aria-hidden
        />
      </button>
      {open && (
        <div className="px-6 pb-6 pt-1 space-y-3 bg-[var(--color-paper-2)]/40">
          <p className="text-sm leading-relaxed text-[var(--color-ink-2)]">
            {v.description}
          </p>
          <a
            href={v.helpUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-sm underline underline-offset-4 hover:text-[var(--color-stamp)]"
          >
            Read more on the rule
            <ExternalLink className="size-3.5" aria-hidden />
          </a>
          <ul className="mt-2 space-y-2">
            {v.nodes.map((n, i) => (
              <li
                key={i}
                className="border border-[var(--color-rule)] bg-[var(--color-paper)] p-3"
              >
                <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-mute)] mb-1">
                  {n.target.join(" › ")}
                </div>
                <pre className="font-mono text-[11px] whitespace-pre-wrap break-all text-[var(--color-ink-2)]">
                  {n.html}
                </pre>
                {n.failureSummary && (
                  <p className="mt-2 text-[12px] text-[var(--color-ink-2)] italic">
                    {n.failureSummary}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </li>
  );
}
