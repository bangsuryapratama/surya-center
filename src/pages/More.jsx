import { NavLink } from "react-router-dom";
import { ListChecks, BookHeart, Settings as SettingsIcon, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";

const ITEMS = [
  { to: "/decisions", label: "Decision Center", icon: ListChecks },
  { to: "/habits", label: "Habit Tracker", icon: ListChecks },
  { to: "/journal", label: "Recovery Journal", icon: BookHeart },
  { to: "/settings", label: "Pengaturan", icon: SettingsIcon },
];

/** Mobile-only overflow menu (5th bottom-nav slot) for less-frequent destinations. */
export default function More() {
  return (
    <div className="space-y-3">
      <h1 className="font-display text-xl font-bold mb-2">Lainnya</h1>
      {ITEMS.map(({ to, label, icon: Icon }) => (
        <NavLink key={to} to={to}>
          <Card className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <Icon className="h-4 w-4 text-sun" />
              <span className="text-sm font-medium">{label}</span>
            </div>
            <ChevronRight className="h-4 w-4 text-foreground-subtle" />
          </Card>
        </NavLink>
      ))}
    </div>
  );
}
