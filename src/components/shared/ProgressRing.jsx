import { motion } from "framer-motion";

/**
 * SIGNATURE ELEMENT — "Sunrise Ring"
 * The recurring visual motif of Surya Center: every progress metric (goal
 * completion, habit streak, daily priorities done) renders as an arc rising
 * like a sun over the horizon, rather than a generic circular spinner.
 * Reused across Dashboard, Goal Center, and Habit Tracker for consistency.
 */
export function ProgressRing({ value = 0, size = 64, strokeWidth = 6, label, sublabel }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(value, 100) / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-surface-elevated"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#sunrise-gradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
        <defs>
          <linearGradient id="sunrise-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F7C36B" />
            <stop offset="100%" stopColor="#F2A93B" />
          </linearGradient>
        </defs>
      </svg>
      {(label || sublabel) && (
        <div className="text-center -mt-1">
          {label && <div className="font-display text-sm font-semibold">{label}</div>}
          {sublabel && <div className="text-xs text-foreground-muted">{sublabel}</div>}
        </div>
      )}
    </div>
  );
}
