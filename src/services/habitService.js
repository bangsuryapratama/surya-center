import { supabase } from "@/lib/supabaseClient";
import { todayISO } from "@/lib/utils";

export async function getHabits(userId) {
  const { data, error } = await supabase
    .from("habits")
    .select("*, habit_logs(log_date, is_done)")
    .eq("user_id", userId)
    .eq("archived", false)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function createHabit(userId, name, targetPerWeek = 7) {
  const { data, error } = await supabase
    .from("habits")
    .insert({ user_id: userId, name, target_per_week: targetPerWeek })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function toggleHabitToday(habitId, userId, isDone, date = todayISO()) {
  const { data, error } = await supabase
    .from("habit_logs")
    .upsert(
      { habit_id: habitId, user_id: userId, log_date: date, is_done: isDone },
      { onConflict: "habit_id,log_date" }
    )
    .select()
    .single();
  if (error) throw error;
  return data;
}

/** Computes streak + weekly completion — used on Dashboard and Habit Tracker. */
export async function getHabitSummary(userId) {
  const habits = await getHabits(userId);
  return habits.map((h) => {
    const logs = (h.habit_logs ?? [])
      .filter((l) => l.is_done)
      .sort((a, b) => new Date(b.log_date) - new Date(a.log_date));

    let streak = 0;
    let cursor = new Date();
    for (const log of logs) {
      const logDate = new Date(log.log_date);
      const diffDays = Math.round((cursor - logDate) / 86400000);
      if (diffDays <= 1) {
        streak++;
        cursor = logDate;
      } else break;
    }

    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const completedThisWeek = logs.filter(
      (l) => new Date(l.log_date) >= startOfWeek
    ).length;

    return {
      id: h.id,
      name: h.name,
      targetPerWeek: h.target_per_week,
      streak,
      completedThisWeek,
    };
  });
}

export async function deleteHabit(habitId) {
  const { error } = await supabase.from("habits").delete().eq("id", habitId);
  if (error) throw error;
}
