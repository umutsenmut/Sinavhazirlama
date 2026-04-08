# Sorun Giderme / Troubleshooting

[Türkçe](#türkçe) · [English](#english)

---

## Türkçe

### 🐳 Docker Sorunları

#### Servisler başlamıyor

```bash
# Log'ları kontrol edin
docker compose logs db
docker compose logs backend
docker compose logs frontend

# Servislerin durumunu görün
docker compose ps
```

#### Port zaten kullanılıyor

```
Error: Bind for 0.0.0.0:8000 failed: port is already allocated
```

**Çözüm:**
```bash
# Portu kullanan süreci bulun
lsof -i :8000        # macOS/Linux
netstat -ano | findstr :8000  # Windows

# Süreci durdurun veya docker-compose.yml içinde portu değiştirin
ports:
  - "8001:8000"  # 8000 yerine 8001 kullanın
```

#### Async veritabanı sürücüsü hatası

```
sqlalchemy.exc.InvalidRequestError: The asyncio extension requires an async driver to be used. The loaded 'psycopg2' is not async.
```
veya
```
ModuleNotFoundError: No module named 'psycopg2'
```

**Neden Oluşur:**  
Proje SQLAlchemy async extension kullanmaktadır. Bu extension yalnızca async sürücülerle (PostgreSQL için `asyncpg`, SQLite için `aiosqlite`) çalışır. Standart `psycopg2` async değildir ve bu kurulumla uyumsuzdur.

**Çözüm:**  
`DATABASE_URL` değerinin doğru async formatını kullandığından emin olun:

```dotenv
# PostgreSQL için (zorunlu):
DATABASE_URL=postgresql+asyncpg://admin:password@db:5432/sinavhazirlama

# SQLite için (zorunlu):
DATABASE_URL=sqlite+aiosqlite:///./sinavhazirlama.db

# YANLIŞ - Bu formatlar çalışmaz:
# DATABASE_URL=postgresql://...
# DATABASE_URL=postgresql+psycopg2://...
```

`requirements.txt` dosyasında hem `asyncpg` hem de `aiosqlite` paketlerinin mevcut olduğundan emin olun. Docker kullanıyorsanız image'ı yeniden oluşturun:

```bash
docker-compose down
docker-compose build --no-cache backend
docker-compose up -d
```

---

#### Veritabanı bağlantısı kurulamıyor

```
sqlalchemy.exc.OperationalError: could not connect to server
```

**Çözüm:**
```bash
# PostgreSQL container'ının hazır olup olmadığını kontrol edin
docker compose ps db

# Sağlık kontrolü
docker compose exec db pg_isready -U postgres

# Backend'i yeniden başlatın
docker compose restart backend
```

---

### 🔑 API Anahtarı Sorunları

#### Gemini API hatası

```
GeminiException: API anahtarı geçersiz veya kota aşıldı
```

**Çözümler:**
1. `GEMINI_API_KEY` değerinin doğru ayarlandığından emin olun
2. [Google AI Studio](https://aistudio.google.com) üzerinden kota durumunu kontrol edin
3. Ücretsiz katmanda günlük 60 istek sınırı vardır

---

### 🔐 Kimlik Doğrulama Sorunları

#### "Token süresi dolmuş" hatası

```json
{"hata": "Token süresi dolmuş", "kod": "YETKİSİZ"}
```

**Çözüm:** Frontend refresh token akışını kullanmalıdır. `POST /api/v1/auth/refresh` endpoint'ini çağırın.

#### Kayıt sırasında "409 Conflict"

Bu e-posta adresi zaten kayıtlı. Farklı bir e-posta deneyin veya şifremi unuttum akışını kullanın.

---

### 📄 Dosya Yükleme Sorunları

#### "Desteklenmeyen dosya türü" hatası

Yalnızca `.docx` ve `.doc` formatları kabul edilmektedir. Dosyanızın gerçekten Word formatında olduğundan emin olun.

#### "Dosya çok büyük" hatası

Varsayılan limit 10 MB'dır. `.env` dosyasında `MAX_UPLOAD_SIZE_MB` değerini artırabilirsiniz.

#### Plan yüklendiğinde kazanımlar boş çıkıyor

Word dokümanınızın yapılandırılmış kazanım listesi içerdiğinden emin olun. Düz metin yerine madde işaretli liste veya numaralı liste kullanın.

---

### 💻 Geliştirme Ortamı Sorunları

#### `ModuleNotFoundError` – Backend

```bash
# Sanal ortamın aktif olduğundan emin olun
source backend/.venv/bin/activate
pip install -r backend/requirements.txt
```

#### `npm: command not found` – Frontend

Node.js kurulmamış. [https://nodejs.org](https://nodejs.org) adresinden Node.js 20 LTS sürümünü indirin.

#### Alembic migration hatası

```
alembic.util.exc.CommandError: Can't locate revision identified by ...
```

**Çözüm:**
```bash
# Migration geçmişini temizle
alembic stamp head
alembic upgrade head
```

#### CORS hatası (tarayıcı konsolu)

```
Access to XMLHttpRequest blocked by CORS policy
```

**Çözüm:** `.env` dosyasında `ALLOWED_ORIGINS` değerini frontend URL'sini içerecek şekilde güncelleyin:
```dotenv
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

---

### 🏭 Üretim Sorunları

#### Render.com ücretsiz katmanda yavaş başlangıç

Ücretsiz katmandaki servisler 15 dakika inaktivite sonrasında uyku moduna geçer. İlk istekte 30-60 saniye bekleme yaşanabilir. Bu normaldir.

#### SECRET_KEY hatası

```
ValueError: SECRET_KEY en az 32 karakter olmalıdır
```

**Çözüm:**
```bash
# Güçlü anahtar üretin
python -c "import secrets; print(secrets.token_hex(32))"
```

---

## English

### Docker Issues

#### Services won't start

```bash
docker compose logs db
docker compose logs backend
docker compose logs frontend
docker compose ps
```

#### Port already in use

Change the host port in `docker-compose.yml`:
```yaml
ports:
  - "8001:8000"   # Use 8001 instead of 8000
```

#### Async database driver error

```
sqlalchemy.exc.InvalidRequestError: The asyncio extension requires an async driver to be used. The loaded 'psycopg2' is not async.
```
or
```
ModuleNotFoundError: No module named 'psycopg2'
```

**Cause:** The project uses SQLAlchemy's async extension, which requires async drivers only. For PostgreSQL this means `asyncpg`; for SQLite it means `aiosqlite`. The standard `psycopg2` driver is synchronous and will not work here.

**Fix:** Make sure `DATABASE_URL` uses the correct async format:

```dotenv
# PostgreSQL (required format):
DATABASE_URL=postgresql+asyncpg://admin:password@db:5432/sinavhazirlama

# SQLite (required format):
DATABASE_URL=sqlite+aiosqlite:///./sinavhazirlama.db

# WRONG – these formats will NOT work:
# DATABASE_URL=postgresql://...
# DATABASE_URL=postgresql+psycopg2://...
```

If running Docker, rebuild the backend image after any dependency change:

```bash
docker-compose down
docker-compose build --no-cache backend
docker-compose up -d
```

#### Database connection failure

```bash
docker compose exec db pg_isready -U postgres
docker compose restart backend
```

### API Key Issues

#### Gemini API error

1. Verify `GEMINI_API_KEY` is correctly set
2. Check quota at [Google AI Studio](https://aistudio.google.com)
3. Free tier: 60 requests/day

### Authentication Issues

#### Token expired

Call `POST /api/v1/auth/refresh` with your refresh token to get a new access token.

### File Upload Issues

#### Unsupported file type

Only `.docx` and `.doc` are accepted.

#### File too large

Increase `MAX_UPLOAD_SIZE_MB` in `.env`.

### Development Issues

#### ModuleNotFoundError

```bash
source backend/.venv/bin/activate
pip install -r backend/requirements.txt
```

#### CORS error

Update `ALLOWED_ORIGINS` in `.env` to include your frontend URL.

### Production Issues

#### SECRET_KEY validation error

```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

Copy the output as your `SECRET_KEY`.
