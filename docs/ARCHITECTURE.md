# Mimari Dokümantasyonu / Architecture Documentation

---

## Genel Bakış

Sınavhazırlama, **çok kiracılı (multi-tenant)** bir SaaS mimarisine sahip fullstack web uygulamasıdır. Her öğretmen izole bir **workspace** içinde çalışır; farklı kullanıcıların verileri birbirinden tamamen ayrıktır.

---

## Teknoloji Yığını

| Katman | Teknoloji | Versiyon | Tercih Nedeni |
|---|---|---|---|
| **Backend** | FastAPI | 0.111 | Async, otomatik OpenAPI, yüksek performans |
| **ORM** | SQLAlchemy (async) | 2.0 | Async desteği, tip güvenliği |
| **Migration** | Alembic | 1.13 | SQLAlchemy ile entegrasyon |
| **Doğrulama** | Pydantic v2 | 2.7 | Hızlı serialization, tip güvenliği |
| **Auth** | python-jose | 3.3 | JWT RS256/HS256 desteği |
| **Şifreleme** | passlib (bcrypt) | 1.7 | Endüstri standardı |
| **Veritabanı** | PostgreSQL | 15 | ACID, JSON desteği, performans |
| **DB Sürücüsü** | asyncpg | 0.29 | En hızlı async PostgreSQL sürücüsü |
| **AI** | Google Gemini | 1.5 Pro | Türkçe dil desteği, müfredat anlama |
| **Doküman** | python-docx | 1.1 | Word dosyası ayrıştırma |
| **Frontend** | React | 18 | Component mimarisi, geniş ekosistem |
| **Dil** | TypeScript | 5.2 | Tip güvenliği |
| **Build** | Vite | 5.1 | Hızlı HMR, ES modül desteği |
| **HTTP İstemci** | Axios | 1.6 | Interceptor, hata yönetimi |
| **Routing** | React Router | 6 | Nested routing desteği |
| **Sunucu** | Nginx | 1.25 | Statik dosya servisi, reverse proxy |
| **Container** | Docker / Compose | 24 | Taşınabilirlik |

---

## Sistem Mimarisi

```
┌──────────────────────────────────────────────────────────────────┐
│                         İnternet                                 │
└─────────────────────────────┬────────────────────────────────────┘
                              │
┌─────────────────────────────▼────────────────────────────────────┐
│              Nginx Reverse Proxy (Port 80/443)                   │
│  /          → React SPA (statik dosyalar)                        │
│  /api/*     → FastAPI backend (proxy_pass :8000)                 │
└──────────┬──────────────────────────────────┬────────────────────┘
           │                                  │
┌──────────▼──────────┐          ┌────────────▼───────────────────┐
│   React Frontend    │          │      FastAPI Backend            │
│   TypeScript        │          │      Python 3.11               │
│   Vite Build        │          │      Uvicorn (async)           │
│   Port 3000         │          │      Port 8000                 │
└─────────────────────┘          └────────────┬───────────────────┘
                                              │
                              ┌───────────────┼───────────────┐
                              │               │               │
                    ┌─────────▼───┐  ┌────────▼──────┐  ┌────▼──────┐
                    │ PostgreSQL  │  │  Gemini API   │  │  Google   │
                    │     15      │  │  (External)   │  │  Drive    │
                    │  Port 5432  │  └───────────────┘  │  (Opt.)   │
                    └─────────────┘                     └───────────┘
```

---

## Çok Kiracılı Model

Sınavhazırlama **paylaşımlı veritabanı, ayrı şema** yerine **paylaşımlı tablo, workspace_id izolasyonu** modelini kullanır:

```
Her sorgu WHERE workspace_id = ? filtresiyle çalışır.
Bir kullanıcı hiçbir zaman başka bir workspace'in verisine erişemez.
```

