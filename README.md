<div align="center">

# 📚 Sınavhazırlama

**Türk öğretmenler için yapay zeka destekli sınav sorusu üretim platformu**

[![Tests](https://github.com/your-org/Sinavhazirlama/actions/workflows/test.yml/badge.svg)](https://github.com/your-org/Sinavhazirlama/actions/workflows/test.yml)
[![Lint](https://github.com/your-org/Sinavhazirlama/actions/workflows/lint.yml/badge.svg)](https://github.com/your-org/Sinavhazirlama/actions/workflows/lint.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Python 3.11](https://img.shields.io/badge/python-3.11-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688.svg)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61DAFB.svg)](https://react.dev)

[Türkçe](#-proje-hakkında) · [English](#-about-the-project) · [Kurulum](#-hızlı-başlangıç) · [Katkı](#-katkıda-bulunma)

</div>

---

## 🇹🇷 Proje Hakkında

**Sınavhazırlama**, Türk öğretmenlerin yıllık planlarını yükleyerek Google Gemini yapay zekası ile otomatik sınav soruları üretmesini sağlayan açık kaynaklı, çok kiracılı (multi-tenant) bir platformdur.

### ✨ Özellikler

| Özellik | Açıklama |
|---|---|
| 🤖 **AI Soru Üretimi** | Gemini 1.5 Pro ile müfredata uygun çoktan seçmeli ve açık uçlu sorular |
| 📄 **Plan Yükleme** | Word (.docx) formatındaki yıllık planları otomatik ayrıştırma |
| 🏢 **Çok Kiracılı** | Her öğretmen izole çalışma alanına sahip |
| 🔐 **JWT Kimlik Doğrulama** | Güvenli erişim ve yenileme token mekanizması |
| 🚀 **Async API** | FastAPI + asyncpg ile yüksek performanslı arka uç |
| 🎨 **Modern Arayüz** | React 18 + TypeScript + Vite ile hızlı kullanıcı deneyimi |
| 🐘 **PostgreSQL** | Üretim kalitesinde ilişkisel veritabanı |
| 🐳 **Docker Desteği** | Tek komutla çalıştırma |

### 🚀 Hızlı Başlangıç

**Gereksinimler:** Docker 24+ ve Docker Compose v2

```bash
# 1. Depoyu klonlayın
git clone https://github.com/your-org/Sinavhazirlama.git
cd Sinavhazirlama

# 2. Ortam değişkenlerini ayarlayın
cp .env.example .env
# .env dosyasını açıp SECRET_KEY ve GEMINI_API_KEY değerlerini girin

# 3. Başlatın
docker compose up --build -d

# 4. Uygulamayı açın
open http://localhost:3000
```

API dokümantasyonuna erişmek için `.env` içinde `DEBUG=true` yapıp `http://localhost:8000/api/docs` adresini ziyaret edin.

### 🏗️ Mimari

```
┌──────────────────────────────────────────────┐
│                   İstemci                    │
│          React 18 + TypeScript + Vite        │
│               (Port 3000 / Nginx)            │
└──────────────────────┬───────────────────────┘
                       │ HTTPS / REST
┌──────────────────────▼───────────────────────┐
│               FastAPI Backend                │
│     Python 3.11 · Uvicorn · Asyncpg         │
│               (Port 8000)                    │
│                                              │
│  ┌──────────────┐   ┌──────────────────────┐ │
│  │  Auth Router │   │   Exam/Plan Router   │ │
│  └──────────────┘   └──────────────────────┘ │
│  ┌──────────────────────────────────────────┐ │
│  │         Gemini AI Service                │ │
│  └──────────────────────────────────────────┘ │
└──────────────────────┬───────────────────────┘
                       │ asyncpg
┌──────────────────────▼───────────────────────┐
│           PostgreSQL 15 (Port 5432)          │
│  workspaces · users · exams · questions ·    │
│              plans · materials               │
└──────────────────────────────────────────────┘
```

### 📁 Proje Yapısı

```
Sinavhazirlama/
├── backend/               # FastAPI uygulaması
│   ├── app/
│   │   ├── api/routes/    # Endpoint tanımları
│   │   ├── core/          # Config, güvenlik, istisnalar
│   │   ├── db/            # Veritabanı oturumu
│   │   ├── models/        # SQLAlchemy modelleri
│   │   ├── schemas/       # Pydantic şemaları
│   │   └── services/      # İş mantığı katmanı
│   ├── migrations/        # Alembic migration'ları
│   └── tests/             # Pytest testleri
├── frontend/              # React uygulaması
│   ├── src/
│   │   ├── components/    # UI bileşenleri
│   │   ├── pages/         # Sayfa bileşenleri
│   │   ├── hooks/         # Custom hook'lar
│   │   └── api/           # Axios istemcisi
│   └── public/
├── docs/                  # Detaylı dokümantasyon
├── .github/               # CI/CD ve şablonlar
├── docker-compose.yml
└── .env.example
```

### 🤝 Katkıda Bulunma

Katkılarınızı bekliyoruz! Lütfen önce [CONTRIBUTING.md](CONTRIBUTING.md) dosyasını okuyun.

```bash
# Fork'layın → Branch oluşturun → Değişiklik yapın → PR açın
git checkout -b feature/yeni-ozellik
git commit -m "feat: yeni özellik eklendi"
git push origin feature/yeni-ozellik
```

### 📜 Lisans

Bu proje [MIT Lisansı](LICENSE) altında dağıtılmaktadır.

### ❓ Sıkça Sorulan Sorular

<details>
<summary><strong>Gemini API anahtarı nasıl alınır?</strong></summary>

[Google AI Studio](https://aistudio.google.com) adresine gidin, hesap oluşturun ve "Get API key" butonuna tıklayın. Ücretsiz katmanda günlük 60 istek hakkınız bulunmaktadır.
</details>

<details>
<summary><strong>Ücretsiz çalıştırabilir miyim?</strong></summary>

Evet! Docker ile yerel olarak tamamen ücretsiz çalışır. Bulut deploy için Render.com ve Railway.app ücretsiz katman sunar. Detaylar için [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) dosyasına bakın.
</details>

<details>
<summary><strong>Hangi sınıf seviyelerini destekliyor?</strong></summary>

İlkokul (1-4), ortaokul (5-8) ve lise (9-12) sınıf seviyelerini destekler. Ders seçimi serbesttir.
</details>

<details>
<summary><strong>Verilerim güvende mi?</strong></summary>

Her öğretmenin verisi izole bir workspace içinde saklanır. Diğer kullanıcılar verilerinize erişemez. Şifreler bcrypt ile hashlenir.
</details>

---

## 🇬🇧 About the Project

**Sinavhazirlama** is an open-source, multi-tenant AI-powered exam question generator for Turkish teachers. Teachers upload their annual curriculum plans (Word documents), and the platform uses Google Gemini AI to automatically generate exam questions aligned with the curriculum.

### Features

- **AI Question Generation** – Gemini 1.5 Pro generates multiple-choice and open-ended questions
- **Curriculum Plan Parsing** – Automatic extraction of learning objectives from .docx files
- **Multi-tenant Architecture** – Every teacher has an isolated workspace
- **JWT Authentication** – Secure access and refresh token flow
- **Async FastAPI Backend** – High-performance Python 3.11 with asyncpg
- **React 18 Frontend** – TypeScript + Vite for fast UX
- **PostgreSQL 15** – Production-grade relational database
- **Docker** – Single-command startup

### Quick Start

```bash
git clone https://github.com/your-org/Sinavhazirlama.git
cd Sinavhazirlama
cp .env.example .env   # Fill in SECRET_KEY and GEMINI_API_KEY
docker compose up --build -d
open http://localhost:3000
```

See [docs/INSTALLATION.md](docs/INSTALLATION.md) for detailed setup instructions.

### Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### License

[MIT](LICENSE)
