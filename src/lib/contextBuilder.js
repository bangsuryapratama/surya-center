import { getActiveGoals } from "@/services/goalService";
import { getFinancialSnapshot } from "@/services/moneyService";
import { getHabitSummary } from "@/services/habitService";
import { getRecentJournalEntries } from "@/services/journalService";
import { getTodayPriorities } from "@/services/priorityService";

/**
 * CONTEXT BUILDER
 * ----------------
 * The single place that assembles "who this person is right now" before any
 * prompt goes to Gemini. Every AI feature (AI Mentor, Decision Center,
 * Money analysis, Journal insight, daily motivation) must build its prompt
 * on top of this object instead of querying Supabase ad-hoc — this keeps the
 * AI's picture of the user consistent across features and makes it a single
 * spot to redact sensitive fields or trim context size later.
 *
 * @param {string} userId
 * @param {{ scope?: ('goals'|'money'|'habits'|'journal'|'priorities')[] }} [options]
 *   Optionally restrict which slices to fetch, since not every feature needs
 *   the full picture (e.g. Habit insight doesn't need financial data).
 * @returns {Promise<UserContext>}
 */
export async function buildUserContext(userId, options = {}) {
  const scope = options.scope ?? [
    "goals",
    "money",
    "habits",
    "journal",
    "priorities",
  ];

  const [goals, money, habits, journal, priorities] = await Promise.all([
    scope.includes("goals") ? getActiveGoals(userId) : Promise.resolve([]),
    scope.includes("money")
      ? getFinancialSnapshot(userId)
      : Promise.resolve(null),
    scope.includes("habits") ? getHabitSummary(userId) : Promise.resolve([]),
    scope.includes("journal")
      ? getRecentJournalEntries(userId, 7)
      : Promise.resolve([]),
    scope.includes("priorities")
      ? getTodayPriorities(userId)
      : Promise.resolve([]),
  ]);

  return { goals, money, habits, journal, priorities };
}

/**
 * Converts the structured context into a compact, human-readable text block
 * suitable for embedding directly into a Gemini prompt. Keeping this as
 * plain-language bullet points (rather than raw JSON) produces noticeably
 * better reasoning quality from the model than dumping raw rows.
 * @param {UserContext} ctx
 */
export function formatContextForPrompt(ctx) {
  const lines = [];

  if (ctx.goals?.length) {
    lines.push("GOAL AKTIF:");
    ctx.goals.forEach((g) => {
      lines.push(
        `- [${g.category}] "${g.title}" — progress ${g.progress}%, prioritas ${g.priority}, deadline ${g.deadline ?? "tidak ditentukan"}, status ${g.status}`
      );
    });
  } else {
    lines.push("GOAL AKTIF: belum ada goal aktif.");
  }

  if (ctx.money) {
    lines.push("\nKONDISI KEUANGAN (bulan berjalan):");
    lines.push(
      `- Pemasukan: Rp${ctx.money.totalIncome?.toLocaleString("id-ID")}`
    );
    lines.push(
      `- Pengeluaran: Rp${ctx.money.totalExpense?.toLocaleString("id-ID")}`
    );
    lines.push(
      `- Tabungan terkumpul: Rp${ctx.money.totalSavings?.toLocaleString("id-ID")}`
    );
    lines.push(
      `- Kategori pengeluaran terbesar: ${ctx.money.topExpenseCategory ?? "-"}`
    );
  }

  if (ctx.habits?.length) {
    lines.push("\nHABIT:");
    ctx.habits.forEach((h) => {
      lines.push(
        `- "${h.name}": streak ${h.streak} hari, minggu ini selesai ${h.completedThisWeek}/${h.targetPerWeek}x`
      );
    });
  }

  if (ctx.journal?.length) {
    lines.push("\nJURNAL 7 HARI TERAKHIR:");
    ctx.journal.forEach((j) => {
      lines.push(
        `- ${j.date}: mood ${j.mood}/10, energi ${j.energy}/10, produktivitas ${j.productivity}/10${j.note ? ` — "${j.note}"` : ""}`
      );
    });
  }

  if (ctx.priorities?.length) {
    lines.push("\nPRIORITAS HARI INI:");
    ctx.priorities.forEach((p) => {
      lines.push(`- ${p.title} (${p.is_done ? "selesai" : "belum selesai"})`);
    });
  }

  return lines.join("\n");
}

/**
 * @typedef {Object} UserContext
 * @property {Array} goals
 * @property {Object|null} money
 * @property {Array} habits
 * @property {Array} journal
 * @property {Array} priorities
 */
