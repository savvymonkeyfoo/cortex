// utils/statusColors.ts
export type Risk = "Critical" | "High" | "Medium" | "Low";
export type Priority = "critical" | "high" | "medium" | "low";
export type TaskStatus = "todo" | "in_progress" | "review" | "done";

export const riskColor: Record<Risk,string> = {
  Critical: "#ef4444", // red-500
  High:     "#f97316", // orange-500
  Medium:   "#eab308", // amber-500
  Low:      "#22c55e", // green-500
};

export const priorityColor: Record<Priority,string> = {
  critical: "#ef4444",
  high:     "#f97316",
  medium:   "#22c55e", // you can switch to amber if you prefer
  low:      "#3b82f6",
};

export const taskStatusColor: Record<TaskStatus,string> = {
  todo:        "#64748b", // slate-500
  in_progress: "#3b82f6", // blue-500
  review:      "#f59e0b", // amber-500
  done:        "#22c55e", // green-500
};