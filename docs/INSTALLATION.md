# Kurulum Kılavuzu / Installation Guide

[Türkçe](#türkçe) · [English](#english)

---

## Türkçe

### Ön Koşullar

#### Docker ile Kurulum (Önerilen)

| Araç | Minimum Sürüm | İndirme |
|---|---|---|
| Docker | 24.0+ | https://docs.docker.com/get-docker/ |
| Docker Compose | v2.20+ | Docker Desktop ile birlikte gelir |
| Git | 2.40+ | https://git-scm.com |

#### Manuel Kurulum

| Araç | Minimum Sürüm |
|---|---|
| Python | 3.11+ |
| Node.js | 20 LTS+ |
| PostgreSQL | 15+ |
| npm | 9+ |

---

### 🐳 Docker ile Kurulum (Önerilen)

#### 1. Depoyu Klonlayın

```bash
git clone https://github.com/your-org/Sinavhazirlama.git
cd Sinavhazirlama
```

#### 2. Ortam Değişkenlerini Ayarlayın

```bash
cp .env.example .env
```

`.env` dosyasını bir metin editörüyle açın ve aşağıdaki alanları doldurun:

```dotenv
# Zorunlu – üretimde mutlaka değiştirin
SECRET_KEY=buraya-en-az-32-karakterli-guclu-bir-anahtar-girin

# Zorunlu – https://aistudio.google.com adresinden alın
GEMINI_API_KEY=your-gemini-api-key
```

Diğer değerleri geliştirme ortamı için varsayılan bırakabilirsiniz.

#### 3. Servisleri Başlatın

```bash
docker compose up --build -d
```

Bu komut şu servisleri başlatır:
- **db** – PostgreSQL 15 (port 5432)
- **backend** – FastAPI uygulaması (port 8000)
- **frontend** – React + Nginx (port 3000)

#### 4. Kurulumu Doğrulayın

```bash
# Servislerin çalıştığını kontrol et
docker compose ps

# Backend sağlık kontrolü
curl http://localhost:8000/api/v1/health

# Frontend
open http://localhost:3000
```

#### 5. Redis Etkinleştirme (Opsiyonel)

```bash
docker compose --profile redis up -d
```

#### Servis Durdurma / Silme

```bash
# Durdur
docker compose stop

# Durdur ve temizle (veritabanı korunur)
docker compose down

# Her şeyi sil (veritabanı dahil)
docker compose down -v
```

---

### ⚙️ Manuel Kurulum

#### 1. Depoyu Klonlayın

```bash
git clone https://github.com/your-org/Sinavhazirlama.git
cd Sinavhazirlama
```

#### 2. Veritabanını Hazırlayın

```bash
# PostgreSQL'e bağlanın
psql -U postgres

# Veritabanı oluşturun
CREATE DATABASE sinavhazirlama;
CREATE USER sinavuser WITH ENCRYPTED PASSWORD 'your-password';
GRANT ALL PRIVILEGES ON DATABASE sinavhazirlama TO sinavuser;
\q
```

#### 3. Backend Kurulumu

```bash
cd backend

# Sanal ortam oluştur
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate

# Bağımlılıkları yükle
pip install -r requirements.txt

# Ortam değişkenlerini ayarla
cp ../.env.example .env
# .env içinde DATABASE_URL, SECRET_KEY ve GEMINI_API_KEY değerlerini doldurun
```

#### 4. Veritabanı Tablolarını Oluşturun

Uygulama ilk başlatmada tabloları otomatik oluşturur. Alternatif olarak Alembic migration kullanabilirsiniz:

```bash
cd backend
alembic upgrade head
```

#### 5. Backend'i Başlatın

```bash
cd backend
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

#### 6. Frontend Kurulumu

```bash
cd frontend
npm install

# .env.local oluştur
echo "VITE_API_URL=http://localhost:8000/api/v1" > .env.local

# Geliştirme sunucusunu başlat
npm run dev
```

Frontend `http://localhost:5173` adresinde açılır.

---

### 🔑 API Anahtarı Yapılandırması

#### Gemini API Anahtarı

1. [https://aistudio.google.com](https://aistudio.google.com) adresine gidin
2. Google hesabınızla giriş yapın
3. **"Get API key"** → **"Create API key"** butonuna tıklayın
4. Anahtarı kopyalayıp `.env` dosyasındaki `GEMINI_API_KEY` alanına yapıştırın

#### Google Drive Entegrasyonu (Opsiyonel)

1. [Google Cloud Console](https://console.cloud.google.com) açın
2. Yeni proje oluşturun veya mevcut projeyi seçin
3. **APIs & Services** → **Enable APIs** → **Google Drive API**'yi etkinleştirin
4. **Credentials** → **Service Account** oluşturun
5. JSON anahtar dosyasını indirin ve `backend/credentials.json` olarak kaydedin
6. `.env` içinde `GOOGLE_CREDENTIALS_FILE=credentials.json` ayarlayın

---

### 🩺 Sorun Giderme

Kurulum sırasında sorun yaşarsanız [docs/TROUBLESHOOTING.md](TROUBLESHOOTING.md) dosyasına bakın.

---

## English

### Prerequisites

#### Docker Setup (Recommended)

| Tool | Min Version | Download |
|---|---|---|
| Docker | 24.0+ | https://docs.docker.com/get-docker/ |
| Docker Compose | v2.20+ | Bundled with Docker Desktop |
| Git | 2.40+ | https://git-scm.com |

#### Manual Setup

| Tool | Min Version |
|---|---|
| Python | 3.11+ |
| Node.js | 20 LTS+ |
| PostgreSQL | 15+ |
| npm | 9+ |

### Docker Setup (Recommended)

```bash
git clone https://github.com/your-org/Sinavhazirlama.git
cd Sinavhazirlama
cp .env.example .env
# Edit .env: set SECRET_KEY and GEMINI_API_KEY
docker compose up --build -d
open http://localhost:3000
```

### Manual Setup

See the Turkish section above — the commands are identical.

### API Key Configuration

#### Gemini API Key
1. Visit [https://aistudio.google.com](https://aistudio.google.com)
2. Sign in with your Google account
3. Click **"Get API key"** → **"Create API key"**
4. Copy the key and set `GEMINI_API_KEY` in your `.env`

#### Google Drive Integration (Optional)
1. Open [Google Cloud Console](https://console.cloud.google.com)
2. Enable **Google Drive API**
3. Create a **Service Account** and download the JSON key
4. Save it as `backend/credentials.json`
