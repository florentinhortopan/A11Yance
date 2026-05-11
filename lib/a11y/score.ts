export type Impact = "minor" | "moderate" | "serious" | "critical";

export interface AxeViolation {
  id: string;
  impact: Impact | null;
  help: string;
  helpUrl: string;
  description: string;
  tags: string[];
  nodes: { html: string; target: string[]; failureSummary?: string }[];
}

const WEIGHTS: Record<Impact, number> = {
  critical: 10,
  serious: 5,
  moderate: 2,
  minor: 1,
};

export interface ScoreResult {
  score: number; // 0..100
  grade: "A+" | "A" | "B" | "C" | "D" | "F";
  breakdown: Record<Impact, number>;
  totalNodes: number;
  totalRules: number;
}

export function computeScore(violations: AxeViolation[]): ScoreResult {
  const breakdown: Record<Impact, number> = {
    critical: 0,
    serious: 0,
    moderate: 0,
    minor: 0,
  };

  let penalty = 0;
  let totalNodes = 0;
  for (const v of violations) {
    const impact: Impact = (v.impact ?? "minor") as Impact;
    const count = v.nodes.length;
    breakdown[impact] += count;
    totalNodes += count;
    penalty += WEIGHTS[impact] * count;
  }

  const score = Math.max(0, Math.min(100, 100 - Math.round(penalty * 1.2)));
  const grade: ScoreResult["grade"] =
    score >= 95
      ? "A+"
      : score >= 90
      ? "A"
      : score >= 80
      ? "B"
      : score >= 70
      ? "C"
      : score >= 60
      ? "D"
      : "F";

  return {
    score,
    grade,
    breakdown,
    totalNodes,
    totalRules: violations.length,
  };
}

export function gradeColor(grade: ScoreResult["grade"]): string {
  switch (grade) {
    case "A+":
    case "A":
      return "var(--color-leaf)";
    case "B":
      return "var(--color-ocean)";
    case "C":
      return "var(--color-highlight)";
    case "D":
    case "F":
      return "var(--color-stamp)";
  }
}
