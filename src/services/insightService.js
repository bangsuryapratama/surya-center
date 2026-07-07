import { supabase } from "@/lib/supabaseClient";
import { generateContent, generateJSON } from "@/lib/geminiClient";
import { buildUserContext, formatContextForPrompt } from "@/lib/contextBuilder";
import {
  DAILY_MOTIVATION_PROMPT,
  DASHBOARD_INSIGHT_PROMPT,
  MONEY_ANALYSIS_PROMPT,
  JOURNAL_PATTERN_PROMPT,
} from "@/constants/prompts";
import { todayISO } from "@/lib/utils";

/**
 * Insights are cached in `ai_insights` per (user, type, day) so refreshing
 * the dashboard doesn't burn a Gemini call every time — only the first
 * load of the day generates fresh content.
 */
async function getCached(userId, type, date = todayISO()) {
  const { data } = await supabase
    .from("ai_insights")
    .select("content")
    .eq("user_id", userId)
    .eq("type", type)
    .eq("valid_for_date", date)
    .maybeSingle();
  return data?.content ?? null;
}

async function setCached(userId, type, content, date = todayISO()) {
  await supabase
    .from("ai_insights")
    .upsert(
      { user_id: userId, type, content, valid_for_date: date },
      { onConflict: "user_id,type,valid_for_date" }
    );
}

export async function getDailyMotivation(userId) {
  const cached = await getCached(userId, "daily_motivation");
  if (cached) return cached;

  const context = await buildUserContext(userId, { scope: ["goals", "habits"] });
  const text = await generateContent(DAILY_MOTIVATION_PROMPT(formatContextForPrompt(context)));
  await setCached(userId, "daily_motivation", text.trim());
  return text.trim();
}

export async function getDashboardInsight(userId) {
  const cached = await getCached(userId, "ai_insight");
  if (cached) return cached;

  const context = await buildUserContext(userId);
  const text = await generateContent(DASHBOARD_INSIGHT_PROMPT(formatContextForPrompt(context)));
  await setCached(userId, "ai_insight", text.trim());
  return text.trim();
}

export async function getMoneyAnalysis(userId) {
  const context = await buildUserContext(userId, { scope: ["money", "goals"] });
  return generateJSON(MONEY_ANALYSIS_PROMPT(formatContextForPrompt(context)));
}

export async function getJournalPatternInsight(userId) {
  const context = await buildUserContext(userId, { scope: ["journal"] });
  return generateJSON(JOURNAL_PATTERN_PROMPT(formatContextForPrompt(context)));
}
