# Özellikler / Features

Bu belge Sınavhazırlama platformunun mevcut ve planlanan tüm özelliklerini açıklamaktadır.

---

## ✅ Mevcut Özellikler

### 👤 Kullanıcı Yönetimi

- **Kayıt:** E-posta, şifre, ad soyad ve okul adıyla hesap oluşturma
- **Giriş:** E-posta + şifre ile JWT tabanlı kimlik doğrulama
- **Token Yenileme:** Güvenli refresh token mekanizması (7 gün geçerli)
- **Otomatik Workspace:** Kayıt sırasında izole çalışma alanı oluşturma
- **Hesap Deaktivasyonu:** Yönetici tarafından hesap askıya alma

### 🏢 Çalışma Alanı (Workspace)

- **Tam İzolasyon:** Her öğretmenin verileri diğerlerinden tamamen ayrıktır
- **URL Dostu Slug:** `atatürk-ilkokulu-ayse-yilmaz` formatında benzersiz tanımlayıcı
- **Sahiplik:** Workspace sahibi tüm kaynaklara erişebilir

### 📄 Yıllık Plan Yönetimi

- **Word Dosyası Yükleme:** `.docx` ve `.doc` formatı desteği
- **Otomatik Ayrıştırma:** Belgedeki kazanımları yapay zeka ile çıkarma
- **Kazanım Listesi:** Yüklenen plandan elde edilen öğrenme hedefleri
- **Plan Listeleme:** Yüklenen tüm planları sayfalı görüntüleme
- **Boyut Limiti:** Maksimum 10 MB (yapılandırılabilir)

### 📝 Sınav Yönetimi

- **Sınav Oluşturma:** Sınıf, ders ve hafta numarası ile sınav tanımlama
- **Sınav Listeleme:** Çalışma alanına ait sınavları sayfalı görüntüleme
- **Sınav Detayı:** Sınav ve sorular ile birlikte detaylı görünüm
- **Sınav Silme:** Sınav ve ilgili soruların kalıcı olarak kaldırılması
- **Durum Takibi:** `pending` → `generating` → `completed` / `failed`

### 🤖 Yapay Zeka Soru Üretimi

- **Model:** Google Gemini 1.5 Pro
- **Türkçe Destek:** Türkçe dil üretimi
- **Çoktan Seçmeli:** A/B/C/D şıklı sorular
- **Açık Uçlu:** Serbest cevap gerektiren sorular
- **Cevap Anahtarı:** Her soru için doğru cevap kaydı
- **Sıralama:** Sorular numaralı sırayla saklanır
- **Müfredat Uyumu:** Sınıf seviyesi ve derse göre uyarlanmış içerik

### 🔌 API

- **RESTful:** HTTP standartlarına uygun endpoint tasarımı
- **JSON:** Tüm yanıtlar JSON formatında
- **Swagger UI:** Geliştirme modunda interaktif API dokümantasyonu
- **Sağlık Kontrolü:** `/api/v1/health` endpoint'i
- **Hata Mesajları:** Türkçe hata açıklamaları

### 🐳 Altyapı

- **Docker Compose:** Tek komutla tam yığın başlatma
- **PostgreSQL 15:** Üretim kalitesinde veritabanı
- **Redis Desteği:** Opsiyonel önbellekleme (profil ile aktif edilir)
- **Async:** Tüm I/O işlemleri asenkron
- **Healthcheck:** Tüm container'lar için sağlık kontrolü

---

## 🚀 Planlanan Özellikler

### Yakın Vadeli (v1.1)

- [ ] **Şifremi Unuttum:** E-posta ile şifre sıfırlama
- [ ] **Sınav Düzenleme:** Üretilen soruları manuel düzenleme
- [ ] **Soru Yenileme:** Tek soruyu yeniden üretme
- [ ] **PDF Çıktı:** Sınavı PDF olarak indirme
- [ ] **Word Çıktı:** Sınavı .docx olarak indirme

### Orta Vadeli (v1.2)

- [ ] **Soru Bankası:** Onaylanan soruları arşivleme
- [ ] **Etiketleme:** Sorulara konu/kazanım etiketi ekleme
- [ ] **Filtreleme:** Konu, sınıf ve tarihe göre filtreleme
- [ ] **İstatistikler:** Üretilen soru sayısı, kullanım raporu
- [ ] **E-posta Bildirimi:** Üretim tamamlandığında bildirim

### Uzun Vadeli (v2.0)

- [ ] **Çok Üyeli Workspace:** Aynı okuldaki öğretmenler arası paylaşım
- [ ] **Soru Paylaşımı:** Aynı ders için sorular arasında paylaşım
- [ ] **LMS Entegrasyonu:** Moodle ve Google Classroom bağlantısı
- [ ] **Öğrenci Değerlendirme:** Sınav yanıtlarını kaydetme ve notlama
- [ ] **Admin Paneli:** Kullanıcı ve workspace yönetimi
- [ ] **Google Drive Senkronizasyonu:** Sınavları Drive'a otomatik kaydetme
- [ ] **Çok Dil Desteği:** Türkçe dışındaki dersler için İngilizce destek

---

## 📊 Teknik Limitler

| Limit | Varsayılan | Ayarlanabilir |
|---|---|---|
| Maksimum dosya boyutu | 10 MB | ✅ `MAX_UPLOAD_SIZE_MB` |
| Access token süresi | 30 dakika | ✅ `ACCESS_TOKEN_EXPIRE_MINUTES` |
| Refresh token süresi | 7 gün | ✅ `REFRESH_TOKEN_EXPIRE_DAYS` |
| Sayfa başı kayıt | 20 | ✅ query param `size` |
| Gemini free tier | 60 istek/gün | ❌ Google kotası |
