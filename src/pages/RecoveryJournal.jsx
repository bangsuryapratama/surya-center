import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, BookHeart } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useAsync } from "@/hooks/useAsync";
import { upsertJournalEntry, getRecentJournalEntries } from "@/services/journalService";
import { getJournalPatternInsight } from "@/services/insightService";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";

function SliderField({ label, value, onChange }) {
  return (
    <div>
      <div className="flex justify-between text-xs text-foreground-muted mb-1">
        <span>{label}</span><span>{value}/10</span>
      </div>
      <input type="range" min="1" max="10" value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-sun" />
    </div>
  );
}

export default function RecoveryJournal() {
  const { user } = useAuth();
  const entries = useAsync(() => getRecentJournalEntries(user.id, 14), [user.id]);
  const [form, setForm] = useState({ mood: 5, energy: 5, productivity: 5, note: "" });
  const [saved, setSaved] = useState(false);
  const [pattern, setPattern] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  async function handleSave() {
    await upsertJournalEntry(user.id, form);
    setSaved(true);
    entries.refetch();
  }

  async function handleAnalyze() {
    setAnalyzing(true);
    try {
      setPattern(await getJournalPatternInsight(user.id));
    } finally {
      setAnalyzing(false);
    }
  }

  return (
    <div className="space-y-5">
      <h1 className="font-display text-xl font-bold">Recovery Journal</h1>

      <Card className="space-y-4">
        <SliderField label="Mood" value={form.mood} onChange={(v) => setForm({ ...form, mood: v })} />
        <SliderField label="Energi" value={form.energy} onChange={(v) => setForm({ ...form, energy: v })} />
        <SliderField label="Produktivitas" value={form.productivity} onChange={(v) => setForm({ ...form, productivity: v })} />
        <textarea
          className="w-full rounded-xl border border-border bg-surface-elevated px-4 py-3 text-sm min-h-20"
          placeholder="Catatan hari ini (opsional)"
          value={form.note}
          onChange={(e) => setForm({ ...form, note: e.target.value })}
        />
        <Button className="w-full" onClick={handleSave}>{saved ? "Tersimpan ✓" : "Simpan Jurnal Hari Ini"}</Button>
      </Card>

      <Card className="border-dawn/30 bg-dawn/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-dawn"><Sparkles className="h-4 w-4" /> Pola Mingguan</CardTitle>
        </CardHeader>
        <CardContent>
          {pattern ? (
            <div className="space-y-2 text-sm">
              <p><span className="text-foreground-muted">Pola:</span> {pattern.pattern}</p>
              <p><span className="text-foreground-muted">Saran:</span> {pattern.suggestion}</p>
            </div>
          ) : (
            <Button size="sm" variant="secondary" onClick={handleAnalyze} disabled={analyzing}>
              {analyzing ? "Menganalisis..." : "Analisis pola mingguanku"}
            </Button>
          )}
        </CardContent>
      </Card>

      {!entries.loading && !entries.data?.length && (
        <EmptyState icon={BookHeart} title="Belum ada catatan" description="Isi jurnal harianmu untuk mulai melihat pola." />
      )}
    </div>
  );
}
