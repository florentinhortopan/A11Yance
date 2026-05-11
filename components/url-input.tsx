"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, useRef, useEffect } from "react";
import { ArrowRight, Link2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isValidHttpUrl, normalizeUrl } from "@/lib/utils";

const EXAMPLES = [
  { label: "BBC News", url: "https://www.bbc.com/news" },
  { label: "Wikipedia", url: "https://en.wikipedia.org/wiki/Web_accessibility" },
  { label: "Hacker News", url: "https://news.ycombinator.com" },
  { label: "Demo: bad page", url: "/demo/bad" },
];

export function UrlInput() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Don't steal focus on touch devices — it pops a soft keyboard before
    // the user has even seen the page. On pointer devices, focus the input
    // with preventScroll so the editorial hero stays visible.
    if (typeof window === "undefined") return;
    const isCoarse = window.matchMedia?.("(pointer: coarse)").matches;
    if (isCoarse) return;
    inputRef.current?.focus({ preventScroll: true });
  }, []);

  // "/" anywhere on the page focuses the input (like GitHub / Linear).
  // Skipped when the user is already typing into a field.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      const tag = t?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || t?.isContentEditable) return;
      e.preventDefault();
      inputRef.current?.focus({ preventScroll: true });
      inputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function handleSubmit(raw: string) {
    const v = raw.trim();
    if (!v) {
      toast.error("Type a URL first.");
      return;
    }
    if (v.startsWith("/")) {
      const base =
        typeof window !== "undefined"
          ? window.location.origin
          : "http://localhost:3000";
      const absolute = new URL(v, base).toString();
      startTransition(() =>
        router.push(`/result?url=${encodeURIComponent(absolute)}`)
      );
      return;
    }
    const normalized = normalizeUrl(v);
    if (!isValidHttpUrl(normalized)) {
      toast.error("That doesn't look like a URL.");
      return;
    }
    startTransition(() =>
      router.push(`/result?url=${encodeURIComponent(normalized)}`)
    );
  }

  return (
    <div className="w-full">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(value);
        }}
        className="relative flex items-end gap-3 pb-4 border-b-2 border-[var(--color-ink)]"
      >
        <Link2
          aria-hidden
          className="size-5 mb-2 text-[var(--color-mute)]"
        />
        <Input
          ref={inputRef}
          name="url"
          inputMode="url"
          autoComplete="url"
          spellCheck={false}
          autoCorrect="off"
          placeholder="paste a url, any url"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="text-2xl md:text-3xl font-serif italic border-b-0 placeholder:italic placeholder:text-[var(--color-mute)]"
          aria-label="URL to analyze"
          disabled={isPending}
        />
        <Button
          type="submit"
          variant="ink"
          size="xl"
          shape="sharp"
          disabled={isPending}
          aria-label="Translate this page"
        >
          {isPending ? "Reading…" : "Translate"}
          {!isPending && <ArrowRight />}
        </Button>
      </form>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <span className="text-xs uppercase tracking-[0.18em] font-mono text-[var(--color-mute)] mr-1">
          try
        </span>
        {EXAMPLES.map((ex) => (
          <button
            key={ex.url}
            type="button"
            onClick={() => {
              setValue(ex.url);
              handleSubmit(ex.url);
            }}
            disabled={isPending}
            className="text-sm px-3 py-1.5 border border-[var(--color-rule)] hover:bg-[var(--color-paper-2)] hover:border-[var(--color-ink)] transition-colors rounded-[3px] font-mono"
          >
            {ex.label}
          </button>
        ))}
        <span className="ml-auto hidden md:inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-[0.14em] text-[var(--color-mute)]">
          press
          <kbd className="px-1.5 py-0.5 border border-[var(--color-rule)] bg-[var(--color-paper-2)] text-[var(--color-ink)] rounded-[3px] text-[11px] leading-none">
            /
          </kbd>
          to focus
        </span>
      </div>
    </div>
  );
}
