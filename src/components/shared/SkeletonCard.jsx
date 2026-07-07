import { cn } from "@/lib/utils";

/** Shimmering placeholder shown while dashboard/list data is loading. */
export function SkeletonCard({ className, lines = 3 }) {
  return (
    <div className={cn("rounded-2xl border border-border bg-surface p-5 animate-pulse", className)}>
      <div className="h-4 w-1/3 bg-surface-elevated rounded mb-4" />
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-3 w-full bg-surface-elevated rounded mb-2 last:mb-0" />
      ))}
    </div>
  );
}
