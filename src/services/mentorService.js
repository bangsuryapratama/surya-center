import { supabase } from "@/lib/supabaseClient";
import { startMentorChat } from "@/lib/geminiClient";
import { buildUserContext, formatContextForPrompt } from "@/lib/contextBuilder";
import { AI_MENTOR_SYSTEM_PROMPT } from "@/constants/prompts";

export async function getConversations(userId) {
  const { data, error } = await supabase
    .from("mentor_conversations")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createConversation(userId, title) {
  const { data, error } = await supabase
    .from("mentor_conversations")
    .insert({ user_id: userId, title })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteConversation(id) {
  const { error } = await supabase.from("mentor_conversations").delete().eq("id", id);
  if (error) throw error;
}

export async function getMentorHistory(conversationId) {
  if (!conversationId) return [];
  const { data, error } = await supabase
    .from("mentor_messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

async function saveMessage(userId, conversationId, role, content) {
  const { error } = await supabase
    .from("mentor_messages")
    .insert({ user_id: userId, conversation_id: conversationId, role, content });
  if (error) throw error;
}

/**
 * Sends a message to the AI Mentor.
 */
export async function sendMentorMessage(userId, conversationId, userMessage, priorHistory = []) {
  const context = await buildUserContext(userId);
  const contextBlock = formatContextForPrompt(context);
  const systemPrompt = AI_MENTOR_SYSTEM_PROMPT(contextBlock);

  const geminiHistory = [
    { role: "user", parts: [{ text: systemPrompt }] },
    {
      role: "model",
      parts: [{ text: "Siap. Aku sudah paham konteks kamu, silakan cerita atau tanya apa saja." }],
    },
    ...priorHistory.map((m) => ({
      role: m.role,
      parts: [{ text: m.content }],
    })),
  ];

  const chat = startMentorChat(geminiHistory);
  const result = await chat.sendMessage(userMessage);
  const reply = result.response.text();

  await saveMessage(userId, conversationId, "user", userMessage);
  await saveMessage(userId, conversationId, "model", reply);

  return reply;
}
