// AssignmentCards.tsx
import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "./ui/utils";

import { Card, CardContent } from "./ui/card";
import { AccentCard } from "./AccentCard";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { SmartProgress } from "./SmartProgress";
import {
  Dialog,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { severityTokens, toSeverity, type Severity } from "../lib/status-theme";

import { CheckCircle2 } from "lucide-react";

// ---------- Types ----------
export type Status = "todo" | "in_progress" | "review" | "done";

export type AgentId =
  | "devops-supervisor"
  | "network-troubleshooting"
  | "network-cost-management";

export type StepState = "pending" | "running" | "done";

export type Step = {
  id: string;
  title: string;
  description?: string;
  state: StepState;
  agent: AgentId;
};

export type Assignment = {
  id: string;
  title: string;
  description?: string;
  priority: "low" | "medium" | "high" | "critical";
  createdBy: { id: string; name: string };
  progress?: number; // 0..100 (we override per status below)
};

// Status-specific props (discriminated union)
type StatusProps =
  | { status: "todo"; scheduledNote?: string; estimateMinutes?: number }
  | { status: "in_progress"; liveNote?: string; etaMinutes?: number }
  | { status: "review"; waitingOn?: { id?: string; name?: string; role?: string; avatar_url?: string } }
  | { status: "done"; completedAtISO: string; summaryNote?: string };

type AssignmentCardProps = {
  assignment: Assignment;
  steps: Step[];
} & StatusProps;

// ---------- Small design tokens ----------
// Legacy priority tones - now using severity tokens instead
// const priorityTone: Record<Assignment["priority"], string> = {
//   low: "border-blue-500 text-blue-700",
//   medium: "border-green-500 text-green-700",
//   high: "border-orange-500 text-orange-700",
//   critical: "border-red-500 text-red-700",
// };

const agentTone: Record<AgentId, string> = {
  "devops-supervisor": "bg-violet-100 text-violet-700 ring-violet-200",
  "network-troubleshooting": "bg-sky-100 text-sky-700 ring-sky-200",
  "network-cost-management": "bg-emerald-100 text-emerald-700 ring-emerald-200",
};

function StateIcon({ state }: { state: StepState }) {
  if (state === "done") {
    return <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden />;
  }
  if (state === "running") {
    return (
      <span className="relative inline-block h-4 w-4" aria-hidden>
        <span className="absolute inset-0 rounded-full border border-sky-300" />
        <span className="absolute inset-0 rounded-full border-2 border-transparent border-t-sky-500 animate-spin" />
      </span>
    );
  }
  // pending
  return <span className="inline-block h-4 w-4 rounded-full border border-muted-foreground/40" aria-hidden />;
}

export function StepRow({
  index,
  title,
  description,
  state,
  agent,
  className,
}: {
  index: number;
  title: string;
  description?: string;
  state: StepState;
  agent: AgentId;
  className?: string;
}) {
  return (
    <li
      className={cn(
        "flex items-start gap-3 rounded-xl p-3",
        "hover:bg-muted/40 focus-within:bg-muted/40 transition-colors",
        className
      )}
    >
      {/* No left rail—this removes the stray vertical line */}
      <div className="mt-0.5 flex items-center gap-2">
        <div className="h-5 w-5 shrink-0 rounded-full bg-muted/70 text-xs grid place-items-center">
          {index}
        </div>
        <StateIcon state={state} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="font-medium leading-tight truncate">{title}</div>
            {description && (
              <div className="text-sm text-muted-foreground truncate">
                {description}
              </div>
            )}
          </div>

          {/* Agent pill */}
          <span
            className={cn(
              "shrink-0 rounded-full px-2 py-1 text-[11px] ring-1",
              agentTone[agent]
            )}
            title={agent}
          >
            {agent === "devops-supervisor" && "Supervisor"}
            {agent === "network-troubleshooting" && "Troubleshooting"}
            {agent === "network-cost-management" && "Cost Mgmt"}
          </span>
        </div>
      </div>
    </li>
  );
}

// Radix dialog without the default close button
const DialogContentNoClose = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/70 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-1/2 top-1/2 z-50 w-full max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-2xl border bg-background p-6 shadow-lg focus:outline-none",
        "data-[state=open]:animate-in data-[state=open]:zoom-in-95 data-[state=open]:fade-in-0",
        className
      )}
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
));
DialogContentNoClose.displayName = "DialogContentNoClose";

