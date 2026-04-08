from __future__ import annotations

import json
import logging
from typing import Any

from app.core.gemini import extract_json_from_response, generate_content
from app.core.exceptions import GeminiException
from app.models.exam import Exam

logger = logging.getLogger(__name__)

QUESTION_TYPE_LABELS = {
    "test": "Çoktan Seçmeli (4 şık: A, B, C, D)",
    "text": "Açık Uçlu (yazılı cevap)",
    "tf": "Doğru/Yanlış",
    "bosluk": "Boşluk Doldurma",
}


class GeminiService:
    def _build_prompt(self, exam: Exam) -> str:
        type_desc = ", ".join(
            QUESTION_TYPE_LABELS.get(t, t)
            for t in ["test", "text", "tf", "bosluk"]
        )
        return f"""Sen Türk Milli Eğitim Bakanlığı müfredatına uygun soru hazırlayan uzman bir öğretmensin.

Aşağıdaki bilgilere göre sınav soruları oluştur:

- Ders: {exam.subject}
- Sınıf: {exam.grade}. Sınıf
- Hafta: {exam.week_number if exam.week_number else "Belirtilmemiş"}
- Başlık: {exam.title}

GÖREV: Bu ders ve sınıf seviyesine uygun, öğrenci başarısını ölçen 20 adet soru hazırla.
Karışık soru tipleri kullan: Çoktan seçmeli, açık uçlu, doğru/yanlış ve boşluk doldurma.

ZORUNLU FORMAT: Yanıtını YALNIZCA aşağıdaki JSON formatında ver, başka hiçbir metin ekleme:

```json
{{
  "sorular": [
    {{
      "type": "test",
      "question": "Soru metni buraya...",
      "options": ["A) Seçenek 1", "B) Seçenek 2", "C) Seçenek 3", "D) Seçenek 4"],
      "correct_answer": "A",
      "points": 5
    }},
    {{
      "type": "tf",
      "question": "İfade doğru mudur?",
      "options": ["Doğru", "Yanlış"],
      "correct_answer": "Doğru",
      "points": 5
    }},
    {{
      "type": "bosluk",
      "question": "_____ Türkiye'nin başkentidir.",
      "options": null,
      "correct_answer": "Ankara",
      "points": 5
    }},
    {{
      "type": "text",
      "question": "Açık uçlu soru metni...",
      "options": null,
      "correct_answer": "Örnek cevap veya anahtar noktalar",
      "points": 10
    }}
  ]
}}
```

KURALLAR:
- Tüm sorular Türkçe olmalı
- Sorular {exam.grade}. sınıf seviyesine uygun olmalı
- Çoktan seçmeli sorularda yalnızca bir doğru cevap olmalı
- Toplam 20 soru üret
- Sorular özgün ve müfredata uygun olmalı"""

    async def generate_questions_for_exam(self, exam: Exam) -> list[dict[str, Any]]:
        """Sınav için Gemini'den soru listesi üretir."""
        prompt = self._build_prompt(exam)
        raw_response = await generate_content(prompt)

        try:
            data = extract_json_from_response(raw_response)
        except GeminiException:
            raise

        if isinstance(data, dict) and "sorular" in data:
            questions = data["sorular"]
        elif isinstance(data, list):
            questions = data
        else:
            raise GeminiException("Yapay zeka yanıtı beklenen soru formatında değil")

        return self._validate_questions(questions)

    def _validate_questions(self, questions: list[Any]) -> list[dict[str, Any]]:
        """Üretilen soruları doğrular ve temizler."""
        valid: list[dict[str, Any]] = []
        allowed_types = {"test", "text", "tf", "bosluk"}

        for i, q in enumerate(questions):
            if not isinstance(q, dict):
                logger.warning("Soru %d dict değil, atlanıyor", i + 1)
                continue

            q_type = str(q.get("type", "test")).lower()
            if q_type not in allowed_types:
                q_type = "test"

            question_text = str(q.get("question", "")).strip()
            if not question_text:
                logger.warning("Soru %d boş metin, atlanıyor", i + 1)
                continue

            options = q.get("options")
            if isinstance(options, list):
                options_json = json.dumps(options, ensure_ascii=False)
            else:
                options_json = None

            valid.append({
                "type": q_type,
                "question": question_text,
                "options": options_json,
                "correct_answer": str(q.get("correct_answer", "")),
                "points": max(1, min(20, int(q.get("points", 5)))),
            })

        if not valid:
            raise GeminiException("Yapay zeka geçerli soru üretemedi. Lütfen tekrar deneyin.")

        return valid
