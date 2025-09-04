import { CheckCircle2 } from "lucide-react";
import type { AssignmentStep } from "../types/assignment";

export function StepRow({ step }: { step: AssignmentStep }) {
  const icon =
    step.status === "done" ? (
      <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
    ) : step.status === "running" ? (
      <div className="h-3.5 w-3.5 rounded-full border border-muted-foreground/40" />
    ) : (
      <div className="h-3.5 w-3.5 rounded-full border border-muted-foreground/40" />
    );

  return (
    <div className="flex items-center gap-2 text-sm">
      {icon}
      <span
        className={
          step.status === "pending" ? "text-muted-foreground" : "text-foreground"
        }
      >
        {step.title}
      </span>
    </div>
  );
}