// ---------- Enhanced Summary Cards with "Next step" teaser ----------
function TodoCardSummary({ a }: { a: Assignment & { steps: Step[]; estimateMinutes?: number } }) {
  const next = a.steps.find(s => s.state === "pending");

  return (
    <AccentCard tone="severity" statusKey={toSeverity(a.priority)} className="rounded-2xl hover:shadow-md transition">
      <CardContent className="p-4 space-y-3">
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
          <Badge variant="outline" className={`shrink-0 capitalize ${severityTokens[toSeverity(a.priority)].badge}`}>
            {a.priority}
          </Badge>
        </div>

        <div className="space-y-1">
          <SmartProgress value={a.progress ?? 0} className="h-1.5" />
          <div className="text-[11px] text-muted-foreground">
            {a.progress ?? 0}% complete
          </div>
        </div>

        {/* Next step teaser */}
        {next && (
          <div className="rounded-lg border bg-muted/30 px-3 py-2">
            <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Next step</div>
            <div className="text-sm">
              {next.title}
              {next.description ? (
                <span className="text-muted-foreground"> — {next.description}</span>
              ) : null}
            </div>
          </div>
        )}

        {/* Scheduled callout with pulse */}
        <div className="rounded-xl border bg-muted/30 p-3 animate-[pulse_2.5s_ease-in-out_infinite]">
          <div className="text-sm leading-snug">Scheduled and pending. All steps queued in order.</div>
        </div>
      </CardContent>
    </AccentCard>
  );
}

function InProgressCardSummary({ a }: { a: Assignment & { steps: Step[]; liveNote?: string } }) {
  // Dynamic step calculation
  const total = a.steps.length;
  const done = a.steps.filter(s => s.state === "done").length;
  const runningIndex = a.steps.findIndex(s => s.state === "running");
  const currentStep = Math.max(done + 1, runningIndex >= 0 ? runningIndex + 1 : 1);
  const dynamicNote = a.liveNote || `Executing step ${currentStep}/${total}…`;

  return (
    <AccentCard tone="severity" statusKey={toSeverity(a.priority)} className="rounded-2xl hover:shadow-md transition">
      <CardContent className="p-4 space-y-3">
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
          <Badge variant="outline" className={`shrink-0 capitalize ${severityTokens[toSeverity(a.priority)].badge}`}>
            {a.priority}
          </Badge>
        </div>

        {/* Smart progress with built-in shimmer */}
        <div className="space-y-1">
          <SmartProgress value={a.progress ?? 45} className="h-1.5" />
          <div className="text-[11px] text-muted-foreground">{a.progress ?? 45}% complete</div>
        </div>

        {/* Live status callout */}
        <div className="rounded-xl border bg-muted/30 p-3">
          <div className="text-sm leading-snug">{dynamicNote}</div>
        </div>
      </CardContent>
    </AccentCard>
  );
}

