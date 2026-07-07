import { cn } from "@/lib/utils";

const VARIANT_CLASSES = {
  default: "bg-sun/15 text-sun",
  success: "bg-success/15 text-success",
  danger: "bg-danger/15 text-danger",
  neutral: "bg-surface-elevated text-foreground-muted border border-border",
  dawn: "bg-dawn/15 text-dawn",
};

export function Badge({ className, variant = "default", ...props }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        VARIANT_CLASSES[variant],
        className
      )}
      {...props}
    />
  );
}
