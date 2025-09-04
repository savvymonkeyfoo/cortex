// lib/status-theme.ts
export type Severity = "low" | "medium" | "high" | "critical";

// Tailwind-compatible class fragments + raw hex for inline accents.
export const severityTokens: Record<Severity, {
  hex: string;           // for CSS var/inline uses (borders, outlines)
  badge: string;         // border/text classes for outline badges
  subtle: string;        // subtle bg classes (if needed)
}> = {
  low:      { hex: "#22c55e", badge: "border-green-500 text-green-700",  subtle: "bg-green-50" },
  medium:   { hex: "#eab308", badge: "border-yellow-500 text-yellow-700",subtle: "bg-yellow-50" },
  high:     { hex: "#f97316", badge: "border-orange-500 text-orange-700",subtle: "bg-orange-50" },
  critical: { hex: "#ef4444", badge: "border-red-500 text-red-700",      subtle: "bg-red-50" },
};

// Convenience: normalize different sources to our Severity.
export function toSeverity(input: string): Severity {
  const v = input.toLowerCase();
  if (v.startsWith("crit")) return "critical";
  if (v.startsWith("high")) return "high";
  if (v.startsWith("med"))  return "medium";
  return "low";
}