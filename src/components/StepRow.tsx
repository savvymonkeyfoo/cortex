import { CheckCircle2, Clock } from "lucide-react";
import React from "react";
import { AgentPill } from "./AgentPill";
import type { AgentId } from "./TodoCard";

export type StepState = "pending" | "running" | "done";

export function StepRow({
  index,
  title,
  description,
  state = "pending",
  agent, // NEW
}: {
  index: number;
  title: string;
  description?: string;
  state?: StepState;
  agent: AgentId;          // NEW
}) {
  const icon =
    state === "done" ? (
      <CheckCircle2 className="h-4 w-4 text-green-600" aria-hidden="true" />
    ) : state === "running" ? (
      <span
        className="relative inline-block h-4 w-4"
        aria-label="In progress"
        role="status"
      >
        <span className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-500 animate-spin" />
        <span className="absolute inset-[3px] rounded-full bg-background" />
      </span>
    ) : (
      <span className="relative inline-block h-4 w-4" aria-label="Pending">
        <span className="absolute inset-[3px] rounded-full bg-muted-foreground/30" />
        <span className="absolute inset-0 rounded-full ring-2 ring-muted-foreground/20 animate-pulse" />
      </span>
    );

  return (
    <li className="relative pl-7">
      {/* timeline rail */}
      <span className="absolute left-[9px] top-5 h-[calc(100%-1.25rem)] w-px bg-border" aria-hidden="true" />
      {/* bullet/icon */}
      <span className="absolute left-0 top-0">{icon}</span>

      <div className="flex items-start justify-between gap-3">
        <div className="leading-tight min-w-0">
          <div className="font-medium text-[13px]">
            {index}. {title}
          </div>
          {description && (
            <div className="text-xs text-muted-foreground mt-0.5">
              {description}
            </div>
          )}
        </div>

        {/* Agent to the right */}
        <div className="shrink-0 mt-[2px]">
          <AgentPill id={agent} />
        </div>
      </div>
    </li>
  );
}