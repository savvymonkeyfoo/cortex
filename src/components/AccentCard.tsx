// components/AccentCard.tsx
import * as React from "react";
import { Card } from "./ui/card";
import { cn } from "./ui/utils";
import { severityTokens, toSeverity, type Severity } from "../lib/status-theme";
import { riskColor, priorityColor, taskStatusColor,
         type Risk, type Priority, type TaskStatus } from "../utils/statusColors";

type Tone = "risk" | "priority" | "task" | "severity" | "mira";
type Key = Risk | Priority | TaskStatus | Severity;

// Mira design system color mapping
const miraAccentColors = {
  priority: {
    low: "var(--accent-priority-low)",
    medium: "var(--accent-priority-medium)",
    high: "var(--accent-priority-high)",
    critical: "var(--accent-priority-critical)",
  },
  risk: {
    Low: "var(--accent-risk-Low)",
    Medium: "var(--accent-risk-Medium)", 
    High: "var(--accent-risk-High)",
    Critical: "var(--accent-risk-Critical)",
  }
};

function resolveColor(tone: Tone, key: Key): string {
  // Mira design system colors
  if (tone === "mira") {
    // Auto-detect if it's a priority or risk key
    if (["low", "medium", "high", "critical"].includes(String(key).toLowerCase())) {
      return miraAccentColors.priority[String(key).toLowerCase() as keyof typeof miraAccentColors.priority] ?? "var(--border)";
    }
    if (["Low", "Medium", "High", "Critical"].includes(String(key))) {
      return miraAccentColors.risk[String(key) as keyof typeof miraAccentColors.risk] ?? "var(--border)";
    }
  }
  
  // New severity-based approach
  if (tone === "severity") return severityTokens[key as Severity]?.hex ?? "var(--border)";
  
  // Legacy support for backward compatibility
  if (tone === "risk")     return riskColor[key as Risk]        ?? "var(--border)";
  if (tone === "priority") return priorityColor[key as Priority]?? "var(--border)";
  return taskStatusColor[key as TaskStatus] ?? "var(--border)";
}

export const AccentCard = React.forwardRef<
  React.ElementRef<typeof Card>,
  {
    tone: Tone;
    statusKey: Key;
    active?: boolean;
    dim?: boolean;
    useMiraSystem?: boolean; // New prop to opt into Mira design system
  } & React.ComponentProps<typeof Card>
>(({ tone, statusKey, active, dim, useMiraSystem = false, className, style, children, ...props }, ref) => {
  const color = resolveColor(tone, statusKey);
  
  // Use Mira system if explicitly requested or if tone is "mira"
  const shouldUseMira = useMiraSystem || tone === "mira";
  
  if (shouldUseMira) {
    return (
      <Card
        ref={ref}
        className={cn("mira-accent-card", className)}
        style={{ ...(style || {}), ["--accent" as any]: color }}
        data-state={active ? "active" : dim ? "disabled" : "default"}
        {...props}
      >
        {children}
      </Card>
    );
  }
  
  // Legacy status-accent-card system
  return (
    <Card
      ref={ref}
      data-active={active ? "true" : undefined}
      data-dim={dim ? "true" : undefined}
      className={cn("status-accent-card", className)}
      style={{ ...(style || {}), ["--status-color" as any]: color }}
      {...props}
    >
      {children}
    </Card>
  );
});

AccentCard.displayName = "AccentCard";