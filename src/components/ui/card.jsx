import * as React from "react";
import { cn } from "@/lib/utils";

const Card = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-2xl border border-border bg-surface shadow-card p-5",
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";

const CardHeader = ({ className, ...props }) => (
  <div className={cn("flex items-center justify-between mb-3", className)} {...props} />
);
const CardTitle = ({ className, ...props }) => (
  <h3 className={cn("font-display text-base font-semibold text-foreground", className)} {...props} />
);
const CardDescription = ({ className, ...props }) => (
  <p className={cn("text-sm text-foreground-muted", className)} {...props} />
);
const CardContent = ({ className, ...props }) => <div className={cn(className)} {...props} />;

export { Card, CardHeader, CardTitle, CardDescription, CardContent };
