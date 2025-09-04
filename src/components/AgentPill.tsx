import { Crown, Wrench, Monitor } from "lucide-react";
import type { AgentId } from "./TodoCard";
import React from "react";

const AGENT_META: Record<
  AgentId,
  { label: string; Icon: React.ComponentType<any>; className: string }
> = {
  "devops-supervisor": {
    label: "Supervisor",
    Icon: Crown,
    className: "border-purple-300 text-purple-700",
  },
  "network-troubleshooting": {
    label: "Troubleshooting",
    Icon: Wrench,
    className: "border-blue-300 text-blue-700",
  },
  "network-cost-management": {
    label: "Cost Mgmt",
    Icon: Monitor,
    className: "border-emerald-300 text-emerald-700",
  },
};

export function AgentPill({ id }: { id: AgentId }) {
  const meta = AGENT_META[id];
  if (!meta) return null;
  const { Icon, label, className } = meta;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-[2px] text-[11px] ${className}`}
    >
      <Icon className="h-3 w-3" aria-hidden="true" />
      {label}
    </span>
  );
}