**Workspace oluşturma akışı:**
```
Kullanıcı kayıt olur
    └─► Otomatik workspace oluşturulur
            └─► Kullanıcı workspace'e owner olarak atanır
                    └─► Tüm veriler workspace_id ile ilişkilendirilir
```

**Gelecek için çok üyeli workspace:**
```
Workspace
├── owner (users.id)
└── members (users.workspace_id FK)
```

---

## İstek Akışı

```
HTTP İsteği
    │
    ▼
FastAPI Middleware Katmanı
    ├── CORS kontrolü
    ├── İstek loglama
    └── Exception handler'lar
    │
    ▼
Router (auth / exams / plans / materials / health)
    │
    ▼
Bağımlılık Enjeksiyonu (deps.py)
    ├── get_db()          → AsyncSession
    ├── get_current_user() → User (JWT doğrulama)
    └── get_current_workspace() → Workspace
    │
    ▼
Service Katmanı (İş mantığı)
    ├── ExamService
    ├── PlanService
    ├── UserService
    └── WorkspaceService
    │
    ▼
Veritabanı (SQLAlchemy async)
    └── PostgreSQL 15
```

---

## Veritabanı Şeması (Metin Diyagram)

```
workspaces
├── id            PK
├── name          VARCHAR(255)
├── slug          VARCHAR(255) UNIQUE
├── owner_id      FK → users.id (SET NULL)
└── created_at    TIMESTAMPTZ

users
├── id            PK
├── email         VARCHAR(255) UNIQUE
├── password_hash VARCHAR(255)
├── full_name     VARCHAR(255)
├── school_name   VARCHAR(255) NULL
├── workspace_id  FK → workspaces.id (SET NULL)
├── is_active     BOOLEAN
└── created_at    TIMESTAMPTZ

exams
├── id            PK
├── workspace_id  FK → workspaces.id (CASCADE)
├── title         VARCHAR(500)
├── grade         VARCHAR(10)        -- "5", "9", "11"
├── subject       VARCHAR(100)       -- "Matematik", "Türkçe"
├── week_number   INTEGER NULL
├── status        VARCHAR(20)        -- pending|generating|completed|failed
└── created_at    TIMESTAMPTZ

questions
├── id            PK
├── exam_id       FK → exams.id (CASCADE)
├── body          TEXT
├── type          VARCHAR(20)        -- multiple_choice|open_ended
├── choices       JSONB NULL         -- [{label, text}]
├── answer        TEXT NULL
├── order_num     INTEGER
└── created_at    TIMESTAMPTZ

plans
├── id            PK
├── workspace_id  FK → workspaces.id (CASCADE)
├── filename      VARCHAR(500)
├── objectives    JSONB              -- ["kazanım 1", "kazanım 2"]
└── created_at    TIMESTAMPTZ
```

---

## Güvenlik Mimarisi

```
┌─────────────────────────────────────────────────────┐
│                  Güvenlik Katmanları                │
├─────────────────────────────────────────────────────┤
│ 1. Şifre → bcrypt hash (12 rounds)                 │
│ 2. Access Token → HS256 JWT (30 dk)                │
│ 3. Refresh Token → HS256 JWT (7 gün)               │
│ 4. Workspace izolasyonu → her sorguda filtre       │
│ 5. CORS → yalnızca izin verilen origin'ler         │
│ 6. Upload → MIME type + boyut doğrulama            │
└─────────────────────────────────────────────────────┘
```

---

## AI Entegrasyonu

```
POST /exams/{id}/generate
    │
    ▼
ExamService.generate_questions(exam)
    │
    ▼
GeminiService.generate(prompt)
    ├── Prompt oluştur:
    │   - Sınıf seviyesi
    │   - Ders adı
    │   - Hafta numarası
    │   - Yıllık plan kazanımları (varsa)
    │   - Soru formatı talimatı
    │
    ├── Gemini 1.5 Pro API çağrısı
    │
    └── JSON yanıtı ayrıştır
            └── Question nesneleri oluştur → veritabanına kaydet
```
