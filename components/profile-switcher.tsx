"use client";

import { useEffect } from "react";
import {
  PROFILES,
  COLOR_BLIND_MODES,
  type ProfileId,
  type ColorBlindMode,
} from "@/lib/a11y/profiles";
import { cn } from "@/lib/utils";

interface Props {
  profileId: ProfileId;
  onProfileChange: (id: ProfileId) => void;
  colorBlind: ColorBlindMode;
  onColorBlindChange: (m: ColorBlindMode) => void;
}

export function ProfileSwitcher({
  profileId,
  onProfileChange,
  colorBlind,
  onColorBlindChange,
}: Props) {
  // Apply the profile to <html data-profile=...> so global CSS tokens kick in.
  useEffect(() => {
    document.documentElement.dataset.profile = profileId;
    return () => {
      document.documentElement.dataset.profile = "default";
    };
  }, [profileId]);

  return (
    <section
      aria-labelledby="profile-heading"
      className="border border-[var(--color-rule)] p-5 md:p-6 bg-[var(--color-paper-2)]/30"
    >
      <h2
        id="profile-heading"
        className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--color-mute)] mb-3"
      >
        Reading profile
      </h2>

      <fieldset>
        <legend className="sr-only">Choose a disability profile</legend>
        <div className="flex flex-wrap gap-2">
          {PROFILES.map((p) => {
            const selected = p.id === profileId;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onProfileChange(p.id)}
                aria-pressed={selected}
                title={p.description}
                className={cn(
                  "px-3 py-1.5 text-sm border rounded-[3px] transition-all font-mono",
                  selected
                    ? "bg-[var(--color-ink)] text-[var(--color-paper)] border-[var(--color-ink)]"
                    : "bg-transparent text-[var(--color-ink)] border-[var(--color-rule)] hover:border-[var(--color-ink)]"
                )}
              >
                {p.shortName}
              </button>
            );
          })}
        </div>
      </fieldset>

      <p className="mt-3 text-[13px] text-[var(--color-mute)] leading-relaxed">
        {PROFILES.find((p) => p.id === profileId)?.description}
      </p>

      <div className="mt-5">
        <label
          htmlFor="cb-mode"
          className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--color-mute)] block mb-2"
        >
          Color-vision simulation
        </label>
        <select
          id="cb-mode"
          value={colorBlind}
          onChange={(e) =>
            onColorBlindChange(e.target.value as ColorBlindMode)
          }
          className="w-full bg-[var(--color-paper)] border border-[var(--color-rule)] hover:border-[var(--color-ink)] focus:border-[var(--color-ink)] outline-none px-3 py-2 text-sm font-mono rounded-[3px]"
        >
          {COLOR_BLIND_MODES.map((m) => (
            <option key={m.id} value={m.id}>
              {m.label}
            </option>
          ))}
        </select>
        <p className="mt-2 text-[12px] text-[var(--color-mute)]">
          Applies an SVG filter to the re-published content so designers can see
          how their palette reads.
        </p>
      </div>
    </section>
  );
}
