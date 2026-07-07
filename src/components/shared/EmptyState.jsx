import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

/**
 * Empty states are an invitation to act, not just "no data" filler —
 * every instance names the specific action that fills the screen.
 */
export function EmptyState({ icon: Icon, title, description, actionLabel, onAction }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center text-center py-12 px-6"
    >
      {Icon && (
        <div className="h-14 w-14 rounded-2xl bg-surface-elevated flex items-center justify-center mb-4">
          <Icon className="h-6 w-6 text-sun" />
        </div>
      )}
      <h3 className="font-display font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-foreground-muted max-w-xs mb-5">{description}</p>
      {actionLabel && (
        <Button size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </motion.div>
  );
}
