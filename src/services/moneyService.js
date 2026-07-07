import { supabase } from "@/lib/supabaseClient";

export async function getTransactions(userId, { month, type } = {}) {
  let query = supabase
    .from("transactions")
    .select("*")
    .eq("user_id", userId)
    .order("transaction_date", { ascending: false });
  if (month) {
    const start = `${month}-01`;
    const end = new Date(new Date(start).getFullYear(), new Date(start).getMonth() + 1, 0)
      .toISOString()
      .split("T")[0];
    query = query.gte("transaction_date", start).lte("transaction_date", end);
  }
  if (type) query = query.eq("type", type);
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function addTransaction(userId, tx) {
  const { data, error } = await supabase
    .from("transactions")
    .insert({ user_id: userId, ...tx })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteTransaction(id) {
  const { error } = await supabase.from("transactions").delete().eq("id", id);
  if (error) throw error;
}

export async function getWishlist(userId) {
  const { data, error } = await supabase
    .from("wishlist_items")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function addWishlistItem(userId, item) {
  const { data, error } = await supabase
    .from("wishlist_items")
    .insert({ user_id: userId, ...item })
    .select()
    .single();
  if (error) throw error;
  return data;
}

/** Monthly summary view — powers the Money Center charts. */
export async function getMonthlySummary(userId) {
  const { data, error } = await supabase
    .from("v_monthly_money_summary")
    .select("*")
    .eq("user_id", userId)
    .order("month", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

/**
 * Compact snapshot used by the Context Builder for AI prompts (income,
 * expense, savings totals for the current month + top expense category).
 */
export async function getFinancialSnapshot(userId) {
  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const txs = await getTransactions(userId, { month });

  const totalIncome = txs.filter((t) => t.type === "income").reduce((s, t) => s + Number(t.amount), 0);
  const totalExpense = txs.filter((t) => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0);
  const totalSavings = txs.filter((t) => t.type === "saving").reduce((s, t) => s + Number(t.amount), 0);

  const byCategory = {};
  txs.filter((t) => t.type === "expense").forEach((t) => {
    byCategory[t.category] = (byCategory[t.category] || 0) + Number(t.amount);
  });
  const topExpenseCategory =
    Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  return { totalIncome, totalExpense, totalSavings, topExpenseCategory };
}
