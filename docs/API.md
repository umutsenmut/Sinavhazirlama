# API Dokümantasyonu / API Documentation

Tüm endpoint'ler `/api/v1` ön ekini kullanır.  
Kimlik doğrulama gerektiren endpoint'lerde `Authorization: Bearer <token>` başlığı gönderilmelidir.

---

## Kimlik Doğrulama / Authentication

### POST /auth/register

Yeni kullanıcı kaydı oluşturur ve otomatik olarak bir workspace açar.

**Request Body**
```json
{
  "email": "ogretmen@okul.edu.tr",
  "password": "GucluSifre123!",
  "full_name": "Ayşe Yılmaz",
  "school_name": "Atatürk İlkokulu"
}
```

**Response** `201 Created`
```json
{
  "id": 1,
  "email": "ogretmen@okul.edu.tr",
  "full_name": "Ayşe Yılmaz",
  "school_name": "Atatürk İlkokulu",
  "workspace_id": 1,
  "is_active": true,
  "created_at": "2024-01-15T10:30:00Z"
}
```

**Hata Yanıtları**

| Kod | Açıklama |
|---|---|
| `409 Conflict` | Bu e-posta adresi zaten kayıtlı |
| `422 Unprocessable Entity` | Doğrulama hatası |

---

### POST /auth/login

E-posta ve şifre ile giriş yapar, JWT token çifti döner.

**Request Body**
```json
{
  "email": "ogretmen@okul.edu.tr",
  "password": "GucluSifre123!"
}
```

**Response** `200 OK`
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 1800
}
```

**Hata Yanıtları**

| Kod | Açıklama |
|---|---|
| `401 Unauthorized` | E-posta veya şifre hatalı |
| `403 Forbidden` | Hesap deaktif |

---

### POST /auth/refresh

Refresh token kullanarak yeni access token üretir.

**Query Parameter**
```
POST /api/v1/auth/refresh?refresh_token=eyJhbGci...
```

**Response** `200 OK` – Login ile aynı format

---

### GET /auth/me

Mevcut kullanıcı bilgilerini döner. `Authorization` başlığı gereklidir.

**Response** `200 OK`
```json
{
  "id": 1,
  "email": "ogretmen@okul.edu.tr",
  "full_name": "Ayşe Yılmaz",
  "school_name": "Atatürk İlkokulu",
  "workspace_id": 1,
  "is_active": true,
  "created_at": "2024-01-15T10:30:00Z"
}
```

---

## Sınavlar / Exams

Tüm sınav endpoint'leri `Authorization` başlığı gerektirir.

### POST /exams

Yeni sınav oluşturur.

**Request Body**
```json
{
  "title": "5. Sınıf Matematik 1. Dönem Sınavı",
  "grade": "5",
  "subject": "Matematik",
  "week_number": 12
}
```

**Response** `201 Created`
```json
{
  "id": 1,
  "workspace_id": 1,
  "title": "5. Sınıf Matematik 1. Dönem Sınavı",
  "grade": "5",
  "subject": "Matematik",
  "week_number": 12,
  "status": "pending",
  "questions": [],
  "created_at": "2024-01-15T10:30:00Z"
}
```

---

### GET /exams

Çalışma alanına ait sınavları listeler.

**Query Parameters**
| Parametre | Tür | Varsayılan | Açıklama |
|---|---|---|---|
| `page` | integer | `1` | Sayfa numarası |
| `size` | integer | `20` | Sayfa başı kayıt sayısı |

**Response** `200 OK`
```json
{
  "items": [
    {
      "id": 1,
      "title": "5. Sınıf Matematik 1. Dönem Sınavı",
      "grade": "5",
      "subject": "Matematik",
      "week_number": 12,
      "status": "completed",
      "questions": [...],
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "size": 20
}
```

---

### GET /exams/{exam_id}

Sınav detayını döner.

**Response** `200 OK` – Tek sınav objesi (sorular dahil)

**Hata:** `404` – Sınav bulunamadı

---

### DELETE /exams/{exam_id}

Sınavı siler.

**Response** `200 OK`
```json
{
  "mesaj": "Sınav başarıyla silindi"
}
```

---

### POST /exams/{exam_id}/generate

Sınav için Gemini AI ile sorular üretir. Uzun sürebilir (5-30 sn).

**Response** `200 OK` – Sorular dolu sınav objesi

**Sınav Durumları:**

| Durum | Açıklama |
|---|---|
| `pending` | Henüz üretim başlamadı |
| `generating` | AI işlemi devam ediyor |
| `completed` | Sorular hazır |
| `failed` | Üretim başarısız |

**Hata Yanıtları**

| Kod | Açıklama |
|---|---|
| `404` | Sınav bulunamadı |
| `409 Conflict` | Sınav zaten üretiliyor |
| `503 Service Unavailable` | Gemini API hatası |

---

## Planlar / Plans

### POST /plans

Word (.docx veya .doc) dokümanı yükler ve kazanımları çıkarır.

**Request:** `multipart/form-data`

| Alan | Tür | Açıklama |
|---|---|---|
| `file` | binary | Word dokümanı (max 10 MB) |

**Response** `201 Created`
```json
{
  "id": 1,
  "workspace_id": 1,
  "filename": "matematik-yillik-plan.docx",
  "objectives": [
    "Doğal sayılarla dört işlem yapabilir",
    "Kesirleri karşılaştırabilir"
  ],
  "created_at": "2024-01-15T10:30:00Z"
}
```

**Hata Yanıtları**

| Kod | Açıklama |
|---|---|
| `413` | Dosya 10 MB sınırını aşıyor |
| `415` | Desteklenmeyen dosya türü |

---

### GET /plans

Planları listeler.

**Query Parameters:** `page`, `size` (sınav listesi ile aynı)

---

### GET /plans/{plan_id}

Plan detayını döner.

---

## Sağlık Kontrolü / Health Check

### GET /health

Uygulama ve veritabanı durumunu döner. Kimlik doğrulama gerektirmez.

**Response** `200 OK`
```json
{
  "durum": "sağlıklı",
  "veritabani": "bağlı",
  "versiyon": "1.0.0"
}
```

---

## Hata Kodları

| HTTP Kodu | Kod | Açıklama |
|---|---|---|
| 400 | `HATA` | Geçersiz istek |
| 401 | `YETKİSİZ` | Token eksik veya geçersiz |
| 403 | `YASAKLI` | Erişim izni yok |
| 404 | `BULUNAMADI` | Kaynak bulunamadı |
| 409 | `ÇAKIŞMA` | Kaynak zaten mevcut |
| 413 | `ÇOK_BÜYÜK` | Dosya boyutu aşıldı |
| 415 | `DESTEKLENMEYEN_TÜR` | Desteklenmeyen medya türü |
| 422 | `DOĞRULAMA_HATASI` | Giriş doğrulama hatası |
| 500 | `SUNUCU_HATASI` | Sunucu iç hatası |
| 503 | `AI_HATASI` | Gemini API hatası |

**Standart hata yanıt formatı:**
```json
{
  "hata": "Hata açıklaması",
  "kod": "HATA_KODU",
  "ayrintilar": {}
}
```

---

## Kimlik Doğrulama Akışı

```
İstemci                              API
  │                                   │
  ├─ POST /auth/login ──────────────► │
  │◄── access_token + refresh_token ──┤
  │                                   │
  ├─ GET /exams (Bearer token) ──────► │
  │◄── sınav listesi ─────────────────┤
  │                                   │
  │  (access_token süresi doldu)      │
  │                                   │
  ├─ POST /auth/refresh ─────────────► │
  │◄── yeni access_token ─────────────┤
```
