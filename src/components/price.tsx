"use client";

import { useStore } from "@/components/store-provider";
import { cn } from "@/lib/utils";

interface PriceProps {
  cents: number;
  compareAtCents?: number | null;
  className?: string;
  compareClassName?: string;
  showUsdHint?: boolean;
}

export function Price({ cents, compareAtCents, className, compareClassName, showUsdHint = false }: PriceProps) {
  const { format, currency, formatIn } = useStore();
  const hasCompare = typeof compareAtCents === "number" && compareAtCents > cents;
  return (
    <span className={cn("inline-flex flex-wrap items-baseline gap-x-2", className)}>
      <span className="tabular-nums">{format(cents)}</span>
      {hasCompare && (
        <span className={cn("text-sm font-normal text-slate-400 line-through tabular-nums", compareClassName)}>
          {format(compareAtCents)}
        </span>
      )}
      {showUsdHint && currency !== "USD" && (
        <span className="text-xs font-normal text-slate-400">≈ {formatIn(cents, "USD")} charged in USD</span>
      )}
    </span>
  );
}

export function Money({ cents, className }: { cents: number; className?: string }) {
  const { format } = useStore();
  return <span className={cn("tabular-nums", className)}>{format(cents)}</span>;
}
