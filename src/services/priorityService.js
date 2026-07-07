import { supabase } from "@/lib/supabaseClient";
import { todayISO } from "@/lib/utils";

export async function getTodayPriorities(userId, date = todayISO()) {
  const { data, error } = await supabase
    .from("priorities")
    .select("*")
    .eq("user_id", userId)
    .eq("priority_date", date)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function addPriority(userId, title, date = todayISO()) {
  const { data, error } = await supabase
    .from("priorities")
    .insert({ user_id: userId, title, priority_date: date })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function togglePriority(id, isDone) {
  const { data, error } = await supabase
    .from("priorities")
    .update({ is_done: isDone })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deletePriority(id) {
  const { error } = await supabase.from("priorities").delete().eq("id", id);
  if (error) throw error;
}
