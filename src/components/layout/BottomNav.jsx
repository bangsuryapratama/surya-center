import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { LayoutDashboard, Target, Wallet, Sparkles, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { to: "/", label: "Beranda", icon: LayoutDashboard },
  { to: "/goals", label: "Goal", icon: Target },
  { to: "/money", label: "Uang", icon: Wallet },
  { to: "/mentor", label: "Mentor", icon: Sparkles },
  { to: "/more", label: "Lainnya", icon: MoreHorizontal },
];

/**
 * Mobile bottom navigation — 5 primary destinations. The AI Mentor sits in
 * the visually elevated center-right slot since it's the flagship feature
 * users are expected to return to daily.
 */
export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-surface/90 backdrop-blur-lg pb-[env(safe-area-inset-bottom)] md:hidden">
      <ul className="flex items-stretch justify-between px-2">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                cn(
                  "relative flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-medium transition-colors",
                  isActive ? "text-sun" : "text-foreground-subtle"
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId="bottom-nav-indicator"
                      className="absolute top-0 h-0.5 w-8 rounded-full bg-sun"
                    />
                  )}
                  <Icon className="h-5 w-5" strokeWidth={isActive ? 2.4 : 2} />
                  {label}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
