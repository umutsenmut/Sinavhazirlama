# Geliştirme Kılavuzu / Development Guide

[Türkçe](#türkçe) · [English](#english)

---

## Türkçe

### Backend Geliştirme

#### Geliştirme Sunucusunu Başlatma

```bash
cd backend
source .venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

`--reload` bayrağı, kod değişikliklerinde sunucuyu otomatik yeniden başlatır.

API dokümantasyonuna erişmek için `.env` içinde `DEBUG=true` ayarlayın:

- Swagger UI: http://localhost:8000/api/docs
- ReDoc: http://localhost:8000/api/redoc
- OpenAPI JSON: http://localhost:8000/api/openapi.json

#### Proje Yapısı

```
backend/
├── app/
│   ├── api/
│   │   ├── deps.py          # Bağımlılık enjeksiyonları (get_db, get_current_user)
│   │   └── routes/          # Endpoint tanımları
│   │       ├── auth.py      # /api/v1/auth/*
│   │       ├── exams.py     # /api/v1/exams/*
│   │       ├── plans.py     # /api/v1/plans/*
│   │       ├── materials.py # /api/v1/materials/*
│   │       └── health.py    # /api/v1/health
│   ├── core/
│   │   ├── config.py        # Pydantic Settings
│   │   ├── security.py      # JWT işlemleri
│   │   └── exceptions.py    # Özel istisnalar
│   ├── db/
│   │   ├── base.py          # SQLAlchemy Base
│   │   └── session.py       # Async engine ve session
│   ├── models/              # SQLAlchemy ORM modelleri
│   ├── schemas/             # Pydantic request/response şemaları
│   └── services/            # İş mantığı katmanı
├── migrations/              # Alembic migration'ları
└── tests/                   # Pytest testleri
```

#### Yeni Endpoint Ekleme

1. `app/models/` içine yeni model ekleyin (gerekirse)
2. `app/schemas/` içine Pydantic şema tanımlayın
3. `app/services/` içine servis sınıfı oluşturun
4. `app/api/routes/` içine router tanımlayın
5. `app/main.py` içinde router'ı kaydedin
6. `tests/` içine test ekleyin

#### Veritabanı Migration'ları

```bash
cd backend

# Yeni migration oluştur
alembic revision --autogenerate -m "aciklama"

# Migration'ları uygula
alembic upgrade head

# Bir adım geri al
alembic downgrade -1

# Migration geçmişini gör
alembic history --verbose
```

---

### Frontend Geliştirme

#### Geliştirme Sunucusunu Başlatma

```bash
cd frontend
npm run dev
```

Uygulama http://localhost:5173 adresinde açılır.

#### Build Alma

```bash
npm run build      # TypeScript derle + Vite bundle
npm run preview    # Build'i lokal önizle
```

#### Proje Yapısı

```
frontend/
├── src/
│   ├── api/         # Axios istemcisi ve endpoint fonksiyonları
│   ├── components/  # Yeniden kullanılabilir UI bileşenleri
│   ├── hooks/       # Custom React hook'ları
│   ├── pages/       # Sayfa bileşenleri (route başına 1 sayfa)
│   ├── types/       # TypeScript tip tanımları
│   └── utils/       # Yardımcı fonksiyonlar
├── public/          # Statik dosyalar
├── vite.config.ts
└── tsconfig.json
```

---

### Testleri Çalıştırma

#### Backend Testleri

```bash
cd backend
source .venv/bin/activate

# Tüm testleri çalıştır
pytest tests/ -v

# Belirli bir test dosyası
pytest tests/test_auth.py -v

# Kapsam raporu ile
pytest tests/ --cov=app --cov-report=html
# htmlcov/index.html dosyasını açın

# Async mod
pytest tests/ --asyncio-mode=auto
```

Test veritabanı için `aiosqlite` (in-memory SQLite) kullanılır, PostgreSQL gerekmez.

#### Frontend Tip Kontrolü

```bash
cd frontend
npx tsc --noEmit    # TypeScript hata kontrolü
npm run lint        # ESLint
npm run format      # Prettier
```

---

### Ortam Değişkenleri Referansı

| Değişken | Varsayılan | Açıklama |
|---|---|---|
| `DATABASE_URL` | SQLite | Veritabanı bağlantı dizisi |
| `SECRET_KEY` | – | JWT imzalama anahtarı (min 32 karakter) |
| `GEMINI_API_KEY` | – | Google Gemini API anahtarı |
| `GOOGLE_CREDENTIALS_FILE` | `credentials.json` | Service account JSON yolu |
| `DEBUG` | `false` | Swagger UI aktif edilir |
| `ALLOWED_ORIGINS` | `http://localhost:3000` | CORS izin verilen kaynak |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `30` | Access token süresi (dk) |
| `REFRESH_TOKEN_EXPIRE_DAYS` | `7` | Refresh token süresi (gün) |
| `MAX_UPLOAD_SIZE_MB` | `10` | Maksimum dosya yükleme boyutu |

---

## English

### Backend Development

```bash
cd backend
source .venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Set `DEBUG=true` in `.env` to enable Swagger UI at http://localhost:8000/api/docs.

### Database Migrations

```bash
alembic revision --autogenerate -m "description"
alembic upgrade head
```

### Frontend Development

```bash
cd frontend
npm run dev       # Dev server at http://localhost:5173
npm run build     # Production build
npm run lint      # ESLint check
```

### Running Tests

```bash
cd backend
pytest tests/ -v --asyncio-mode=auto
```
