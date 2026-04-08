# Deployment Kılavuzu / Deployment Guide

---

## Genel Bakış

Sınavhazırlama aşağıdaki platformlarda ücretsiz veya düşük maliyetle deploy edilebilir:

| Platform | Ücretsiz Katman | Uyku Modu | Önerilen Kullanım |
|---|---|---|---|
| **Render.com** | ✅ (sınırlı) | 15 dk sonra | Staging + Küçük prod |
| **Railway.app** | ✅ ($5 kredi/ay) | Yok | Küçük prod |
| **Fly.io** | ✅ (3 VM) | Yok | Orta büyüklük prod |
| **DigitalOcean App Platform** | ❌ | Yok | Büyük prod |

---

## Render.com ile Deploy

### Ön Hazırlık

1. [render.com](https://render.com) hesabı oluşturun
2. GitHub reponuzu Render'a bağlayın

### Adım 1: PostgreSQL Veritabanı

1. Dashboard → **New** → **PostgreSQL**
2. İsim: `sinavhazirlama-db`
3. Plan: **Free** (geliştirme için)
4. Oluşturun; `Internal Database URL`'yi kopyalayın

### Adım 2: Backend Web Service

1. **New** → **Web Service**
2. Repo seçin: `Sinavhazirlama`
3. Ayarlar:
   ```
   Name:          sinavhazirlama-backend
   Root Directory: backend
   Environment:   Python 3
   Build Command: pip install -r requirements.txt
   Start Command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```
4. **Environment Variables** bölümüne ekleyin:

   | Değişken | Değer |
   |---|---|
   | `DATABASE_URL` | *(Adım 1'den kopyalanan Internal URL – asyncpg:// ile değiştirin)* |
   | `SECRET_KEY` | *(Güçlü rastgele değer)* |
   | `GEMINI_API_KEY` | *(Google AI Studio'dan)* |
   | `DEBUG` | `false` |
   | `ALLOWED_ORIGINS` | `https://sinavhazirlama-frontend.onrender.com` |

   > **Not:** `postgresql://` → `postgresql+asyncpg://` olarak değiştirmeyi unutmayın!

5. **Create Web Service**

### Adım 3: Frontend Static Site

1. **New** → **Static Site**
2. Repo seçin: `Sinavhazirlama`
3. Ayarlar:
   ```
   Name:          sinavhazirlama-frontend
   Root Directory: frontend
   Build Command: npm install && npm run build
   Publish Directory: dist
   ```
4. **Environment Variables**:

   | Değişken | Değer |
   |---|---|
   | `VITE_API_URL` | `https://sinavhazirlama-backend.onrender.com/api/v1` |

5. **Rewrite Rules** (SPA routing için):
   ```
   Source: /*
   Destination: /index.html
   Action: Rewrite
   ```

6. **Create Static Site**

### Deploy Hook'larını GitHub Secrets'a Ekleyin

GitHub repo → Settings → Secrets and variables → Actions:

```
RENDER_PROD_BACKEND_DEPLOY_HOOK  = https://api.render.com/deploy/srv-xxx?key=yyy
RENDER_PROD_FRONTEND_DEPLOY_HOOK = https://api.render.com/deploy/srv-xxx?key=yyy
```

---

## Railway.app ile Deploy

### Adım 1: Proje Oluşturma

```bash
# Railway CLI yükleyin
npm install -g @railway/cli

# Giriş yapın
railway login

# Proje oluşturun
cd /path/to/Sinavhazirlama
railway init
```

### Adım 2: PostgreSQL Ekleme

```bash
railway add --plugin postgresql
```

### Adım 3: Backend Deploy

```bash
cd backend
railway up
```

Railway Variables ayarları:
```bash
railway variables set SECRET_KEY="your-secret-key"
railway variables set GEMINI_API_KEY="your-gemini-key"
railway variables set DEBUG="false"
railway variables set ALLOWED_ORIGINS="https://your-frontend.railway.app"
# DATABASE_URL Railway tarafından otomatik eklenir
```

### Adım 4: Frontend Deploy

```bash
cd ../frontend
railway up
railway variables set VITE_API_URL="https://your-backend.railway.app/api/v1"
```

---

## Üretim Ortamı Yapılandırması

### Zorunlu Değişkenler

```dotenv
# Güvenlik – üretimde rastgele, tahmin edilemez değer kullanın
# python -c "import secrets; print(secrets.token_hex(32))"
SECRET_KEY=<en-az-64-karakterli-rastgele-deger>

# Veritabanı
DATABASE_URL=postgresql+asyncpg://user:pass@host:5432/dbname

# AI
GEMINI_API_KEY=<gemini-api-anahtari>

# CORS – frontend URL'si
ALLOWED_ORIGINS=https://yourdomain.com

# Üretimde kapalı olmalı
DEBUG=false
```

### Nginx ile TLS (Kendi Sunucu)

```nginx
server {
    listen 443 ssl;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Frontend (React SPA)
    location / {
        root /app/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$host$request_uri;
}
```

### Üretimde Veritabanı Migrasyonu

```bash
# Render / Railway
# Start Command'ı şu şekilde değiştirin:
alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT

# Docker
docker compose exec backend alembic upgrade head
```

---

## Sağlık Kontrol Endpoint'i

Tüm platformlar için sağlık kontrolü: `GET /api/v1/health`

Render ve Railway bu endpoint'i otomatik izleyebilir.
