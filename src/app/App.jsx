import { Routes, Route } from "react-router-dom";
import { useAuthInit } from "@/hooks/useAuth";
import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute } from "@/routes/ProtectedRoute";

import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import GoalCenter from "@/pages/GoalCenter";
import MoneyCenter from "@/pages/MoneyCenter";
import DecisionCenter from "@/pages/DecisionCenter";
import HabitTracker from "@/pages/HabitTracker";
import RecoveryJournal from "@/pages/RecoveryJournal";
import AIMentor from "@/pages/AIMentor";
import Settings from "@/pages/Settings";
import More from "@/pages/More";
import NotFound from "@/pages/NotFound";

export default function App() {
  useAuthInit();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/goals" element={<GoalCenter />} />
          <Route path="/money" element={<MoneyCenter />} />
          <Route path="/decisions" element={<DecisionCenter />} />
          <Route path="/habits" element={<HabitTracker />} />
          <Route path="/journal" element={<RecoveryJournal />} />
          <Route path="/mentor" element={<AIMentor />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/more" element={<More />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
