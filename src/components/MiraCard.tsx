// MiraCard.tsx - Mira Ops Design System Card Component
import * as React from "react";
import { cn } from "./ui/utils";

export type AccentFrom = "priority" | "risk";
export type AccentLevel = "low" | "medium" | "high" | "critical";
export type CardState = "default" | "hover" | "focus" | "disabled";

interface MiraCardProps extends React.HTMLAttributes<HTMLDivElement> {
  accentFrom: AccentFrom;
  level: AccentLevel;
  state?: CardState;
  children: React.ReactNode;
}

// Color mapping for accent system
const getAccentColor = (accentFrom: AccentFrom, level: AccentLevel): string => {
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
};

export function MiraCard({ 
  accentFrom, 
  level, 
  state = "default", 
  className, 
  children, 
  style,
  ...props 
}: MiraCardProps) {
  const accentColor = getAccentColor(accentFrom, level);
  
  return (
    <div
      className={cn(
        "mira-accent-card",
        className
      )}
      style={{
        "--accent": accentColor,
        ...style
      } as React.CSSProperties}
      data-state={state}
      {...props}
    >
      {children}
    </div>
  );
}

// Mira Badge Component
interface MiraBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  type: AccentFrom;
  level: AccentLevel;
  children: React.ReactNode;
}

export function MiraBadge({ type, level, className, children, style, ...props }: MiraBadgeProps) {
  const accentColor = getAccentColor(type, level);
  
  return (
    <span
      className={cn("mira-badge", className)}
      style={{
        "--accent": accentColor,
        ...style
      } as React.CSSProperties}
      {...props}
    >
      {children}
    </span>
  );
}

// Mira Progress Component
interface MiraProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0-100
}

export function MiraProgress({ value, className, ...props }: MiraProgressProps) {
  const getProgressState = (val: number) => {
    if (val === 0) return "idle";
    if (val === 100) return "complete";
    return "active";
  };
  
  const state = getProgressState(value);
  
  return (
    <div className={cn("mira-progress", className)} {...props}>
      <div 
        className="mira-progress-fill"
        data-state={state}
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}

// Mira Step Row Component
interface MiraStepRowProps extends React.HTMLAttributes<HTMLDivElement> {
  index: number;
  title: string;
  description?: string;
  agent?: React.ReactNode;
  state?: "pending" | "running" | "done";
}

export function MiraStepRow({ 
  index, 
  title, 
  description, 
  agent, 
  state = "pending",
  className, 
  ...props 
}: MiraStepRowProps) {
  return (
    <div className={cn("mira-step-row", className)} {...props}>
      <div className="mira-step-index">
        {state === "done" ? "✓" : index}
      </div>
      <div className="mira-step-content">
        <div className="mira-step-title">{title}</div>
        {description && (
          <div className="mira-step-description">{description}</div>
        )}
      </div>
      {agent && (
        <div className="mira-agent-tag">{agent}</div>
      )}
    </div>
  );
}

// Triage Card Content Template
interface TriageCardContentProps {
  title: string;
  risk: AccentLevel;
  summary: string;
  agent: string;
  autonomy: string;
  confidence: number;
  assignee: string;
  provenance: string[];
  children?: React.ReactNode; // For expanded content
}

export function TriageCardContent({
  title,
  risk,
  summary,
  agent,
  autonomy, 
  confidence,
  assignee,
  provenance,
  children
}: TriageCardContentProps) {
  return (
    <div className="p-4">
      <div className="mira-card-header">
        <div className="flex-1 min-w-0">
          <h3 className="mira-card-title">{title}</h3>
        </div>
        <MiraBadge type="risk" level={risk}>
          {risk} Risk
        </MiraBadge>
      </div>
      
      <p className="mira-card-description">{summary}</p>
      
      <div className="flex items-center gap-4 text-sm mt-3">
        <div className="flex items-center gap-1">
          <span>Agent: {agent}</span>
        </div>
        <div className="flex items-center gap-1">
          <span>Autonomy: </span>
          <MiraBadge type="priority" level="medium">{autonomy}</MiraBadge>
        </div>
        <div className="flex items-center gap-1">
          <span>Confidence: {confidence}%</span>
        </div>
        <div className="flex items-center gap-1">
          <span>Assignee: {assignee}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-1 mt-3">
        {provenance.map((source, index) => (
          <MiraBadge key={index} type="priority" level="low">
            {source}
          </MiraBadge>
        ))}
      </div>
      
      {children}
    </div>
  );
}

// Assignment Card Content Template
interface AssignmentCardContentProps {
  title: string;
  description?: string;
  priority: AccentLevel;
  createdBy: string;
  progress: number;
  statusNote?: string;
  children?: React.ReactNode;
}

export function AssignmentCardContent({
  title,
  description,
  priority,
  createdBy,
  progress,
  statusNote,
  children
}: AssignmentCardContentProps) {
  return (
    <div className="p-4">
      <div className="mira-card-header">
        <div className="flex-1 min-w-0">
          <h3 className="mira-card-title">{title}</h3>
          {description && (
            <p className="mira-card-description">{description}</p>
          )}
        </div>
        <MiraBadge type="priority" level={priority}>
          {priority}
        </MiraBadge>
      </div>
      
      <div className="mira-card-meta">
        Requested by <span className="font-medium text-foreground">{createdBy}</span>
      </div>
      
      <div className="space-y-1 mt-3">
        <MiraProgress value={progress} />
        <div className="text-xs text-muted-foreground">
          {progress}% complete
        </div>
      </div>
      
      {statusNote && (
        <div className="mira-status-callout">
          <div className="mira-status-callout-text">{statusNote}</div>
        </div>
      )}
      
      {children}
    </div>
  );
}