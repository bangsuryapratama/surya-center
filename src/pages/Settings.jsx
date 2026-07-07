import { useState } from "react";
import { Download, Upload, LogOut, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { exportBackup, downloadBackupFile, restoreBackup } from "@/services/backupService";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Settings() {
  const { user, signOut } = useAuth();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);

  async function handleExport() {
    setBusy(true);
    try {
      const backup = await exportBackup(user.id);
      downloadBackupFile(backup);
      setMessage("Backup berhasil diunduh.");
    } finally {
      setBusy(false);
    }
  }

  async function handleImport(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const json = JSON.parse(await file.text());
      await restoreBackup(user.id, json);
      setMessage("Data berhasil dipulihkan. Muat ulang halaman untuk melihat perubahan.");
    } catch (err) {
      setMessage("Gagal memulihkan backup: file tidak valid.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      <h1 className="font-display text-xl font-bold">Pengaturan</h1>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><User className="h-4 w-4" /> Akun</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-foreground-muted">{user?.email}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Backup & Restore</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Button variant="secondary" className="w-full" onClick={handleExport} disabled={busy}>
            <Download className="h-4 w-4" /> Ekspor Data (JSON)
          </Button>
          <label className="w-full">
            <input type="file" accept="application/json" className="hidden" onChange={handleImport} disabled={busy} />
            <span className="inline-flex w-full items-center justify-center gap-2 h-11 rounded-xl border border-border bg-surface-elevated text-sm font-medium cursor-pointer hover:bg-surface-elevated/80">
              <Upload className="h-4 w-4" /> Impor Backup
            </span>
          </label>
          {message && <p className="text-xs text-foreground-muted">{message}</p>}
        </CardContent>
      </Card>

      <Button variant="destructive" className="w-full" onClick={signOut}>
        <LogOut className="h-4 w-4" /> Keluar
      </Button>
    </div>
  );
}