function ReviewCardSummary({
  a,
}: {
  a: Assignment & {
    waitingOn?: { id?: string; name?: string; role?: string; avatar_url?: string };
  };
}) {
  // Normalize reviewer name with sensible fallbacks
  const reviewerName =
    a.waitingOn?.name?.trim() ||
    a.waitingOn?.id?.trim() ||
    "Unassigned";

  const reviewerRole = a.waitingOn?.role?.trim();

  return (
    <AccentCard tone="severity" statusKey={toSeverity(a.priority)} className="rounded-2xl hover:shadow-md transition relative">
      <CardContent className="p-4 space-y-3">
        {/* Waiting on pill - top-right */}
        <div className="absolute top-3 right-3 flex items-center gap-2 rounded-full border border-yellow-300/60 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-600/40 px-3 py-1 shadow-sm">
          <Avatar className="h-5 w-5">
            {a.waitingOn?.avatar_url ? (
              <AvatarImage src={a.waitingOn.avatar_url} alt={reviewerName} />
            ) : (
              <AvatarFallback className="text-[10px] bg-yellow-100 dark:bg-yellow-800 text-yellow-900 dark:text-yellow-100">
                {reviewerName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </AvatarFallback>
            )}
          </Avatar>
          <span className="text-xs font-semibold text-yellow-900 dark:text-yellow-100">
            Waiting for review: {reviewerName}
          </span>
        </div>

        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 pr-24">
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
          <Badge variant="outline" className={`shrink-0 capitalize ${severityTokens[toSeverity(a.priority)].badge}`}>
            {a.priority}
          </Badge>
        </div>

        <div className="space-y-1">
          <SmartProgress value={80} className="h-1.5" />
          <div className="text-[11px] text-muted-foreground">80% complete</div>
        </div>

        {/* Review status callout */}
        <div className="rounded-xl border bg-muted/50 px-3 py-2">
          <div className="text-xs text-muted-foreground">
            Waiting for review: <span className="font-medium text-foreground">{reviewerName}</span>
            {reviewerRole ? ` (${reviewerRole})` : ""}. Please review.
          </div>
        </div>
      </CardContent>
    </AccentCard>
  );
}

function DoneCardSummary({ a }: { a: Assignment }) {
  return (
    <AccentCard tone="severity" statusKey={toSeverity(a.priority)} className="rounded-2xl hover:shadow-md transition">
      <CardContent className="p-4 space-y-3">
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
          <Badge variant="outline" className={`shrink-0 capitalize ${severityTokens[toSeverity(a.priority)].badge}`}>
            {a.priority}
          </Badge>
        </div>

        <div className="space-y-1">
          <SmartProgress value={100} className="h-1.5" />
          <div className="text-[11px] text-muted-foreground">100% complete</div>
        </div>

        {/* Success callout */}
        <div className="rounded-xl border bg-muted/30 p-3">
          <div className="text-sm leading-snug">Successfully deployed and verified.</div>
        </div>
      </CardContent>
    </AccentCard>
  );
}

// ---------- Enhanced Modal Components ----------
function TodoCardModal({ a }: { a: Assignment & { steps: Step[]; estimateMinutes?: number } }) {
  return (
    <DialogContentNoClose>
      <DialogHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <DialogTitle className="text-lg font-semibold leading-tight break-words">{a.title}</DialogTitle>
            {a.description && (
              <DialogDescription className="text-sm text-muted-foreground mt-1 break-words">{a.description}</DialogDescription>
            )}
          </div>
          <Badge variant="outline" className={`capitalize ${severityTokens[toSeverity(a.priority)].badge}`}>
            {a.priority}
          </Badge>
        </div>
      </DialogHeader>

      {/* Meta */}
      <div className="mt-3 flex items-center justify-between text-sm">
        <div className="text-muted-foreground">
          Requested by <span className="font-medium text-foreground">{a.createdBy.name}</span>
        </div>
        {typeof a.estimateMinutes === "number" && (
          <div className="text-muted-foreground">Estimated: ≤{a.estimateMinutes}m</div>
        )}
      </div>

      {/* Progress */}
      <div className="mt-3">
        <SmartProgress value={a.progress ?? 0} />
        <div className="mt-1 text-xs text-muted-foreground">
          {a.progress ?? 0}% complete
        </div>
      </div>

      {/* Steps */}
      <section aria-label="Planned steps">
        <div className="text-sm font-medium mb-2">Steps</div>
        <ol className="space-y-2">
          {a.steps.map((s, i) => (
            <StepRow
              key={s.id}
              index={i + 1}
              title={s.title}
              description={s.description}
              state={s.state}
              agent={s.agent}
            />
          ))}
        </ol>
      </section>

      {/* Callout */}
      <div className="mt-5 rounded-xl border bg-muted/30 p-3 animate-[pulse_2.5s_ease-in-out_infinite]">
        Scheduled and pending. All steps queued in order.
      </div>
    </DialogContentNoClose>
  );
}

function InProgressCardModal({ a }: { a: Assignment & { steps: Step[]; etaMinutes?: number; liveNote?: string } }) {
  const total = a.steps.length;
  const done = a.steps.filter(s => s.state === "done").length;
  const runningIndex = a.steps.findIndex(s => s.state === "running");
  const dynamicNote = a.liveNote || (runningIndex >= 0
    ? `Executing step ${Math.max(done + 1, runningIndex + 1)}/${total}…`
    : `Executing…`);

  return (
    <DialogContentNoClose>
      <DialogHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <DialogTitle className="text-lg font-semibold leading-tight break-words">{a.title}</DialogTitle>
            {a.description && (
              <DialogDescription className="text-sm text-muted-foreground mt-1 break-words">{a.description}</DialogDescription>
            )}
          </div>
          <Badge variant="outline" className={`capitalize ${severityTokens[toSeverity(a.priority)].badge}`}>
            {a.priority}
          </Badge>
        </div>
      </DialogHeader>

      {/* Meta */}
      <div className="mt-3 flex items-center justify-between text-sm">
        <div className="text-muted-foreground">
          Requested by <span className="font-medium text-foreground">{a.createdBy.name}</span>
        </div>
        {typeof a.etaMinutes === "number" && (
          <div className="text-muted-foreground">ETA: ~{a.etaMinutes}m</div>
        )}
      </div>

      {/* Progress (smart with built-in animation) */}
      <div className="mt-3">
        <SmartProgress value={a.progress ?? 45} />
        <div className="mt-1 text-xs text-muted-foreground">{a.progress ?? 45}% complete</div>
      </div>

      {/* Steps */}
      <section aria-label="Active steps">
        <div className="text-sm font-medium mb-2">Steps</div>
        <ol className="space-y-2">
          {a.steps.map((s, i) => (
            <StepRow
              key={s.id}
              index={i + 1}
              title={s.title}
              description={s.description}
              state={s.state}
              agent={s.agent}
            />
          ))}
        </ol>
      </section>

      {/* Dynamic callout */}
      <div className="mt-5 rounded-xl border bg-muted/30 p-3">
        {dynamicNote}
      </div>
    </DialogContentNoClose>
  );
}

function ReviewCardModal({
  a,
}: {
  a: Assignment & {
    steps: Step[];
    waitingOn?: { id?: string; name?: string; role?: string; avatar_url?: string };
  };
}) {
  const reviewerName = a.waitingOn?.name?.trim() || a.waitingOn?.id?.trim() || "Unassigned";
  const reviewerRole = a.waitingOn?.role?.trim();
  return (
    <DialogContentNoClose>
      <DialogHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <DialogTitle className="text-lg font-semibold leading-tight break-words">{a.title}</DialogTitle>
            {a.description && (
              <DialogDescription className="text-sm text-muted-foreground mt-1 break-words">{a.description}</DialogDescription>
            )}
          </div>
          <Badge variant="outline" className={`capitalize ${severityTokens[toSeverity(a.priority)].badge}`}>
            {a.priority}
          </Badge>
        </div>
      </DialogHeader>

      {/* Meta */}
      <div className="mt-3 flex items-center justify-between text-sm">
        <div className="text-muted-foreground">
          Awaiting <span className="font-medium text-foreground">{reviewerName}</span>
          {reviewerRole ? <span className="text-muted-foreground"> ({reviewerRole})</span> : null}
        </div>
        <div className="text-muted-foreground">
          Requested by <span className="font-medium text-foreground">{a.createdBy.name}</span>
        </div>
      </div>

      {/* Progress */}
      <div className="mt-3">
        <SmartProgress value={100} />
        <div className="mt-1 text-xs text-muted-foreground">100% complete</div>
      </div>

      {/* Steps */}
      <section aria-label="Active steps">
        <div className="text-sm font-medium mb-2">Steps</div>
        <ol className="space-y-2">
          {a.steps.map((s, i) => (
            <StepRow
              key={s.id}
              index={i + 1}
              title={s.title}
              description={s.description}
              state={s.state}
              agent={s.agent}
            />
          ))}
        </ol>
      </section>
    </DialogContentNoClose>
  );
}

function DoneCardModal({ a }: { a: Assignment & { steps: Step[]; completedAtISO: string } }) {
  return (
    <DialogContentNoClose>
      <DialogHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <DialogTitle className="text-lg font-semibold leading-tight break-words">{a.title}</DialogTitle>
            {a.description && (
              <DialogDescription className="text-sm text-muted-foreground mt-1 break-words">{a.description}</DialogDescription>
            )}
          </div>
          <Badge variant="outline" className={`capitalize ${severityTokens[toSeverity(a.priority)].badge}`}>
            {a.priority}
          </Badge>
        </div>
      </DialogHeader>

      {/* Meta */}
      <div className="mt-3 flex items-center justify-between text-sm">
        <div className="text-muted-foreground">
          Completed{" "}
          <span className="font-medium text-foreground">
            {new Date(a.completedAtISO).toLocaleString()}
          </span>
        </div>
        <div className="text-muted-foreground">
          Requested by <span className="font-medium text-foreground">{a.createdBy.name}</span>
        </div>
      </div>

      {/* Progress */}
      <div className="mt-3">
        <SmartProgress value={100} />
        <div className="mt-1 text-xs text-muted-foreground">100% complete</div>
      </div>

      {/* Steps */}
      <section aria-label="Active steps">
        <div className="text-sm font-medium mb-2">Steps</div>
        <ol className="space-y-2">
          {a.steps.map((s, i) => (
            <StepRow
              key={s.id}
              index={i + 1}
              title={s.title}
              description={s.description}
              state={s.state}
              agent={s.agent}
            />
          ))}
        </ol>
      </section>

      {/* Success callout */}
      <div className="mt-5 rounded-xl border bg-muted/30 p-3">
        Successfully deployed and verified.
      </div>
    </DialogContentNoClose>
  );
}

// ---------- Public wrapper components ----------
export function TodoCard({ assignment, steps, estimateMinutes }: {
  assignment: Assignment;
  steps: Step[];
  estimateMinutes?: number;
}) {
  const a = { ...assignment, steps, estimateMinutes };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div><TodoCardSummary a={a} /></div>
      </DialogTrigger>
      <TodoCardModal a={a} />
    </Dialog>
  );
}

