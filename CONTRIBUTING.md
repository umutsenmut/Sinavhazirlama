# Katkıda Bulunma Rehberi / Contributing Guide

[Türkçe](#türkçe) · [English](#english)

---

## Türkçe

Sınavhazırlama projesine katkıda bulunmak istediğiniz için teşekkürler! Bu rehber süreci kolaylaştırmak için hazırlanmıştır.

### 📋 Davranış Kuralları

Tüm katkıcılardan saygılı ve yapıcı bir iletişim beklenmektedir. Ayrımcılık, taciz ve saldırgan dil kabul edilmemektedir.

### 🛠️ Geliştirme Ortamı Kurulumu

#### Ön Koşullar

- Python 3.11+
- Node.js 20+
- PostgreSQL 15+ (veya Docker)
- Git

#### Yerel Kurulum

```bash
# 1. Depoyu fork'layın ve klonlayın
git clone https://github.com/your-username/Sinavhazirlama.git
cd Sinavhazirlama

# 2. Backend sanal ortamı
cd backend
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# 3. Frontend bağımlılıkları
cd ../frontend
npm install

# 4. Ortam değişkenleri
cp ../.env.example ../.env
# .env dosyasını düzenleyin
```

#### Docker ile Hızlı Başlangıç

```bash
docker compose up --build
```

### 📐 Kodlama Standartları

#### Backend (Python)

- **Stil:** PEP 8, max satır uzunluğu 120 karakter
- **Tip İpuçları:** Tüm fonksiyonlar için zorunlu (`from __future__ import annotations`)
- **Linting:** Flake8 (`flake8 app/ tests/ --max-line-length=120`)
- **Dokümantasyon:** Docstring zorunlu – Türkçe yazılabilir
- **Test:** Her yeni özellik için pytest testi eklenmeli

```python
# Doğru örnek
async def create_exam(payload: ExamCreate, workspace_id: int) -> Exam:
    """Yeni sınav oluşturur ve kaydeder."""
    ...
```

#### Frontend (TypeScript/React)

- **Stil:** ESLint + Prettier (`.eslintrc` kuralları)
- **Bileşenler:** Functional component, arrow function tercih edilmeli
- **Tip Güvenliği:** `any` kullanımından kaçının
- **Linting:** `npm run lint`

```typescript
// Doğru örnek
interface ExamCardProps {
  exam: Exam;
  onDelete: (id: number) => void;
}

const ExamCard: React.FC<ExamCardProps> = ({ exam, onDelete }) => {
  ...
};
```

### 🌿 Branch Stratejisi

```
main          → Üretim kodu (sadece PR ile)
develop       → Geliştirme (staging deploy)
feature/xxx   → Yeni özellikler
fix/xxx       → Hata düzeltmeleri
docs/xxx      → Belgelendirme güncellemeleri
```

### 📝 Commit Mesajı Formatı

[Conventional Commits](https://www.conventionalcommits.org/) formatı kullanılmaktadır:

```
<tür>(<kapsam>): <açıklama>

[opsiyonel gövde]

[opsiyonel alt bilgi]
```

**Tür seçenekleri:**

| Tür | Kullanım |
|---|---|
| `feat` | Yeni özellik |
| `fix` | Hata düzeltmesi |
| `docs` | Belgelendirme |
| `style` | Biçimlendirme (işlevsel değişiklik yok) |
| `refactor` | Yeniden düzenleme |
| `test` | Test ekleme/düzeltme |
| `chore` | Araç/bağımlılık güncellemesi |

**Örnekler:**

```bash
feat(exams): sınav kopyalama özelliği eklendi
fix(auth): refresh token süre aşımı hatası düzeltildi
docs(api): plan endpoint örnekleri güncellendi
```

### 🔄 Pull Request Süreci

1. `develop` branch'ini güncel tutun: `git pull origin develop`
2. Feature branch oluşturun: `git checkout -b feature/ozellik-adi`
3. Değişikliklerinizi yapın ve commit edin
4. Testlerin geçtiğini doğrulayın: `cd backend && pytest tests/`
5. Lint kontrolü yapın: `flake8 app/` ve `cd frontend && npm run lint`
6. `develop` branch'ına PR açın
7. PR açıklamasını doldurun (şablon otomatik gelir)

### ✅ İnceleme Kriterleri

PR'ınızın kabul edilmesi için:

- [ ] Tüm CI kontrolleri geçmeli (lint, tests)
- [ ] Mevcut testler kırılmamalı
- [ ] Yeni özellikler için test eklenmeli
- [ ] Gerekli belgelendirme güncellenmiş olmalı
- [ ] Commit mesajları konvansiyona uygun olmalı
- [ ] En az bir reviewer onayı alınmalı

### 🐛 Hata Bildirme

[Hata raporu şablonunu](.github/ISSUE_TEMPLATE/bug_report.md) kullanarak GitHub Issues üzerinden bildirin.

### 💡 Özellik Önerme

[Özellik isteği şablonunu](.github/ISSUE_TEMPLATE/feature_request.md) kullanarak GitHub Issues üzerinden önerin.

---

## English

Thank you for your interest in contributing to Sinavhazirlama!

### Development Environment Setup

#### Prerequisites

- Python 3.11+
- Node.js 20+
- PostgreSQL 15+ (or Docker)
- Git

#### Local Setup

```bash
git clone https://github.com/your-username/Sinavhazirlama.git
cd Sinavhazirlama

# Backend
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Frontend
cd ../frontend
npm install

# Environment
cp ../.env.example ../.env
```

### Coding Standards

#### Backend
- PEP 8, max line length 120
- Type hints required on all functions
- Flake8 linting
- Docstrings required

#### Frontend
- ESLint + Prettier rules
- Functional React components
- TypeScript strict mode; avoid `any`

### Branch Strategy

- `main` → production
- `develop` → staging
- `feature/xxx` → new features
- `fix/xxx` → bug fixes

### Commit Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(scope): description
fix(scope): description
docs(scope): description
```

### Pull Request Process

1. Keep your branch up-to-date with `develop`
2. Create a feature branch
3. Make changes and commit
4. Ensure tests pass: `pytest tests/`
5. Ensure linting passes: `flake8 app/` and `npm run lint`
6. Open a PR targeting `develop`
7. Fill out the PR template

### Review Checklist

- [ ] All CI checks pass
- [ ] No existing tests broken
- [ ] New tests added for new features
- [ ] Documentation updated if needed
- [ ] At least one reviewer approval
