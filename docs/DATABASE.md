# Veritabanı Dokümantasyonu / Database Documentation

---

## Genel Bakış

Sınavhazırlama **PostgreSQL 15** kullanmaktadır. Geliştirme ortamında SQLite (aiosqlite) da desteklenir. ORM olarak **SQLAlchemy 2.0 async** kullanılır; migration'lar **Alembic** ile yönetilir.

---

## Async Sürücü Gereksinimleri

SQLAlchemy async extension yalnızca **async sürücüler** ile çalışır. Yanlış sürücü kullanımı şu hataya yol açar:

```
sqlalchemy.exc.InvalidRequestError: The asyncio extension requires an async driver to be used.
```

| Veritabanı | Zorunlu Sürücü | Bağlantı URL Formatı |
|---|---|---|
| PostgreSQL | `asyncpg` | `postgresql+asyncpg://user:pass@host:5432/dbname` |
| SQLite | `aiosqlite` | `sqlite+aiosqlite:///./dbname.db` |

### `.env` veya `docker-compose.yml` Örneği

```dotenv
# PostgreSQL (Docker Compose ortamı – önerilen):
DATABASE_URL=postgresql+asyncpg://admin:password@db:5432/sinavhazirlama

# SQLite (lokal geliştirme):
DATABASE_URL=sqlite+aiosqlite:///./sinavhazirlama.db
```

> ⚠️ `postgresql://` veya `postgresql+psycopg2://` formatlarını **kullanmayın**. Bunlar sync sürücülerdir ve async SQLAlchemy ile çalışmaz.

---

## Tablolar ve İlişkiler

### `workspaces` – Çalışma Alanları

Her öğretmenin izole çalışma ortamı. Kullanıcı kaydında otomatik oluşturulur.

| Sütun | Tür | Kısıtlar | Açıklama |
|---|---|---|---|
| `id` | INTEGER | PK, AUTOINCREMENT | Birincil anahtar |
| `name` | VARCHAR(255) | NOT NULL | Workspace görünen adı |
| `slug` | VARCHAR(255) | UNIQUE, NOT NULL | URL dostu benzersiz tanımlayıcı |
| `owner_id` | INTEGER | FK → users.id, SET NULL | Workspace sahibi |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Oluşturma zamanı |

---

### `users` – Kullanıcılar

Sisteme kayıtlı öğretmenler.

| Sütun | Tür | Kısıtlar | Açıklama |
|---|---|---|---|
| `id` | INTEGER | PK, AUTOINCREMENT | Birincil anahtar |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | Giriş için kullanılan e-posta |
| `password_hash` | VARCHAR(255) | NOT NULL | bcrypt hash |
| `full_name` | VARCHAR(255) | NOT NULL | Ad soyad |
| `school_name` | VARCHAR(255) | NULL | Okul adı |
| `workspace_id` | INTEGER | FK → workspaces.id, SET NULL | Kullanıcının çalışma alanı |
| `is_active` | BOOLEAN | DEFAULT TRUE | Hesap aktiflik durumu |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Kayıt zamanı |

---

### `exams` – Sınavlar

Öğretmenlerin oluşturduğu sınav tanımları.

| Sütun | Tür | Kısıtlar | Açıklama |
|---|---|---|---|
| `id` | INTEGER | PK, AUTOINCREMENT | Birincil anahtar |
| `workspace_id` | INTEGER | FK → workspaces.id, CASCADE | Ait olduğu workspace |
| `title` | VARCHAR(500) | NOT NULL | Sınav başlığı |
| `grade` | VARCHAR(10) | NOT NULL | Sınıf seviyesi (ör. "5", "9") |
| `subject` | VARCHAR(100) | NOT NULL | Ders adı |
| `week_number` | INTEGER | NULL | Müfredat haftası |
| `status` | VARCHAR(20) | DEFAULT 'pending' | `pending` / `generating` / `completed` / `failed` |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Oluşturma zamanı |

---

### `questions` – Sorular

AI tarafından üretilen sınav soruları.

| Sütun | Tür | Kısıtlar | Açıklama |
|---|---|---|---|
| `id` | INTEGER | PK, AUTOINCREMENT | Birincil anahtar |
| `exam_id` | INTEGER | FK → exams.id, CASCADE | Ait olduğu sınav |
| `body` | TEXT | NOT NULL | Soru metni |
| `type` | VARCHAR(20) | NOT NULL | `multiple_choice` veya `open_ended` |
| `choices` | JSONB | NULL | Çoktan seçmeli şıklar: `[{"label":"A","text":"..."}]` |
| `answer` | TEXT | NULL | Doğru cevap veya cevap anahtarı |
| `order_num` | INTEGER | NOT NULL | Soru sırası |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Oluşturma zamanı |

---

### `plans` – Yıllık Planlar

Yüklenen Word dokümanlarından çıkarılan kazanım listeleri.

| Sütun | Tür | Kısıtlar | Açıklama |
|---|---|---|---|
| `id` | INTEGER | PK, AUTOINCREMENT | Birincil anahtar |
| `workspace_id` | INTEGER | FK → workspaces.id, CASCADE | Ait olduğu workspace |
| `filename` | VARCHAR(500) | NOT NULL | Orijinal dosya adı |
| `objectives` | JSONB | NOT NULL | Kazanım listesi: `["kazanım 1", ...]` |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Yükleme zamanı |

---

## İlişki Diyagramı

```
workspaces (1)
    ├──< users (N)         workspace_id FK
    ├──< exams (N)         workspace_id FK
    └──< plans (N)         workspace_id FK

exams (1)
    └──< questions (N)     exam_id FK
```

---

## Migration Stratejisi

Sınavhazırlama **Alembic** kullanır. Tüm şema değişiklikleri versiyonlanmış migration dosyaları olarak saklanır.

### Migration Oluşturma

```bash
cd backend

# Modeli değiştirdikten sonra otomatik migration oluştur
alembic revision --autogenerate -m "add_question_difficulty_column"

# Migration dosyasını incele
cat migrations/versions/<timestamp>_add_question_difficulty_column.py

# Uygula
alembic upgrade head
```

### Migration Geri Alma

```bash
# Bir adım geri al
alembic downgrade -1

# Belirli bir versiyona dön
alembic downgrade <revision_id>

# Mevcut versiyonu gör
alembic current

# Geçmişi gör
alembic history --verbose
```

### Üretimde Migration

```bash
# Docker ortamında
docker compose exec backend alembic upgrade head

# Doğrudan
DATABASE_URL=postgresql+asyncpg://... alembic upgrade head
```

> ⚠️ **Önemli:** Üretim ortamında migration'ı her zaman yedek aldıktan sonra çalıştırın. Geri alınamaz işlemler (DROP COLUMN, vb.) için dikkatli olun.

---

## Dizinler ve Performans

| Tablo | Sütun | İndeks Tipi | Amaç |
|---|---|---|---|
| `users` | `email` | UNIQUE INDEX | Giriş sorgusu |
| `workspaces` | `slug` | UNIQUE INDEX | URL lookup |
| `exams` | `workspace_id` | INDEX | Workspace sınav listesi |
| `questions` | `exam_id` | (CASCADE ile implicit) | Sınav soruları |

---

## Yedekleme

```bash
# Tam yedek
pg_dump -U postgres sinavhazirlama > backup_$(date +%Y%m%d).sql

# Geri yükleme
psql -U postgres sinavhazirlama < backup_20240115.sql

# Docker ile
docker compose exec db pg_dump -U postgres sinavhazirlama > backup.sql
```
