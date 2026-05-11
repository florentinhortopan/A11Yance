/**
 * Disability profiles. The renderer reads `id` and sets `data-profile` on <html>.
 * Visual tokens themselves live in `app/globals.css` under the matching selector.
 * Optional `colorBlind` triggers an SVG filter overlay on the rendered output.
 */

export type ProfileId =
  | "default"
  | "lowVision"
  | "dyslexia"
  | "cognitive"
  | "motor"
  | "screenReader";

export type ColorBlindMode = "none" | "deutan" | "protan" | "tritan";

export interface Profile {
  id: ProfileId;
  name: string;
  shortName: string;
  description: string;
  /** Suggested language level for the rewriter (CEFR). */
  languageLevel: "A2" | "B1" | "B2" | "C1";
  /** Whether to simplify sentence structure aggressively. */
  simplify: boolean;
  /** Whether the renderer should hide decorative images. */
  hideDecorative: boolean;
  /** Whether the renderer should expose an inline read-ruler. */
  readingRuler: boolean;
  /** Whether motion should be disabled. */
  reduceMotion: boolean;
  /** Whether to inject skip-links + landmarks heavily. */
  emphasizeSemantics: boolean;
}

export const PROFILES: Profile[] = [
  {
    id: "default",
    name: "Editorial baseline",
    shortName: "Default",
    description:
      "A clean, accessible reading experience suitable for most readers.",
    languageLevel: "C1",
    simplify: false,
    hideDecorative: false,
    readingRuler: false,
    reduceMotion: false,
    emphasizeSemantics: true,
  },
  {
    id: "lowVision",
    name: "Low vision",
    shortName: "Low vision",
    description:
      "Larger type, higher contrast, thicker focus rings, narrower measure.",
    languageLevel: "B2",
    simplify: false,
    hideDecorative: false,
    readingRuler: false,
    reduceMotion: false,
    emphasizeSemantics: true,
  },
  {
    id: "dyslexia",
    name: "Dyslexia-friendly",
    shortName: "Dyslexia",
    description:
      "OpenDyslexic / Atkinson font, generous spacing, off-white background, shorter lines.",
    languageLevel: "B1",
    simplify: true,
    hideDecorative: false,
    readingRuler: true,
    reduceMotion: false,
    emphasizeSemantics: true,
  },
  {
    id: "cognitive",
    name: "Cognitive / plain language",
    shortName: "Plain",
    description:
      "Short sentences, plain wording, no motion, ruled layout, no jargon.",
    languageLevel: "A2",
    simplify: true,
    hideDecorative: true,
    readingRuler: true,
    reduceMotion: true,
    emphasizeSemantics: true,
  },
  {
    id: "motor",
    name: "Motor-friendly",
    shortName: "Motor",
    description:
      "Large hit areas, sticky controls, no hover-only affordances.",
    languageLevel: "B2",
    simplify: false,
    hideDecorative: false,
    readingRuler: false,
    reduceMotion: false,
    emphasizeSemantics: true,
  },
  {
    id: "screenReader",
    name: "Screen-reader optimized",
    shortName: "Screen reader",
    description:
      "Semantic-first reading order, landmarks, skip-links, decorative content hidden from AT.",
    languageLevel: "B2",
    simplify: false,
    hideDecorative: true,
    readingRuler: false,
    reduceMotion: false,
    emphasizeSemantics: true,
  },
];

export function getProfile(id: ProfileId): Profile {
  return PROFILES.find((p) => p.id === id) ?? PROFILES[0];
}

export const COLOR_BLIND_MODES: { id: ColorBlindMode; label: string }[] = [
  { id: "none", label: "No simulation" },
  { id: "deutan", label: "Deuteranopia (red–green)" },
  { id: "protan", label: "Protanopia (red–green)" },
  { id: "tritan", label: "Tritanopia (blue–yellow)" },
];
