# Prompt Engineering — Surya Center

Semua template prompt hidup di satu file: `src/constants/prompts.js`. Ini
sengaja dipisah dari komponen supaya tone dan format output mudah diiterasi
tanpa menyentuh kode UI.

## Pola Umum Setiap Prompt

1. **Beri Gemini peran spesifik** ("penasihat keuangan pribadi", "Surya
   Mentor", bukan asisten generik).
2. **Suntikkan context block** dari `contextBuilder.formatContextForPrompt()`
   — teks berformat bullet, bukan JSON mentah (respons Gemini jauh lebih
   relevan dengan konteks berbentuk kalimat manusiawi dibanding data mentah).
3. **Kunci format output secara eksplisit** — untuk fitur yang butuh data
   terstruktur (Decision Center, Money Analysis, Journal Pattern), instruksi
   selalu: *"Balas HANYA dalam format JSON valid tanpa markdown fence"* +
   skema field persis. Ini dipasangkan dengan `generateJSON()` di
   `geminiClient.js` yang men-strip ```json fences sebagai pengaman kedua.
4. **Batasi panjang** untuk konten yang tampil di kartu kecil (motivasi
   harian max 25 kata, insight dashboard max 2 kalimat) supaya UI tidak
   overflow dan Gemini tidak melantur.
5. **Bahasa Indonesia end-to-end** — instruksi ke Gemini, maupun instruksi
   soal bahasa balasan, konsisten dalam Bahasa Indonesia karena seluruh UI
   aplikasi berbahasa Indonesia.

## Context Builder — Kenapa Dipisah dari Prompt

`buildUserContext(userId, { scope })` mengambil data mentah dari Supabase
(goals, financial snapshot, habit summary, jurnal 7 hari, prioritas hari ini)
secara paralel (`Promise.all`), lalu `formatContextForPrompt()` mengubahnya
jadi teks siap-prompt. Pemisahan ini penting karena:

- **Reusable**: Decision Center hanya butuh `[goals, money, journal]`,
  sementara Habit insight (jika ditambahkan) tidak perlu data keuangan sama
  sekali — `scope` membuat setiap fitur hanya menarik data yang relevan,
  menghemat ukuran prompt dan biaya token.
- **Konsisten**: kalau format tanggal atau cara menghitung streak berubah,
  cukup ubah di satu tempat (`contextBuilder.js`), bukan di lima prompt
  berbeda.
- **Auditable**: mudah melihat persis data apa yang "dilihat" AI saat
  memberi rekomendasi — penting untuk fitur sepenting Decision Center.

## Contoh: Decision Center Prompt (ringkas)

```
Kamu adalah penasihat pengambilan keputusan di Surya Center...

KONTEKS PENGGUNA:
GOAL AKTIF:
- [finance] "Dana darurat 6x pengeluaran" — progress 40%, prioritas high, ...
KONDISI KEUANGAN (bulan berjalan):
- Pemasukan: Rp8.000.000
- Pengeluaran: Rp6.200.000
...

KEPUTUSAN YANG DIPERTIMBANGKAN:
- Nama: Beli laptop baru Rp15 juta
- Biaya: 15000000
- Manfaat: Produktivitas kerja lebih baik
- Risiko: Mengganggu dana darurat
- Dampak ke goal: Bisa memperlambat goal dana darurat

Balas HANYA dalam format JSON valid ... { score, priority_level,
short_term_impact, long_term_impact, recommendation }
```

Karena konteks keuangan & goal disuntikkan, skor yang dihasilkan untuk
keputusan yang sama akan **berbeda** antar pengguna — inilah yang membuat
Decision Center terasa personal, bukan kalkulator generik.

## Mengembangkan Prompt Baru

Saat menambah fitur AI baru:
1. Tambahkan template di `constants/prompts.js` mengikuti pola di atas.
2. Tentukan `scope` context yang benar-benar dibutuhkan (jangan default ke
   semua scope demi menghemat token & mengurangi noise buat model).
3. Kalau butuh output terstruktur, selalu definisikan skema JSON persis dan
   gunakan `generateJSON()`, bukan `generateContent()` + parsing manual.
4. Pertimbangkan caching (lihat `insightService.js` pola `ai_insights`) untuk
   konten yang tidak perlu regenerate setiap render.
