import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Sparkles, MessageSquare, Plus, Trash2, Menu } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useAsync } from "@/hooks/useAsync";
import { getConversations, createConversation, deleteConversation, getMentorHistory, sendMentorMessage } from "@/services/mentorService";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

export default function AIMentor() {
  const { user } = useAuth();
  
  const conversations = useAsync(() => getConversations(user.id), [user.id]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const bottomRef = useRef(null);

  // Load messages when active conversation changes
  useEffect(() => {
    if (activeId) {
      getMentorHistory(activeId).then(setMessages).catch(console.error);
    } else {
      setMessages([]);
    }
  }, [activeId]);

  // Auto-select latest conversation on load if none selected
  useEffect(() => {
    if (conversations.data?.length > 0 && !activeId) {
      setActiveId(conversations.data[0].id);
    }
  }, [conversations.data, activeId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleNewChat() {
    try {
      const newConv = await createConversation(user.id, "Percakapan Baru");
      conversations.refetch();
      setActiveId(newConv.id);
      setShowSidebar(false);
    } catch (err) {
      console.error("Gagal membuat percakapan", err);
    }
  }

  async function handleDeleteChat(id, e) {
    e.stopPropagation();
    if (!window.confirm("Hapus percakapan ini?")) return;
    try {
      await deleteConversation(id);
      if (activeId === id) setActiveId(null);
      conversations.refetch();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleSend(e) {
    e.preventDefault();
    if (!input.trim() || sending) return;
    
    // If no active conversation, create one first based on the input
    let targetConvId = activeId;
    if (!targetConvId) {
      const title = input.trim().slice(0, 30) + (input.length > 30 ? "..." : "");
      const newConv = await createConversation(user.id, title);
      targetConvId = newConv.id;
      setActiveId(targetConvId);
      conversations.refetch();
    }

    const userMsg = { role: "user", content: input.trim() };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setSending(true);
    
    try {
      const reply = await Promise.race([
        sendMentorMessage(user.id, targetConvId, userMsg.content, messages),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout: AI tidak merespons (server lambat). Silakan coba lagi.")), 15000))
      ]);
      setMessages((m) => [...m, { role: "model", content: reply }]);
    } catch (err) {
      setMessages((m) => [...m, { role: "model", content: err.message || "Maaf, terjadi kesalahan." }]);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] md:h-[calc(100vh-4rem)] overflow-hidden bg-background rounded-2xl border border-border relative">
      
      {/* Mobile Overlay */}
      {showSidebar && (
        <div 
          className="absolute inset-0 bg-black/60 z-20 md:hidden backdrop-blur-sm"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* Sidebar for Desktop & Mobile */}
      <div className={cn(
        "w-72 md:w-64 border-r border-border flex flex-col bg-surface-elevated md:bg-surface-elevated/30 z-30 transition-transform duration-300 md:relative absolute inset-y-0 left-0",
        showSidebar ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="p-4 border-b border-border flex items-center justify-between">
          <Button onClick={handleNewChat} className="w-full justify-start gap-2" variant="outline">
            <Plus className="h-4 w-4" /> Percakapan Baru
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1 no-scrollbar">
          {conversations.loading ? (
            <p className="text-xs text-center text-foreground-muted mt-4">Memuat...</p>
          ) : conversations.data?.length ? (
            conversations.data.map((c) => (
              <div
                key={c.id}
                onClick={() => { setActiveId(c.id); setShowSidebar(false); }}
                className={cn(
                  "group flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-colors text-sm",
                  activeId === c.id ? "bg-sun/10 text-sun font-medium" : "hover:bg-surface-elevated text-foreground-muted hover:text-foreground"
                )}
              >
                <div className="flex items-center gap-2 truncate">
                  <MessageSquare className="h-4 w-4 shrink-0" />
                  <span className="truncate">{c.title}</span>
                </div>
                <button onClick={(e) => handleDeleteChat(c.id, e)} className="opacity-0 group-hover:opacity-100 p-1 hover:text-danger rounded-md transition-opacity">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))
          ) : (
            <p className="text-xs text-center text-foreground-muted mt-4">Belum ada percakapan</p>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center gap-3 p-4 border-b border-border bg-surface-elevated/10">
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden shrink-0 -ml-2" 
            onClick={() => setShowSidebar(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="h-9 w-9 rounded-xl bg-dawn/15 flex items-center justify-center shrink-0"><Sparkles className="h-4 w-4 text-dawn" /></div>
          <div className="truncate">
            <h1 className="font-display font-bold truncate">Surya Mentor</h1>
            <p className="text-xs text-foreground-muted truncate">Memahami goal, keuangan, dan habitmu</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
          {messages.length === 0 && !conversations.loading && (
            <div className="flex flex-col items-center justify-center h-full text-center text-foreground-muted space-y-3">
              <Sparkles className="h-8 w-8 text-dawn/50" />
              <p className="text-sm">Tanya apa saja — prioritas, keuangan, keputusan, atau evaluasi harianmu.</p>
            </div>
          )}
          
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
            >
              <div
                className={cn(
                  "max-w-[85%] md:max-w-[75%] rounded-2xl px-5 py-3 text-sm leading-relaxed",
                  m.role === "user" 
                    ? "bg-sun text-black rounded-tr-sm" 
                    : "bg-surface-elevated text-foreground border border-border rounded-tl-sm markdown-body"
                )}
              >
                {m.role === "user" ? (
                  m.content
                ) : (
                  <ReactMarkdown
                    components={{
                      ul: ({node, ...props}) => <ul className="list-disc pl-4 my-2 space-y-1" {...props} />,
                      ol: ({node, ...props}) => <ol className="list-decimal pl-4 my-2 space-y-1" {...props} />,
                      p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                      strong: ({node, ...props}) => <strong className="font-semibold text-sun" {...props} />,
                    }}
                  >
                    {m.content}
                  </ReactMarkdown>
                )}
              </div>
            </motion.div>
          ))}
          {sending && (
            <div className="flex justify-start">
              <div className="bg-surface-elevated border border-border rounded-2xl px-5 py-3 text-sm text-foreground-muted animate-pulse rounded-tl-sm">
                <span className="flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5" /> Mentor sedang berpikir...
                </span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="p-3 border-t border-border bg-background">
          <form onSubmit={handleSend} className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tulis pesan ke Mentor..."
              className="flex-1 h-12 rounded-xl border border-border bg-surface-elevated px-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sun/50"
            />
            <Button type="submit" size="icon" className="h-12 w-12 shrink-0 rounded-xl" disabled={sending}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
