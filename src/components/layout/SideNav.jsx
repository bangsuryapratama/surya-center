import { NavLink } from "react-router-dom";
import { LayoutDashboard, Target, Wallet, Sparkles, ListChecks, BookHeart, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { to: "/", label: "Beranda", icon: LayoutDashboard },
  { to: "/goals", label: "Goal Center", icon: Target },
  { to: "/money", label: "Money Center", icon: Wallet },
  { to: "/decisions", label: "Decision Center", icon: ListChecks },
  { to: "/habits", label: "Habit Tracker", icon: ListChecks },
  { to: "/journal", label: "Recovery Journal", icon: BookHeart },
  { to: "/mentor", label: "AI Mentor", icon: Sparkles },
  { to: "/settings", label: "Pengaturan", icon: Settings },
];

/** Desktop/tablet sidebar — replaces the bottom nav on wider viewports. */
export function SideNav() {
  return (
    <aside className="hidden md:flex md:w-60 md:flex-col md:border-r md:border-border md:bg-surface md:min-h-screen md:py-6 md:px-4">
      <div className="px-2 mb-8">
        <span className="font-display text-lg font-bold text-foreground">Surya Center</span>
      </div>
      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                isActive ? "bg-sun/10 text-sun" : "text-foreground-muted hover:bg-surface-elevated hover:text-foreground"
              )
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
