import { supabase } from "@/lib/supabaseClient";

const TABLE = "goals";

export async function getGoals(userId, { category, status } = {}) {
  let query = supabase.from(TABLE).select("*").eq("user_id", userId);
  if (category) query = query.eq("category", category);
  if (status) query = query.eq("status", status);
  const { data, error } = await query.order("priority", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

/** Active = not completed/cancelled — used by the Context Builder for AI prompts. */
export async function getActiveGoals(userId) {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("user_id", userId)
    .in("status", ["not_started", "in_progress", "on_hold"])
    .order("priority", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createGoal(userId, goal) {
  const { data, error } = await supabase
    .from(TABLE)
    .insert({ user_id: userId, ...goal })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateGoal(id, patch) {
  const { data, error } = await supabase
    .from(TABLE)
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteGoal(id) {
  const { error } = await supabase.from(TABLE).delete().eq("id", id);
  if (error) throw error;
}
