import { supabase } from "@/lib/supabaseClient";
import { todayISO } from "@/lib/utils";

export async function getRecentJournalEntries(userId, days = 7) {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const { data, error } = await supabase
    .from("journal_entries")
    .select("*")
    .eq("user_id", userId)
    .gte("entry_date", since.toISOString().split("T")[0])
    .order("entry_date", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((d) => ({ date: d.entry_date, ...d }));
}

export async function upsertJournalEntry(userId, entry, date = todayISO()) {
  const { data, error } = await supabase
    .from("journal_entries")
    .upsert(
      { user_id: userId, entry_date: date, ...entry },
      { onConflict: "user_id,entry_date" }
    )
    .select()
    .single();
  if (error) throw error;
  return data;
}
