import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, ListChecks, Flame, Trash2, Calendar as CalIcon } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useAsync } from "@/hooks/useAsync";
import { getHabits, createHabit, toggleHabitToday, deleteHabit } from "@/services/habitService";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/shared/EmptyState";
import { SkeletonCard } from "@/components/shared/SkeletonCard";
import { todayISO } from "@/lib/utils";
import { cn } from "@/lib/utils";

export default function HabitTracker() {
  const { user } = useAuth();
  const habits = useAsync(() => getHabits(user.id), [user.id]);
  const [newHabit, setNewHabit] = useState("");

  async function handleAdd(e) {
    e.preventDefault();
    if (!newHabit.trim()) return;
    await createHabit(user.id, newHabit.trim());
    setNewHabit("");
    habits.refetch();
  }

  async function handleDelete(id) {
    if (!window.confirm("Hapus habit ini berserta seluruh historinya?")) return;
    await deleteHabit(id);
    habits.refetch();
  }

  function isDoneToday(habit) {
    return habit.habit_logs?.some((l) => l.log_date === todayISO() && l.is_done);
  }

  // Generate GitHub-style calendar data (last 28 days)
  function getCalendarDays(habitLogs) {
    const days = [];
    for (let i = 27; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const isDone = habitLogs?.some((l) => l.log_date === dateStr && l.is_done);
      days.push({ date: dateStr, isDone });
    }
    return days;
  }

  return (
    <div className="space-y-5 animate-fade-up">
      <div className="flex items-center gap-2 mb-2">
        <h1 className="font-display text-xl font-bold">Habit Tracker</h1>
        <Flame className="h-5 w-5 text-sun" />
      </div>

      <form onSubmit={handleAdd} className="flex gap-2">
        <Input 
          value={newHabit} 
          onChange={(e) => setNewHabit(e.target.value)} 
          placeholder="Habit baru (mis. Olahraga, Baca 20 menit)" 
        />
        <Button type="submit" size="icon" className="shrink-0"><Plus className="h-4 w-4" /></Button>
      </form>

      {habits.loading ? (
        <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} lines={3} />)}</div>
      ) : habits.data?.length ? (
        <div className="space-y-4">
          {habits.data.map((h) => {
            const done = isDoneToday(h);
            const calendar = getCalendarDays(h.habit_logs);
            
            return (
              <motion.div key={h.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="p-4 group">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="font-medium">{h.name}</p>
                      <p className="text-xs text-foreground-muted flex items-center gap-1 mt-1">
                        <CalIcon className="h-3 w-3" /> target {h.target_per_week}x/minggu
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant={done ? "default" : "secondary"}
                        onClick={() => toggleHabitToday(h.id, user.id, !done).then(habits.refetch)}
                        className={cn(done && "bg-sun text-black hover:bg-sun/90")}
                      >
                        {done ? "Selesai ✓" : "Tandai hari ini"}
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={() => handleDelete(h.id)} 
                        className="h-8 w-8 text-foreground-muted hover:text-danger opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* GitHub-style Contribution Graph */}
                  <div className="mt-2 pt-3 border-t border-border/50">
                    <p className="text-[10px] text-foreground-subtle mb-2">Aktivitas 28 Hari Terakhir</p>
                    <div className="grid grid-flow-col grid-rows-4 gap-1.5 overflow-x-auto pb-1 no-scrollbar justify-start">
                      {calendar.map((day, i) => (
                        <div 
                          key={i} 
                          title={`${day.date}: ${day.isDone ? 'Selesai' : 'Kosong'}`}
                          className={cn(
                            "w-3.5 h-3.5 rounded-[3px] transition-colors",
                            day.isDone 
                              ? "bg-sun shadow-[0_0_8px_rgba(255,204,0,0.3)]" 
                              : "bg-surface-elevated border border-border/50"
                          )}
                        />
                      ))}
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <EmptyState 
          icon={ListChecks} 
          title="Belum ada habit" 
          description="Tambahkan satu kebiasaan kecil yang ingin kamu bangun konsisten." 
        />
      )}
    </div>
  );
}
