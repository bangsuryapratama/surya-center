# Daftar Halaman & Fitur — Surya Center

| Route | Halaman | Fitur Utama |
|---|---|---|
| `/login` | Login/Register | Supabase Auth email+password, auto-create profile via trigger |
| `/` | Dashboard | Prioritas hari ini (CRUD), ringkasan keuangan, progress goal (ring), habit hari ini, insight AI, motivasi harian |
| `/goals` | Goal Center | CRUD goal 6 kategori (keuangan/karir/pendidikan/kesehatan/konten creator/pribadi), progress ring, prioritas, status |
| `/money` | Money Center | Pemasukan/pengeluaran/tabungan, kategori, grafik bulanan (Recharts), analisis AI otomatis |
| `/decisions` | Decision Center | Input keputusan (biaya/manfaat/risiko/dampak goal) → skor AI 0-100, prioritas, dampak jangka pendek/panjang, rekomendasi Ambil/Pertimbangkan/Tunda |
| `/habits` | Habit Tracker | Checklist harian, streak, progress mingguan |
| `/journal` | Recovery Journal | Mood/energi/produktivitas (slider), catatan, analisis pola mingguan AI |
| `/mentor` | AI Mentor | Chat multi-turn, context-aware (goal+keuangan+habit+jurnal+prioritas), riwayat tersimpan |
| `/settings` | Pengaturan | Profil, backup (export JSON), restore, sign out |
| `/more` | Menu Lainnya (mobile) | Akses ke Decision/Habit/Journal/Settings dari slot ke-5 bottom nav |

## Fitur Lintas Halaman

- **PWA**: manifest + service worker (`vite-plugin-pwa`), install prompt custom
  (Android native prompt, iOS manual instructions), offline banner, runtime
  caching (NetworkFirst untuk Supabase, CacheFirst untuk gambar).
- **Empty State**: setiap list kosong (goals/transaksi/habit/keputusan) punya
  ilustrasi + CTA spesifik, bukan sekadar "tidak ada data".
- **Loading Skeleton**: `SkeletonCard` dipakai di semua data-fetching card
  agar transisi loading terasa halus, bukan blank/spinner generik.
- **Error Handling**: `ErrorBoundary` per-card di Dashboard, try/catch di
  setiap service call dengan pesan error dalam Bahasa Indonesia.
- **Dark Mode Default**: `class="dark"` di `<html>`, seluruh token warna
  didesain dark-first (tidak ada light mode di v1 — bisa ditambahkan dengan
  Tailwind `dark:` variant terbalik bila dibutuhkan).
- **Backup & Restore**: ekspor seluruh tabel milik user jadi satu file JSON,
  import kembali dengan re-mapping `user_id` ke akun saat ini.

## Komponen React Kunci

```
components/ui/           button · card · input · progress · badge
components/layout/       AppShell · BottomNav · SideNav · OfflineBanner
components/shared/       ProgressRing (signature "Sunrise Ring")
                          EmptyState · SkeletonCard · ErrorBoundary · InstallPrompt
```

Komponen domain (`components/goals/`, `components/money/`, dst.) sengaja
dibiarkan sebagai folder kosong siap isi — di starter ini logika tampilan
per-domain masih hidup langsung di `pages/*.jsx` untuk mempercepat MVP.
Saat halaman mulai tumbuh besar, pecah bagian JSX-nya (mis. `GoalCard.jsx`,
`GoalForm.jsx`) ke folder domain masing-masing tanpa mengubah service layer.
