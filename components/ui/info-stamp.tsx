"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

interface Props {
  /** The visible stamp label. */
  children: ReactNode;
  /** The hover/focus content. Plain text or markup, kept short. */
  tooltip: ReactNode;
  /** Where the tooltip box anchors relative to the stamp. */
  placement?: "bottom-end" | "bottom-start" | "bottom-center";
  className?: string;
}

/**
 * A stamp-styled trigger that reveals an editorial tooltip on hover, focus,
 * or tap. Implements WAI-ARIA tooltip pattern:
 *  - role="tooltip" on the popover panel
 *  - aria-describedby on the trigger when open
 *  - Escape, blur, and mouseleave all dismiss
 *  - Click toggles for touch devices
 */
export function InfoStamp({
  children,
  tooltip,
  placement = "bottom-end",
  className,
}: Props) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapRef = useRef<HTMLSpanElement>(null);

  function show() {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    setOpen(true);
  }
  function scheduleHide() {
    closeTimer.current = setTimeout(() => setOpen(false), 80);
  }
  function hide() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") hide();
    }
    function onClickOutside(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) hide();
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onClickOutside);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onClickOutside);
    };
  }, [open]);

  useEffect(() => () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }, []);

  const placementClasses = {
    "bottom-end": "right-0",
    "bottom-start": "left-0",
    "bottom-center": "left-1/2 -translate-x-1/2",
  }[placement];

  const caretPlacement = {
    "bottom-end": "right-6",
    "bottom-start": "left-6",
    "bottom-center": "left-1/2 -translate-x-1/2",
  }[placement];

  return (
    <span
      ref={wrapRef}
      className="relative inline-block"
      onMouseEnter={show}
      onMouseLeave={scheduleHide}
    >
      <button
        type="button"
        aria-describedby={open ? id : undefined}
        aria-expanded={open}
        onFocus={show}
        onBlur={scheduleHide}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "stamp cursor-help inline-flex items-center gap-1.5 font-mono uppercase",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-stamp)] focus-visible:outline-offset-2",
          className
        )}
      >
        {children}
        <span aria-hidden className="text-[var(--color-stamp)] opacity-70">
          ?
        </span>
      </button>

      <span
        id={id}
        role="tooltip"
        data-state={open ? "open" : "closed"}
        className={cn(
          "absolute top-[calc(100%+10px)] z-50 w-[min(340px,90vw)]",
          "transition-[opacity,transform] duration-150",
          open
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 -translate-y-1 pointer-events-none",
          placementClasses
        )}
      >
        <span
          aria-hidden
          className={cn(
            "absolute -top-[7px] size-3 rotate-45 bg-[var(--color-paper)] border-t border-l border-[var(--color-ink)]",
            caretPlacement
          )}
        />
        <span
          className="relative block bg-[var(--color-paper)] border border-[var(--color-ink)] text-[var(--color-ink)] p-4 text-[13px] leading-relaxed font-sans normal-case tracking-normal shadow-[4px_4px_0_var(--color-rule)]"
        >
          {tooltip}
        </span>
      </span>
    </span>
  );
}
