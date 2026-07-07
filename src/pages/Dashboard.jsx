import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Circle, Sparkles, Plus, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useAsync } from "@/hooks/useAsync";
import { getTodayPriorities, addPriority, togglePriority, deletePriority } from "@/services/priorityService";
import { getActiveGoals } from "@/services/goalService";
import { getFinancialSnapshot } from "@/services/moneyService";
import { getHabitSummary } from "@/services/habitService";
import { getDailyMotivation, getDashboardInsight } from "@/services/insightService";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProgressRing } from "@/components/shared/ProgressRing";
import { EmptyState } from "@/components/shared/EmptyState";
import { SkeletonCard } from "@/components/shared/SkeletonCard";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { formatCurrency } from "@/lib/utils";

const fadeUp = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
};

export default function Dashboard() {
  const { user } = useAuth();
  const [newPriority, setNewPriority] = useState("");

  const priorities = useAsync(() => getTodayPriorities(user.id), [user.id]);
  const goals = useAsync(() => getActiveGoals(user.id), [user.id]);
  const money = useAsync(() => getFinancialSnapshot(user.id), [user.id]);
  const habits = useAsync(() => getHabitSummary(user.id), [user.id]);
  const motivation = useAsync(() => getDailyMotivation(user.id), [user.id]);
  const insight = useAsync(() => getDashboardInsight(user.id), [user.id]);

  const greeting = new Date().getHours() < 11 ? "Selamat pagi" : new Date().getHours() < 18 ? "Selamat siang" : "Selamat malam";

  async function handleAddPriority(e) {
    e.preventDefault();
    if (!newPriority.trim()) return;
    await addPriority(user.id, newPriority.trim());
    setNewPriority("");
    priorities.refetch();
  }

  async function handleDeletePriority(id) {
    await deletePriority(id);
    priorities.refetch();
  }

  return (
    <div className="space-y-5 animate-fade-up">
      <motion.div {...fadeUp}>
        <p className="text-sm text-foreground-muted">{greeting},</p>
        <h1 className="font-display text-2xl font-bold">
          {user?.user_metadata?.full_name?.split(" ")[0] ?? "Kamu"} ☀️
        </h1>
      </motion.div>

      {/* Daily motivation */}
      <ErrorBoundary>
        <motion.div {...fadeUp} transition={{ delay: 0.05 }}>
          <Card className="bg-gradient-to-br from-sun/10 to-transparent border-sun/20">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-sun shrink-0 mt-0.5" />
              {motivation.loading ? (
                <div className="h-4 w-full bg-surface-elevated rounded animate-pulse" />
              ) : (
                <p className="text-sm text-foreground leading-relaxed">{motivation.data}</p>
              )}
            </div>
          </Card>
        </motion.div>
      </ErrorBoundary>

      {/* Today's priorities */}
      <ErrorBoundary>
        <motion.div {...fadeUp} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader>
              <CardTitle>Prioritas Hari Ini</CardTitle>
            </CardHeader>
            <CardContent>
              {priorities.loading ? (
                <SkeletonCard lines={2} className="border-0 p-0" />
              ) : priorities.data?.length ? (
                <ul className="space-y-2 mb-3">
                  {priorities.data.map((p) => (
                    <li key={p.id} className="flex items-center gap-2 group">
                      <button onClick={() => togglePriority(p.id, !p.is_done).then(priorities.refetch)}>
                        {p.is_done ? (
                          <CheckCircle2 className="h-5 w-5 text-success" />
                        ) : (
                          <Circle className="h-5 w-5 text-foreground-subtle" />
                        )}
                      </button>
                      <span className={p.is_done ? "line-through text-foreground-subtle text-sm flex-1" : "text-sm flex-1"}>
                        {p.title}
                      </span>
                      <button onClick={() => handleDeletePriority(p.id)} className="text-foreground-muted hover:text-danger p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-foreground-muted mb-3">Belum ada prioritas hari ini.</p>
              )}
              <form onSubmit={handleAddPriority} className="flex gap-2">
                <Input
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value)}
                  placeholder="Tambah prioritas..."
                  className="h-9 text-sm"
                />
                <Button type="submit" size="icon" variant="secondary" className="h-9 w-9 shrink-0">
                  <Plus className="h-4 w-4" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </ErrorBoundary>

      {/* Financial summary + habits side by side on wider screens */}
      <div className="grid grid-cols-2 gap-4">
        <ErrorBoundary>
          <motion.div {...fadeUp} transition={{ delay: 0.15 }}>
            <Card>
              <CardHeader><CardTitle className="text-sm">Keuangan</CardTitle></CardHeader>
              <CardContent>
                {money.loading ? (
                  <SkeletonCard lines={2} className="border-0 p-0" />
                ) : (
                  <>
                    <p className="text-xs text-foreground-muted">Pemasukan bulan ini</p>
                    <p className="font-display font-semibold text-success">
                      {formatCurrency(money.data?.totalIncome)}
                    </p>
                    <p className="text-xs text-foreground-muted mt-2">Pengeluaran</p>
                    <p className="font-display font-semibold text-danger">
                      {formatCurrency(money.data?.totalExpense)}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </ErrorBoundary>

        <ErrorBoundary>
          <motion.div {...fadeUp} transition={{ delay: 0.2 }}>
            <Card>
              <CardHeader><CardTitle className="text-sm">Habit</CardTitle></CardHeader>
              <CardContent>
                {habits.loading ? (
                  <SkeletonCard lines={2} className="border-0 p-0" />
                ) : habits.data?.length ? (
                  <div className="space-y-2">
                    {habits.data.slice(0, 2).map((h) => (
                      <div key={h.id} className="flex items-center justify-between">
                        <span className="text-xs">{h.name}</span>
                        <span className="text-xs font-mono text-sun">{h.streak}🔥</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-foreground-muted">Belum ada habit.</p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </ErrorBoundary>
      </div>

      {/* Goal progress rings */}
      <ErrorBoundary>
        <motion.div {...fadeUp} transition={{ delay: 0.25 }}>
          <Card>
            <CardHeader><CardTitle>Progress Goal</CardTitle></CardHeader>
            <CardContent>
              {goals.loading ? (
                <SkeletonCard lines={1} className="border-0 p-0" />
              ) : goals.data?.length ? (
                <div className="flex gap-5 overflow-x-auto no-scrollbar pb-1">
                  {goals.data.slice(0, 5).map((g) => (
                    <ProgressRing key={g.id} value={g.progress} size={72} label={`${g.progress}%`} sublabel={g.title.slice(0, 12)} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={Sparkles}
                  title="Belum ada goal aktif"
                  description="Buat goal pertamamu untuk mulai melacak progress hidupmu."
                  actionLabel="Buat Goal"
                  onAction={() => (window.location.href = "/goals")}
                />
              )}
            </CardContent>
          </Card>
        </motion.div>
      </ErrorBoundary>

      {/* AI Insight */}
      <ErrorBoundary>
        <motion.div {...fadeUp} transition={{ delay: 0.3 }}>
          <Card className="border-dawn/30 bg-dawn/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-dawn">
                <Sparkles className="h-4 w-4" /> Insight AI
              </CardTitle>
            </CardHeader>
            <CardContent>
              {insight.loading ? (
                <div className="h-4 w-full bg-surface-elevated rounded animate-pulse" />
              ) : (
                <p className="text-sm text-foreground leading-relaxed">{insight.data}</p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </ErrorBoundary>
    </div>
  );
}
