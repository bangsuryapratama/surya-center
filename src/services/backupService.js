import { supabase } from "@/lib/supabaseClient";

const TABLES = [
  "priorities",
  "goals",
  "transactions",
  "wishlist_items",
  "habits",
  "habit_logs",
  "journal_entries",
  "decisions",
];

/** Exports every user-owned table into a single downloadable JSON backup. */
export async function exportBackup(userId) {
  const result = {};
  for (const table of TABLES) {
    const { data, error } = await supabase.from(table).select("*").eq("user_id", userId);
    if (error) throw error;
    result[table] = data;
  }
  return {
    exported_at: new Date().toISOString(),
    user_id: userId,
    version: 1,
    data: result,
  };
}

export function downloadBackupFile(backupJson) {
  const blob = new Blob([JSON.stringify(backupJson, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `surya-center-backup-${new Date().toISOString().split("T")[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Restores a backup file. Inserts rows back in with the CURRENT user's id
 * (so a backup can be restored into a different account) and ignores
 * conflicts on unique constraints (habit_logs, journal_entries).
 */
export async function restoreBackup(userId, backupJson) {
  for (const table of TABLES) {
    const rows = backupJson.data?.[table];
    if (!rows?.length) continue;
    const sanitized = rows.map(({ id, ...rest }) => ({ ...rest, user_id: userId }));
    const { error } = await supabase.from(table).insert(sanitized);
    if (error) console.error(`[Backup] Failed restoring ${table}:`, error.message);
  }
}
