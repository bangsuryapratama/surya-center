# Arsitektur Aplikasi — Surya Center

## Prinsip

1. **Unidirectional data flow**: `Pages → Services → Supabase/Gemini`. Halaman
   tidak pernah bicara langsung ke `supabase-js` atau `@google/generative-ai`.
2. **Context Builder sebagai gerbang tunggal ke AI**: setiap fitur AI (Mentor,
   Decision, Money Analysis, Journal Insight, Daily Motivation) membangun
   prompt-nya dari `buildUserContext()` yang sama, bukan query ad-hoc, supaya
   AI punya gambaran pengguna yang konsisten di semua fitur.
3. **Feature isolation dengan ErrorBoundary**: setiap card di Dashboard
   dibungkus `<ErrorBoundary>` sendiri-sendiri, supaya satu card yang gagal
   (mis. Gemini timeout) tidak memblankkan seluruh halaman.
4. **Offline-first di level shell**: service worker (Workbox via
   `vite-plugin-pwa`) meng-cache app shell + asset statis; data Supabase
   pakai `NetworkFirst` supaya selalu coba fresh dulu, fallback ke cache saat
   offline.

## Diagram Lapisan

```
┌─────────────────────────────────────────────────────────────┐
│  PRESENTATION                                                │
│  src/pages/*.jsx  →  src/components/{ui,layout,shared,*}     │
│  (Framer Motion untuk animasi, Tailwind untuk styling)        │
└───────────────────────────┬───────────────────────────────────┘
                            │ calls
┌───────────────────────────▼───────────────────────────────────┐
│  APPLICATION / HOOKS                                          │
│  useAuth · useAsync · useInstallPrompt                        │
│  store/authStore.js (Zustand)                                 │
└───────────────────────────┬───────────────────────────────────┘
                            │ calls
┌───────────────────────────▼───────────────────────────────────┐
│  SERVICE LAYER (API Service Layer)                            │
│  services/goalService · moneyService · habitService ·         │
│  journalService · priorityService · decisionService ·         │
│  mentorService · insightService · profileService ·            │
│  backupService                                                │
└───────┬─────────────────────────────────────┬─────────────────┘
        │                                     │
┌───────▼────────────┐                ┌───────▼──────────────────┐
│  lib/supabaseClient │                │  lib/geminiClient         │
│  (Postgres + RLS +  │                │  lib/contextBuilder       │
│   Auth + Realtime*) │                │  constants/prompts.js     │
└──────────────────────┘                └───────────────────────────┘
```
\* Realtime subscriptions are not wired up in the starter but the client
supports them if you want live-updating dashboards across devices.

## Alur Fitur Flagship: Decision Center

```
User isi form keputusan (title, cost, benefit, risk, goalImpact)
        │
        ▼
decisionService.analyzeAndSaveDecision(userId, input)
        │
        ├──► contextBuilder.buildUserContext(userId, { scope: [goals, money, journal] })
        │         │
        │         ▼
        │    formatContextForPrompt(context)  →  teks ringkas siap-prompt
        │
        ▼
constants/prompts.DECISION_ANALYSIS_PROMPT({ ...input, contextBlock })
        │
        ▼
geminiClient.generateJSON(prompt)  →  { score, priority_level, short_term_impact,
                                        long_term_impact, recommendation }
        │
        ▼
Simpan ke tabel `decisions` (input asli + hasil AI dalam satu baris, auditable)
        │
        ▼
UI menampilkan ProgressRing (score) + Badge rekomendasi (Ambil/Pertimbangkan/Tunda)
```

## Kenapa Supabase + RLS, bukan backend custom?

Untuk skala personal/MVP, Supabase Free Tier memberi Postgres + Auth + Row
Level Security tanpa perlu menulis backend sendiri. Setiap tabel punya policy
`auth.uid() = user_id`, jadi keamanan data-per-user ditegakkan di level
database, bukan hanya di client — bahkan jika ada bug di frontend, pengguna
tidak bisa membaca data pengguna lain.

## Rencana Skalabilitas

- **Sekarang (MVP)**: Gemini dipanggil langsung dari browser (lihat warning
  keamanan di `geminiClient.js`).
- **Berikutnya**: pindahkan ke Vercel Edge Function `/api/gemini` yang
  menyimpan API key di environment server-side, forward prompt saja. Ganti
  isi `generateContent()`/`generateJSON()` untuk `fetch("/api/gemini")`
  alih-alih SDK langsung — tidak ada perubahan di caller manapun.
- **Push Notification**: tambahkan tabel `push_subscriptions`, endpoint
  serverless untuk kirim Web Push, dan service worker listener `push` event
  (kerangka sudah disiapkan `vite-plugin-pwa`, tinggal isi `sw.js` custom).
