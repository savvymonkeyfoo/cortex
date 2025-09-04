import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import {
  Dialog,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "./ui/utils";
import { StepRow, type StepState } from "./StepRow";
import type { Assignment } from "../types/assignment";
import React from "react";

// tone by priority (keeps global badge look)
const priorityTone: Record<Assignment["priority"], string> = {
  low: "border-blue-500 text-blue-700",
  medium: "border-green-500 text-green-700",
  high: "border-orange-500 text-orange-700",
  critical: "border-red-500 text-red-700",
};

export type AgentId =
  | "devops-supervisor"
  | "network-troubleshooting"
  | "network-cost-management";

export type TodoAssignment = Assignment & {
  scheduledNote?: string;
  estimateMinutes?: number;
  steps: Array<{
    id: string;
    title: string;
    description?: string;
    state: StepState;      // "pending" | "running" | "done"
    agent: AgentId;        // NEW: who owns this step
  }>;
};

// Custom DialogContent without close button
const DialogContentNoClose = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      )}
      {...props}
    >
      {children}
      {/* No close button here */}
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
));

/** BOARD SUMMARY (Jira-like) */
function TodoCardSummary({ a }: { a: TodoAssignment }) {
  return (
    <Card className="rounded-2xl hover:shadow-md transition">
      <CardContent className="p-4 space-y-3">
        {/* Title + priority tag */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="font-medium leading-tight break-words">{a.title}</div>
            {a.description && (
              <div className="text-sm text-muted-foreground mt-1 break-words">
                {a.description}
              </div>
            )}
            <div className="text-xs text-muted-foreground mt-2">
              Requested by{" "}
              <span className="font-medium text-foreground">{a.createdBy.name}</span>
            </div>
          </div>

          <Badge
            variant="outline"
            className={`shrink-0 capitalize ${priorityTone[a.priority]}`}
          >
            {a.priority}
          </Badge>
        </div>

        {/* Progress (thin, no shimmer in To-Do) */}
        <div className="space-y-1">
          <Progress value={a.progress ?? 0} className="h-1.5" />
          <div className="text-[11px] text-muted-foreground">
            {a.progress ?? 0}% complete
          </div>
        </div>

        {/* Scheduled / pending callout */}
        {a.scheduledNote && (
          <div className="rounded-xl border bg-muted/30 p-3 animate-[pulse_2.5s_ease-in-out_infinite]">
            <div className="text-sm leading-snug">{a.scheduledNote}</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/** MODAL DETAIL (no "×", click-away closes) */
function TodoCardModal({ a }: { a: TodoAssignment }) {
  return (
    <DialogContentNoClose className="max-w-xl">
      <DialogHeader>
        <DialogTitle className="flex items-start justify-between gap-3">
          <span className="leading-tight">{a.title}</span>
          <Badge
            variant="outline"
            className={`capitalize ${priorityTone[a.priority]}`}
          >
            {a.priority}
          </Badge>
        </DialogTitle>

        {a.description && (
          <DialogDescription className="mt-1">
            {a.description}
          </DialogDescription>
        )}
      </DialogHeader>

      <div className="space-y-6">
        {/* meta row */}
        <div className="flex items-center justify-between text-sm">
          <div className="text-muted-foreground">
            Requested by{" "}
            <span className="font-medium text-foreground">{a.createdBy.name}</span>
          </div>
          {typeof a.estimateMinutes === "number" && (
            <div className="text-muted-foreground">
              Estimated: ≤{a.estimateMinutes}m
            </div>
          )}
        </div>

        {/* progress */}
        <div>
          <Progress value={a.progress ?? 0} />
          <div className="mt-1 text-xs text-muted-foreground">
            {a.progress ?? 0}% complete
          </div>
        </div>

        {/* steps: numbered, descriptive, timeline rail */}
        <section aria-label="Planned steps">
          <div className="text-sm font-medium mb-2">Steps</div>
          <ol className="space-y-3">
            {a.steps.map((s, i) => (
              <StepRow
                key={s.id}
                index={i + 1}
                title={s.title}
                description={s.description}
                state={s.state}
                agent={s.agent}             // NEW
              />
            ))}
          </ol>
        </section>

        {a.scheduledNote && (
          <div className="rounded-xl border bg-muted/30 p-3 animate-[pulse_2.5s_ease-in-out_infinite]">
            {a.scheduledNote}
          </div>
        )}
      </div>
    </DialogContentNoClose>
  );
}

/** PUBLIC WRAPPER */
export function TodoCard({ a }: { a: TodoAssignment }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <div>
          <TodoCardSummary a={a} />
        </div>
      </DialogTrigger>
      {/* No DialogClose => no "×" button */}
      <TodoCardModal a={a} />
    </Dialog>
  );
}