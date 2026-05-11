import * as React from "react";
import { cn } from "@/lib/utils";

type Tone = "ink" | "paper" | "stamp" | "leaf" | "highlight" | "muted";

const tones: Record<Tone, string> = {
  ink: "bg-[var(--color-ink)] text-[var(--color-paper)]",
  paper:
    "bg-[var(--color-paper)] text-[var(--color-ink)] border border-[var(--color-rule)]",
  stamp: "bg-[var(--color-stamp)] text-[var(--color-paper)]",
  leaf: "bg-[var(--color-leaf)] text-[var(--color-paper)]",
  highlight: "bg-[var(--color-highlight)] text-[var(--color-ink)]",
  muted:
    "bg-[var(--color-paper-2)] text-[var(--color-mute)] border border-[var(--color-rule)]",
};

export function Badge({
  tone = "paper",
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-mono uppercase tracking-[0.12em] rounded-[2px]",
        tones[tone],
        className
      )}
      {...props}
    />
  );
}
