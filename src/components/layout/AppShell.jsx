import { Outlet } from "react-router-dom";
import { BottomNav } from "./BottomNav";
import { SideNav } from "./SideNav";
import { OfflineBanner } from "./OfflineBanner";
import { InstallPrompt } from "@/components/shared/InstallPrompt";

/** Top-level authenticated layout: sidebar (desktop) + bottom nav (mobile). */
export function AppShell() {
  return (
    <div className="min-h-screen bg-base md:flex">
      <SideNav />
      <div className="flex-1 min-w-0">
        <OfflineBanner />
        <main className="mx-auto max-w-2xl px-4 pt-6 pb-28 md:max-w-4xl md:pb-10">
          <Outlet />
        </main>
      </div>
      <BottomNav />
      <InstallPrompt />
    </div>
  );
}
