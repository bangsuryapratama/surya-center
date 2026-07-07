import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Target, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useAsync } from "@/hooks/useAsync";
import { getGoals, createGoal, deleteGoal } from "@/services/goalService";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Trash2 } from "lucide-react";
import { ProgressRing } from "@/components/shared/ProgressRing";
import { EmptyState } from "@/components/shared/EmptyState";
import { SkeletonCard } from "@/components/shared/SkeletonCard";

const CATEGORIES = [
  { value: "finance", label: "Keuangan" },
  { value: "career", label: "Karir" },
  { value: "education", label: "Pendidikan" },
  { value: "health", label: "Kesehatan" },
  { value: "content_creator", label: "Konten Creator" },
  { value: "personal", label: "Pribadi" },
];
const PRIORITIES = ["low", "medium", "high", "critical"];

export default function GoalCenter() {
  const { user } = useAuth();
  const goals = useAsync(() => getGoals(user.id), [user.id]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", category: "personal", deadline: "", priority: "medium" });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    await createGoal(user.id, { ...form, status: "not_started", progress: 0 });
    setSaving(false);
    setShowForm(false);
    setForm({ title: "", description: "", category: "personal", deadline: "", priority: "medium" });
    goals.refetch();
  }

  async function handleDelete(id) {
    if (!window.confirm("Hapus goal ini?")) return;
    await deleteGoal(id);
    goals.refetch();
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-xl font-bold">Goal Center</h1>
        <Button size="sm" onClick={() => setShowForm((s) => !s)}>
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? "Batal" : "Goal Baru"}
        </Button>
      </div>

      {showForm && (
        <motion.form
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          onSubmit={handleSubmit}
          className="space-y-3"
        >
          <Card>
            <div className="space-y-3">
              <Input placeholder="Nama goal" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              <Input placeholder="Deskripsi singkat" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              <div className="grid grid-cols-2 gap-3">
                <select
                  className="h-11 rounded-xl border border-border bg-surface-elevated px-3 text-sm"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
                <select
                  className="h-11 rounded-xl border border-border bg-surface-elevated px-3 text-sm"
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value })}
                >
                  {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <Input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
              <Button type="submit" className="w-full" disabled={saving}>{saving ? "Menyimpan..." : "Simpan Goal"}</Button>
            </div>
          </Card>
        </motion.form>
      )}

      {goals.loading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}</div>
      ) : goals.data?.length ? (
        <div className="space-y-3">
          {goals.data.map((g) => (
            <motion.div key={g.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <Card>
                <div className="flex items-center gap-4">
                  <ProgressRing value={g.progress} size={56} strokeWidth={5} />
                  <CardContent className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="neutral">{CATEGORIES.find((c) => c.value === g.category)?.label}</Badge>
                      <Badge variant={g.priority === "critical" ? "danger" : g.priority === "high" ? "default" : "neutral"}>
                        {g.priority}
                      </Badge>
                    </div>
                    <p className="font-medium text-sm">{g.title}</p>
                    {g.deadline && <p className="text-xs text-foreground-muted mt-0.5">Deadline: {g.deadline}</p>}
                  </CardContent>
                  <Button size="icon" variant="ghost" onClick={() => handleDelete(g.id)} className="h-8 w-8 text-foreground-muted hover:text-danger">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Target}
          title="Belum ada goal"
          description="Mulai dari satu goal saja — keuangan, karir, kesehatan, atau apa pun yang penting untukmu."
          actionLabel="Buat Goal Pertama"
          onAction={() => setShowForm(true)}
        />
      )}
    </div>
  );
}
