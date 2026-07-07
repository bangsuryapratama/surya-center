# Entity Relationship Diagram — Surya Center

Semua tabel domain memiliki `user_id` yang mereferensi `auth.users(id)` milik
Supabase Auth, dan diproteksi Row Level Security (`auth.uid() = user_id`).

```mermaid
erDiagram
    AUTH_USERS ||--|| PROFILES : "has"
    AUTH_USERS ||--o{ PRIORITIES : "owns"
    AUTH_USERS ||--o{ GOALS : "owns"
    AUTH_USERS ||--o{ TRANSACTIONS : "owns"
    AUTH_USERS ||--o{ WISHLIST_ITEMS : "owns"
    AUTH_USERS ||--o{ HABITS : "owns"
    AUTH_USERS ||--o{ HABIT_LOGS : "owns"
    AUTH_USERS ||--o{ JOURNAL_ENTRIES : "owns"
    AUTH_USERS ||--o{ DECISIONS : "owns"
    AUTH_USERS ||--o{ MENTOR_MESSAGES : "owns"
    AUTH_USERS ||--o{ AI_INSIGHTS : "owns"
    HABITS ||--o{ HABIT_LOGS : "tracked by"

    PROFILES {
        uuid id PK
        text full_name
        text avatar_url
        text timezone
        boolean onboarding_completed
    }

    PRIORITIES {
        uuid id PK
        uuid user_id FK
        text title
        boolean is_done
        date priority_date
    }

    GOALS {
        uuid id PK
        uuid user_id FK
        text title
        text description
        enum category
        date deadline
        smallint progress
        enum priority
        enum status
    }

    TRANSACTIONS {
        uuid id PK
        uuid user_id FK
        enum type
        numeric amount
        text category
        text note
        date transaction_date
    }

    WISHLIST_ITEMS {
        uuid id PK
        uuid user_id FK
        text title
        numeric price
        date target_date
        boolean is_purchased
    }

    HABITS {
        uuid id PK
        uuid user_id FK
        text name
        smallint target_per_week
        boolean archived
    }

    HABIT_LOGS {
        uuid id PK
        uuid habit_id FK
        uuid user_id FK
        date log_date
        boolean is_done
    }

    JOURNAL_ENTRIES {
        uuid id PK
        uuid user_id FK
        date entry_date
        smallint mood
        smallint energy
        smallint productivity
        text note
    }

    DECISIONS {
        uuid id PK
        uuid user_id FK
        text title
        numeric cost
        text benefit
        text risk
        text goal_impact
        smallint ai_score
        text ai_priority
        text ai_short_term
        text ai_long_term
        enum ai_recommendation
    }

    MENTOR_MESSAGES {
        uuid id PK
        uuid user_id FK
        enum role
        text content
        timestamptz created_at
    }

    AI_INSIGHTS {
        uuid id PK
        uuid user_id FK
        enum type
        text content
        date valid_for_date
    }
```

## Catatan Desain

- `habit_logs` punya unique constraint `(habit_id, log_date)` — satu entri
  per habit per hari, di-`upsert` saat toggle checklist (idempotent).
- `journal_entries` punya unique constraint `(user_id, entry_date)` — satu
  entri jurnal per hari, juga di-`upsert`.
- `ai_insights` adalah **cache layer**, bukan tabel domain: unique constraint
  `(user_id, type, valid_for_date)` memastikan Gemini hanya dipanggil sekali
  per hari untuk insight/motivasi, menghemat kuota API.
- View `v_monthly_money_summary` mengagregasi `transactions` per bulan per
  user untuk grafik di Money Center, tanpa perlu materialized view.
