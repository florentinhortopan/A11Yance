/**
 * Run axe-core against a fetched HTML string using JSDOM.
 *
 * Approach:
 *   1) Build a JSDOM with `runScripts: "outside-only"` so we control all script execution.
 *   2) Evaluate axe-core's bundled `source` string INSIDE the JSDOM window via
 *      `dom.window.eval(...)`. axe-core attaches itself to `window.axe` and from
 *      that point on uses the JSDOM `window` / `document` it lives in.
 *   3) Call `window.axe.run(window.document, ...)` from Node. The `run` closure
 *      keeps a reference to its own window, so we don't need to leak globals.
 *
 * Node-runtime only — JSDOM is heavy and not edge-compatible.
 */

import type { AxeViolation } from "./score";

export interface AxeRunResult {
  violations: AxeViolation[];
  incomplete: AxeViolation[];
}

export async function runAxeOnHtml(
  html: string,
  baseUrl: string
): Promise<AxeRunResult> {
  const { JSDOM, VirtualConsole } = await import("jsdom");
  const axeMod: any = await import("axe-core");
  const axeSource: string | undefined =
    axeMod.source ?? axeMod.default?.source;

  if (!axeSource) {
    throw new Error("axe-core source not available");
  }

  const virtualConsole = new VirtualConsole();
  virtualConsole.on("error", () => {});
  virtualConsole.on("warn", () => {});
  virtualConsole.on("info", () => {});
  virtualConsole.on("log", () => {});

  const dom = new JSDOM(html, {
    url: baseUrl,
    runScripts: "outside-only",
    pretendToBeVisual: true,
    virtualConsole,
  });

  try {
    // Evaluate axe-core source inside the JSDOM realm so it binds to that window.
    dom.window.eval(axeSource);

    const winAxe: any = (dom.window as any).axe;
    if (!winAxe || typeof winAxe.run !== "function") {
      throw new Error("axe-core failed to attach to window");
    }

    const result = await winAxe.run(dom.window.document, {
      resultTypes: ["violations", "incomplete"],
      runOnly: {
        type: "tag",
        values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"],
      },
    });

    const mapNode = (n: any) => ({
      html: String(n.html ?? "").slice(0, 400),
      target: (n.target ?? []).map((t: any) => String(t)),
      failureSummary: n.failureSummary ? String(n.failureSummary) : undefined,
    });

    const mapViolation = (v: any): AxeViolation => ({
      id: String(v.id),
      impact: (v.impact ?? null) as AxeViolation["impact"],
      help: String(v.help ?? ""),
      helpUrl: String(v.helpUrl ?? ""),
      description: String(v.description ?? ""),
      tags: (v.tags ?? []).map(String),
      nodes: (v.nodes ?? []).slice(0, 5).map(mapNode),
    });

    return {
      violations: (result.violations ?? []).map(mapViolation),
      incomplete: (result.incomplete ?? []).map(mapViolation),
    };
  } finally {
    dom.window.close();
  }
}
