import { supabase } from "@/lib/supabaseClient";
import { generateJSON } from "@/lib/geminiClient";
import { buildUserContext, formatContextForPrompt } from "@/lib/contextBuilder";
import { DECISION_ANALYSIS_PROMPT } from "@/constants/prompts";

export async function getDecisions(userId) {
  const { data, error } = await supabase
    .from("decisions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

/**
 * Core Decision Center flow:
 * 1. Build full personal context (goals, money, habits, journal).
 * 2. Ask Gemini to score the decision against that context.
 * 3. Persist the decision + AI verdict together so history is auditable.
 */
export async function analyzeAndSaveDecision(userId, input) {
  const context = await buildUserContext(userId, {
    scope: ["goals", "money", "journal"],
  });
  const contextBlock = formatContextForPrompt(context);

  const prompt = DECISION_ANALYSIS_PROMPT({ ...input, contextBlock });
  const result = await generateJSON(prompt);

  const { data, error } = await supabase
    .from("decisions")
    .insert({
      user_id: userId,
      title: input.title,
      cost: input.cost,
      benefit: input.benefit,
      risk: input.risk,
      goal_impact: input.goalImpact,
      ai_score: result.score,
      ai_priority: result.priority_level,
      ai_short_term: result.short_term_impact,
      ai_long_term: result.long_term_impact,
      ai_recommendation: result.recommendation,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteDecision(id) {
  const { error } = await supabase.from("decisions").delete().eq("id", id);
  if (error) throw error;
}
