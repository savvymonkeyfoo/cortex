import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";
import { Progress } from "./ui/progress";
import { CheckCircle2, Clock, Play } from "lucide-react";
import type { Assignment, AssignmentStep } from "../types/assignment";

export function StepRow({ step }: { step: AssignmentStep }) {
  const icon =
    step.status === "done" ? <CheckCircle2 className="h-3.5 w-3.5 text-green-600" /> :
    step.status === "running" ? (
      <div className="relative">
        <div className="h-3.5 w-3.5 rounded-full border border-blue-300" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-500 anim-tail-spin" />
      </div>
    ) : <div className="h-3.5 w-3.5 rounded-full border border-muted-foreground/40" />;

  return (
    <div className="flex items-center gap-2 text-sm">
      {icon}
      <span className={step.status === "pending" ? "text-muted-foreground" : ""}>
        {step.title}
      </span>
    </div>
  );
}

export function AssignmentCardBase({
  a,
  headerRight,
  children,
  showProgress = true,
  shimmer = false,
  requestedBy = false,
}: {
  a: Assignment;
  headerRight?: React.ReactNode;
  children?: React.ReactNode;
  showProgress?: boolean;
  shimmer?: boolean;
  requestedBy?: boolean;
}) {
  return (
    <Card className="relative rounded-2xl">
      <CardContent className="p-5 space-y-4">
        {/* Title row */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-lg font-semibold break-words">{a.title}</div>
            {a.description && (
              <div className="text-sm text-muted-foreground mt-1 break-words">
                {a.description}
              </div>
            )}
            <div className="text-xs text-muted-foreground mt-2">
              {requestedBy ? "Requested by" : "Assigned by"}{" "}
              <span className="font-medium text-foreground">{a.createdBy.name}</span>
            </div>
          </div>

          {/* Priority badge (small, unobtrusive) */}
          <div className="flex items-center gap-2 shrink-0">
            <Badge 
              variant="outline" 
              className={`capitalize ${
                a.priority === 'low' ? 'border-blue-500 text-blue-700' :
                a.priority === 'medium' ? 'border-green-500 text-green-700' :
                a.priority === 'high' ? 'border-orange-500 text-orange-700' :
                a.priority === 'critical' ? 'border-red-500 text-red-700' :
                ''
              }`}
            >
              {a.priority}
            </Badge>
            {headerRight}
          </div>
        </div>

        {/* Progress (optional, clipped, no overflow) */}
        {showProgress && typeof a.progress === "number" && (
          <div className="space-y-1">
            <div className="relative rounded-full overflow-hidden">
              <Progress value={a.progress} className="h-2" />
              {shimmer && <div className="absolute inset-0 pointer-events-none anim-shimmer" />}
            </div>
            <div className="text-xs text-muted-foreground">{a.progress}% complete</div>
          </div>
        )}

        {/* Custom block from variants */}
        {children}
      </CardContent>
    </Card>
  );
}