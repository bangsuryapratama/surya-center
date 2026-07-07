import { useState } from "react";
import { motion } from "framer-motion";
import { ListChecks, Sparkles, X, Plus, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useAsync } from "@/hooks/useAsync";
import { getDecisions, analyzeAndSaveDecision, deleteDecision } from "@/services/decisionService";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ProgressRing } from "@/components/shared/ProgressRing";
import { EmptyState } from "@/components/shared/EmptyState";
import { SkeletonCard } from "@/components/shared/SkeletonCard";

const RECOMMENDATION_LABEL = { take: "Ambil", consider: "Pertimbangkan", postpone: "Tunda" };
const RECOMMENDATION_VARIANT = { take: "success", consider: "default", postpone: "danger" };

export default function DecisionCenter() {
  const { user } = useAuth();
  const decisions = useAsync(() => getDecisions(user.id), [user.id]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", cost: "", benefit: "", risk: "", goalImpact: "" });
  const [analyzing, setAnalyzing] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setAnalyzing(true);
    try {
      await analyzeAndSaveDecision(user.id, form);
      setShowForm(false);
      setForm({ title: "", cost: "", benefit: "", risk: "", goalImpact: "" });
      decisions.refetch();
    } finally {
      setAnalyzing(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Hapus keputusan ini?")) return;
    await deleteDecision(id);
    decisions.refetch();
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-bold">Decision Center</h1>
          <p className="text-xs text-foreground-muted">Biarkan AI membantu menimbang keputusanmu</p>
        </div>
        <Button size="sm" onClick={() => setShowForm((s) => !s)}>
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? "Batal" : "Keputusan Baru"}
        </Button>
      </div>

      {showForm && (
        <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} onSubmit={handleSubmit}>
          <Card className="space-y-3">
            <Input placeholder="Nama keputusan (mis. Resign kerja, Beli laptop baru)" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            <Input type="number" placeholder="Estimasi biaya (Rp)" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} />
            <Input placeholder="Manfaat yang diharapkan" value={form.benefit} onChange={(e) => setForm({ ...form, benefit: e.target.value })} />
            <Input placeholder="Risiko yang mungkin terjadi" value={form.risk} onChange={(e) => setForm({ ...form, risk: e.target.value })} />
            <Input placeholder="Dampak ke goal-mu (mis. mempercepat goal karir)" value={form.goalImpact} onChange={(e) => setForm({ ...form, goalImpact: e.target.value })} />
            <Button type="submit" className="w-full" disabled={analyzing}>
              {analyzing ? <><Sparkles className="h-4 w-4 animate-pulse" /> Menganalisis dengan AI...</> : "Analisis Keputusan"}
            </Button>
          </Card>
        </motion.form>
      )}

      {decisions.loading ? (
        <div className="space-y-3">{Array.from({ length: 2 }).map((_, i) => <SkeletonCard key={i} />)}</div>
      ) : decisions.data?.length ? (
        <div className="space-y-3">
          {decisions.data.map((d) => (
            <motion.div key={d.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <Card>
                <CardHeader className="flex flex-row items-start justify-between space-y-0">
                  <div>
                    <CardTitle>{d.title}</CardTitle>
                    <div className="mt-2">
                      <ProgressRing value={d.ai_score} size={48} strokeWidth={4} label={d.ai_score} />
                    </div>
                  </div>
                  <Button size="icon" variant="ghost" onClick={() => handleDelete(d.id)} className="h-8 w-8 text-foreground-muted hover:text-danger">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex gap-2">
                    <Badge variant={RECOMMENDATION_VARIANT[d.ai_recommendation]}>
                      {RECOMMENDATION_LABEL[d.ai_recommendation]}
                    </Badge>
                    <Badge variant="neutral">Prioritas: {d.ai_priority}</Badge>
                  </div>
                  <p className="text-xs"><span className="text-foreground-muted">Jangka pendek:</span> {d.ai_short_term}</p>
                  <p className="text-xs"><span className="text-foreground-muted">Jangka panjang:</span> {d.ai_long_term}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={ListChecks}
          title="Belum ada keputusan dianalisis"
          description="Masukkan keputusan yang sedang kamu pertimbangkan, biarkan AI membantu menilai skornya."
          actionLabel="Analisis Keputusan Pertama"
          onAction={() => setShowForm(true)}
        />
      )}
    </div>
  );
}
