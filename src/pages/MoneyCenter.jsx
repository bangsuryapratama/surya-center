import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Wallet, Sparkles, X, Trash2 } from "lucide-react";
import { BarChart, Bar, XAxis, ResponsiveContainer, Tooltip } from "recharts";
import { useAuth } from "@/hooks/useAuth";
import { useAsync } from "@/hooks/useAsync";
import { getTransactions, addTransaction, getMonthlySummary, deleteTransaction } from "@/services/moneyService";
import { getMoneyAnalysis } from "@/services/insightService";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/EmptyState";
import { SkeletonCard } from "@/components/shared/SkeletonCard";
import { formatCurrency } from "@/lib/utils";

const TYPES = [
  { value: "income", label: "Pemasukan" },
  { value: "expense", label: "Pengeluaran" },
  { value: "saving", label: "Tabungan" },
];

export default function MoneyCenter() {
  const { user } = useAuth();
  const transactions = useAsync(() => getTransactions(user.id), [user.id]);
  const summary = useAsync(() => getMonthlySummary(user.id), [user.id]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type: "expense", amount: "", category: "", note: "" });
  const [analysis, setAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    await addTransaction(user.id, { ...form, amount: Number(form.amount) });
    setShowForm(false);
    setForm({ type: "expense", amount: "", category: "", note: "" });
    transactions.refetch();
    summary.refetch();
  }

  async function handleDelete(id) {
    if (!window.confirm("Hapus transaksi ini?")) return;
    await deleteTransaction(id);
    transactions.refetch();
    summary.refetch();
  }

  async function handleAnalyze() {
    setAnalyzing(true);
    try {
      setAnalysis(await getMoneyAnalysis(user.id));
    } finally {
      setAnalyzing(false);
    }
  }

  const chartData = (summary.data ?? []).slice(-6).map((m) => ({
    month: new Date(m.month).toLocaleDateString("id-ID", { month: "short" }),
    Pemasukan: Number(m.total_income) || 0,
    Pengeluaran: Number(m.total_expense) || 0,
  }));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-xl font-bold">Money Center</h1>
        <Button size="sm" onClick={() => setShowForm((s) => !s)}>
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? "Batal" : "Transaksi"}
        </Button>
      </div>

      {showForm && (
        <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} onSubmit={handleSubmit}>
          <Card className="space-y-3">
            <select className="h-11 w-full rounded-xl border border-border bg-surface-elevated px-3 text-sm" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <Input type="number" placeholder="Jumlah (Rp)" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
            <Input placeholder="Kategori (mis. Makan, Gaji, Transport)" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required />
            <Input placeholder="Catatan (opsional)" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
            <Button type="submit" className="w-full">Simpan Transaksi</Button>
          </Card>
        </motion.form>
      )}

      {chartData.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Statistik Bulanan</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData}>
                <XAxis dataKey="month" stroke="#6B6E7D" fontSize={12} />
                <Tooltip
                  contentStyle={{ background: "#1E1F27", border: "1px solid #2A2B35", borderRadius: 12 }}
                  formatter={(v) => formatCurrency(v)}
                />
                <Bar dataKey="Pemasukan" fill="#34D399" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Pengeluaran" fill="#F26161" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <Card className="border-dawn/30 bg-dawn/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-dawn"><Sparkles className="h-4 w-4" /> Analisis AI</CardTitle>
        </CardHeader>
        <CardContent>
          {analysis ? (
            <div className="space-y-2 text-sm">
              <p><span className="text-foreground-muted">Observasi:</span> {analysis.observation}</p>
              <p><span className="text-foreground-muted">Risiko/Peluang:</span> {analysis.risk_or_opportunity}</p>
              <p><span className="text-foreground-muted">Rekomendasi:</span> {analysis.recommendation}</p>
            </div>
          ) : (
            <Button size="sm" variant="secondary" onClick={handleAnalyze} disabled={analyzing}>
              {analyzing ? "Menganalisis..." : "Analisis kondisi keuanganku"}
            </Button>
          )}
        </CardContent>
      </Card>

      <div>
        <h2 className="font-display font-semibold mb-2 text-sm text-foreground-muted">Transaksi Terbaru</h2>
        {transactions.loading ? (
          <SkeletonCard />
        ) : transactions.data?.length ? (
          <div className="space-y-2">
            {transactions.data.slice(0, 15).map((t) => (
              <Card key={t.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium">{t.category}</p>
                  <p className="text-xs text-foreground-muted">{t.transaction_date}</p>
                </div>
                <div className="text-right">
                  <p className={`font-mono text-sm ${t.type === "expense" ? "text-danger" : "text-success"}`}>
                    {t.type === "expense" ? "-" : "+"}{formatCurrency(t.amount)}
                  </p>
                  <Badge variant="neutral">{TYPES.find((x) => x.value === t.type)?.label}</Badge>
                </div>
                <Button size="icon" variant="ghost" onClick={() => handleDelete(t.id)} className="h-8 w-8 ml-3 text-foreground-muted hover:text-danger shrink-0">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState icon={Wallet} title="Belum ada transaksi" description="Catat pemasukan atau pengeluaran pertamamu." actionLabel="Tambah Transaksi" onAction={() => setShowForm(true)} />
        )}
      </div>
    </div>
  );
}
