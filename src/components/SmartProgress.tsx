import React from "react";
import { cn } from "./ui/utils";

export function SmartProgress({
  value,
  className,
  height = "h-2",
  "aria-label": ariaLabel = "Progress",
}: {
  value: number;                   // 0..100
  className?: string;
  height?: string;                 // tailwind height utility, e.g. "h-2"
  "aria-label"?: string;
}) {
  const pct = Math.max(0, Math.min(100, Math.round(value || 0)));
  const isZero = pct === 0;
  const isComplete = pct === 100;

  // Track is always muted
  const track = "bg-muted/40";

  // Fill color by state
  const fill = isZero
    ? "bg-muted"                 // 0%
    : isComplete
    ? "bg-emerald-500"           // 100%
    : "bg-blue-500";             // 1..99%

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-full",
        track,
        height,
        className
      )}
      role="progressbar"
      aria-label={ariaLabel}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
    >
      {/* Filled segment */}
      <div
        className={cn(
          "h-full rounded-full transition-[width] duration-300 ease-out",
          fill
        )}
        style={{ width: `${pct}%` }}
      />

      {/* Shimmer, masked to the filled width only (1..99%) */}
      {pct > 0 && pct < 100 && (
        <div
          className="absolute inset-y-0 left-0 pointer-events-none"
          style={{ width: `${pct}%` }}
        >
          <div
            className="h-full w-[200%] -translate-x-full animate-[shimmer_1.25s_linear_infinite]"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(255,255,255,.35), transparent)",
            }}
          />
        </div>
      )}
    </div>
  );
}