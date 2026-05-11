"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Pause, Play, Rewind, FastForward, Loader2, Mic2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Props {
  text: string;
  voice?: string;
}

/**
 * Voiceover player. Fetches an MP3 from /api/voiceover on demand and plays it
 * with a custom transport. Includes a "read along" word highlighter that
 * approximates word position from currentTime (we don't get word boundaries
 * from OpenAI TTS, so this is a linear estimate — fine for a hackathon).
 */
export function VoiceoverPlayer({ text, voice }: Props) {
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">(
    "idle"
  );
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [rate, setRate] = useState(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const urlRef = useRef<string | null>(null);

  const words = useMemo(() => text.split(/\s+/).filter(Boolean), [text]);
  const activeWord = useMemo(() => {
    if (!duration || words.length === 0) return -1;
    const ratio = currentTime / duration;
    return Math.min(words.length - 1, Math.floor(ratio * words.length));
  }, [currentTime, duration, words.length]);

  useEffect(() => {
    return () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    };
  }, []);

  async function load() {
    if (status === "loading" || !text.trim()) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/voiceover", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text, voice }),
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e?.error ?? `TTS failed (${res.status})`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      urlRef.current = url;
      const a = audioRef.current!;
      a.src = url;
      a.playbackRate = rate;
      await a.play();
      setStatus("ready");
      setPlaying(true);
    } catch (err: any) {
      setStatus("error");
      toast.error(err?.message ?? "Couldn't generate voiceover.");
    }
  }

  function toggle() {
    const a = audioRef.current;
    if (!a) return;
    if (status !== "ready") {
      void load();
      return;
    }
    if (a.paused) {
      void a.play();
      setPlaying(true);
    } else {
      a.pause();
      setPlaying(false);
    }
  }

  function skip(seconds: number) {
    const a = audioRef.current;
    if (!a) return;
    a.currentTime = Math.max(0, Math.min(a.duration || 0, a.currentTime + seconds));
  }

  function changeRate(r: number) {
    setRate(r);
    if (audioRef.current) audioRef.current.playbackRate = r;
  }

  const progress = duration ? (currentTime / duration) * 100 : 0;

  return (
    <section
      aria-labelledby="vo-heading"
      className="border border-[var(--color-rule)] p-5 md:p-6 bg-[var(--color-paper-2)]/30"
    >
      <div className="flex items-center justify-between mb-3">
        <h2
          id="vo-heading"
          className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--color-mute)] inline-flex items-center gap-2"
        >
          <Mic2 className="size-3.5" aria-hidden />
          Voiceover
        </h2>
        <span className="font-mono text-[11px] text-[var(--color-mute)]">
          {format(currentTime)} / {format(duration)}
        </span>
      </div>

      {/* Transcript with active word highlight */}
      <p
        className="text-[15px] leading-relaxed mb-4 max-h-40 overflow-y-auto"
        aria-live="polite"
      >
        {words.map((w, i) => (
          <span
            key={i}
            aria-current={i === activeWord ? "true" : undefined}
            className={cn(
              "transition-colors",
              i === activeWord
                ? "bg-[var(--color-highlight)] text-[var(--color-ink)] px-0.5 rounded-[2px]"
                : ""
            )}
          >
            {w}{" "}
          </span>
        ))}
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => skip(-10)}
          aria-label="Rewind 10 seconds"
          className="p-2 hover:bg-[var(--color-paper-2)] rounded-[3px]"
        >
          <Rewind className="size-5" />
        </button>
        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? "Pause voiceover" : "Play voiceover"}
          className="size-11 inline-flex items-center justify-center bg-[var(--color-ink)] text-[var(--color-paper)] rounded-full hover:brightness-110"
        >
          {status === "loading" ? (
            <Loader2 className="size-5 animate-spin" aria-hidden />
          ) : playing ? (
            <Pause className="size-5" aria-hidden />
          ) : (
            <Play className="size-5 translate-x-[1px]" aria-hidden />
          )}
        </button>
        <button
          type="button"
          onClick={() => skip(10)}
          aria-label="Fast-forward 10 seconds"
          className="p-2 hover:bg-[var(--color-paper-2)] rounded-[3px]"
        >
          <FastForward className="size-5" />
        </button>

        <div className="flex-1 mx-2 h-2 bg-[var(--color-paper-2)] border border-[var(--color-rule)] relative">
          <div
            className="absolute inset-y-0 left-0 bg-[var(--color-ink)]"
            style={{ width: `${progress}%` }}
            aria-hidden
          />
        </div>

        <div
          role="group"
          aria-label="Playback speed"
          className="flex items-center text-[11px] font-mono"
        >
          {[0.75, 1, 1.25, 1.5].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => changeRate(r)}
              aria-pressed={rate === r}
              className={cn(
                "px-2 py-1 rounded-[3px]",
                rate === r
                  ? "bg-[var(--color-ink)] text-[var(--color-paper)]"
                  : "text-[var(--color-mute)] hover:text-[var(--color-ink)]"
              )}
            >
              {r}x
            </button>
          ))}
        </div>
      </div>

      <audio
        ref={audioRef}
        preload="none"
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 0)}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime || 0)}
        onEnded={() => setPlaying(false)}
        onPause={() => setPlaying(false)}
        onPlay={() => setPlaying(true)}
      />
    </section>
  );
}

function format(t: number) {
  if (!isFinite(t) || t <= 0) return "0:00";
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