export function InProgressCard({ assignment, steps, liveNote, etaMinutes }: {
  assignment: Assignment;
  steps: Step[];
  liveNote?: string;
  etaMinutes?: number;
}) {
  const a = { ...assignment, steps, liveNote, etaMinutes };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div><InProgressCardSummary a={a} /></div>
      </DialogTrigger>
      <InProgressCardModal a={a} />
    </Dialog>
  );
}

export function ReviewCard({
  assignment,
  steps,
  waitingOn,
}: {
  assignment: Assignment;
  steps: Step[];
  waitingOn?: { id?: string; name?: string; role?: string; avatar_url?: string };
}) {
  const a = { ...assignment, steps, waitingOn };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div><ReviewCardSummary a={a} /></div>
      </DialogTrigger>
      <ReviewCardModal a={a} />
    </Dialog>
  );
}

export function DoneCard({ assignment, steps, completedAtISO }: {
  assignment: Assignment;
  steps: Step[];
  completedAtISO: string;
}) {
  const a = { ...assignment, steps, completedAtISO };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div><DoneCardSummary a={a} /></div>
      </DialogTrigger>
      <DoneCardModal a={a} />
    </Dialog>
  );
}

// Legacy wrapper for backward compatibility
export function AssignmentCard(props: AssignmentCardProps) {
  const { assignment, steps } = props;

  if (props.status === "todo") {
    return <TodoCard assignment={assignment} steps={steps} estimateMinutes={props.estimateMinutes} />;
  }
  
  if (props.status === "in_progress") {
    return <InProgressCard assignment={assignment} steps={steps} liveNote={props.liveNote} etaMinutes={props.etaMinutes} />;
  }
  
  if (props.status === "review") {
    return <ReviewCard assignment={assignment} steps={steps} waitingOn={props.waitingOn} />;
  }
  
  if (props.status === "done") {
    return <DoneCard assignment={assignment} steps={steps} completedAtISO={props.completedAtISO} />;
  }

  return null;
}