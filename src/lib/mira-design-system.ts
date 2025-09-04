// lib/mira-design-system.ts - Utility functions for Mira Ops Design System

export type MiraAccentFrom = "priority" | "risk";
export type MiraAccentLevel = "low" | "medium" | "high" | "critical";

// Normalize different input formats to MiraAccentLevel
export function normalizeMiraLevel(input: string): MiraAccentLevel {
  const normalized = input.toLowerCase();
  
  if (normalized.startsWith("crit")) return "critical";
  if (normalized.startsWith("high")) return "high";
  if (normalized.startsWith("med")) return "medium";
  return "low";
}

// Get Mira accent color for CSS variable
export function getMiraAccentColor(accentFrom: MiraAccentFrom, level: MiraAccentLevel): string {
  const colorMap = {
    priority: {
      low: "var(--accent-priority-low)",
      medium: "var(--accent-priority-medium)",
      high: "var(--accent-priority-high)",
      critical: "var(--accent-priority-critical)",
    },
    risk: {
      low: "var(--accent-risk-Low)",
      medium: "var(--accent-risk-Medium)",
      high: "var(--accent-risk-High)",
      critical: "var(--accent-risk-Critical)",
    }
  };
  
  return colorMap[accentFrom][level];
}

// Helper to create style object for Mira components
export function createMiraStyle(
  accentFrom: MiraAccentFrom, 
  level: MiraAccentLevel | string,
  additionalStyles?: React.CSSProperties
): React.CSSProperties {
  const normalizedLevel = typeof level === "string" ? normalizeMiraLevel(level) : level;
  const accentColor = getMiraAccentColor(accentFrom, normalizedLevel);
  
  return {
    "--accent": accentColor,
    ...additionalStyles
  } as React.CSSProperties;
}

// Badge class names for consistent styling
export function getMiraBadgeClasses(accentFrom: MiraAccentFrom, level: MiraAccentLevel | string): string {
  const normalizedLevel = typeof level === "string" ? normalizeMiraLevel(level) : level;
  return `mira-badge`;
}

// Progress state detection
export function getMiraProgressState(value: number): "idle" | "active" | "complete" {
  if (value === 0) return "idle";
  if (value === 100) return "complete";
  return "active";
}

// Mapping helpers for existing data structures
export function mapPriorityToMira(priority: string): { accentFrom: MiraAccentFrom; level: MiraAccentLevel } {
  return {
    accentFrom: "priority",
    level: normalizeMiraLevel(priority)
  };
}

export function mapRiskToMira(risk: string): { accentFrom: MiraAccentFrom; level: MiraAccentLevel } {
  return {
    accentFrom: "risk", 
    level: normalizeMiraLevel(risk)
  };
}

// Type guards
export function isMiraAccentFrom(value: string): value is MiraAccentFrom {
  return ["priority", "risk"].includes(value);
}

export function isMiraAccentLevel(value: string): value is MiraAccentLevel {
  return ["low", "medium", "high", "critical"].includes(value.toLowerCase());
}