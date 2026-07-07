-- =====================================================================
-- SURYA CENTER — DUMMY DATA SEEDER
-- Run this in Supabase SQL Editor to populate dummy data for testing.
-- 
-- IMPORTANT: Replace 'YOUR-UUID-HERE' with your actual User ID from 
-- the Authentication -> Users page in Supabase Dashboard.
-- =====================================================================

DO $$
DECLARE
  -- Ganti UUID ini dengan User ID Anda dari halaman Authentication
  v_user_id uuid := 'YOUR-UUID-HERE';
  v_habit_id uuid;
BEGIN
  -- Pastikan profil sudah ada (biasanya otomatis terbuat via trigger, 
  -- tapi kita pastikan di sini kalau belum ada)
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = v_user_id) THEN
    INSERT INTO profiles (id, full_name, onboarding_completed)
    VALUES (v_user_id, 'Developer Surya', true);
  END IF;

  -- 1. Seed Priorities
  INSERT INTO priorities (user_id, title, is_done, priority_date) VALUES
  (v_user_id, 'Selesaikan integrasi Supabase', true, current_date),
  (v_user_id, 'Desain ulang UI Login agar premium', false, current_date),
  (v_user_id, 'Review jurnal minggu ini', false, current_date);

  -- 2. Seed Goals
  INSERT INTO goals (user_id, title, description, category, deadline, progress, priority, status) VALUES
  (v_user_id, 'Tabungan Darurat 50 Juta', 'Kumpulkan dana darurat untuk 6 bulan', 'finance', current_date + interval '180 days', 40, 'high', 'in_progress'),
  (v_user_id, 'Belajar React Server Components', 'Pahami konsep RSC di Next.js', 'education', current_date + interval '30 days', 10, 'medium', 'in_progress'),
  (v_user_id, 'Turun BB 5kg', 'Olahraga rutin dan defisit kalori', 'health', current_date + interval '60 days', 0, 'medium', 'not_started');

  -- 3. Seed Transactions (Money)
  INSERT INTO transactions (user_id, type, amount, category, note, transaction_date) VALUES
  (v_user_id, 'income', 15000000, 'Gaji', 'Gaji bulan ini', current_date - interval '5 days'),
  (v_user_id, 'expense', 3500000, 'Kebutuhan', 'Sewa kos & listrik', current_date - interval '3 days'),
  (v_user_id, 'expense', 500000, 'Hiburan', 'Makan di luar', current_date - interval '1 days'),
  (v_user_id, 'saving', 2000000, 'Tabungan', 'Ke Reksadana', current_date);

  -- 4. Seed Wishlist
  INSERT INTO wishlist_items (user_id, title, price, target_date, is_purchased) VALUES
  (v_user_id, 'MacBook Pro M3', 25000000, current_date + interval '120 days', false),
  (v_user_id, 'Ergonomic Chair', 3000000, current_date + interval '14 days', false);

  -- 5. Seed Habits & Logs
  INSERT INTO habits (id, user_id, name, target_per_week) 
  VALUES (uuid_generate_v4(), v_user_id, 'Coding 2 Jam', 7) 
  RETURNING id INTO v_habit_id;

  INSERT INTO habit_logs (habit_id, user_id, log_date, is_done) VALUES
  (v_habit_id, v_user_id, current_date - interval '2 days', true),
  (v_habit_id, v_user_id, current_date - interval '1 days', true),
  (v_habit_id, v_user_id, current_date, false);

  -- 6. Seed Journal Entries
  INSERT INTO journal_entries (user_id, entry_date, mood, energy, productivity, note) VALUES
  (v_user_id, current_date - interval '1 days', 8, 7, 9, 'Hari yang sangat produktif. Berhasil menyelesaikan banyak task.'),
  (v_user_id, current_date, 6, 5, 6, 'Agak lelah hari ini, butuh lebih banyak istirahat.');

  -- 7. Seed Decisions
  INSERT INTO decisions (user_id, title, cost, benefit, risk, goal_impact, ai_score, ai_recommendation) VALUES
  (v_user_id, 'Beli Kursus UI/UX', 1500000, 'Meningkatkan skill desain', 'Uang tabungan berkurang', 'Membantu karir', 85, 'take');

END $$;
