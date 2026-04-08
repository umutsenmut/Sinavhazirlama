import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createExam } from '../../services/exam';
import { listPlans } from '../../services/plan';
import { useFetch } from '../../hooks/useFetch';
import QuestionTypeSelector from './QuestionTypeSelector';
import WeekSelector from './WeekSelector';
import Button from '../Common/Button';
import Alert from '../Common/Alert';
import type { QuestionType, CreateExamPayload } from '../../types';
import styles from './ExamPanel.module.css';

const GRADES = ['5', '6', '7', '8', '9', '10', '11', '12'];

interface FormState {
  title: string;
  subject: string;
  grade: string;
  plan_id: string;
  question_count: string;
  question_types: QuestionType[];
  week_numbers: number[];
}

const initial: FormState = {
  title: '',
  subject: '',
  grade: '',
  plan_id: '',
  question_count: '20',
  question_types: ['test'],
  week_numbers: [],
};

export default function ExamPanel() {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>(initial);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const { data: plansData } = useFetch(() => listPlans(1, 100));

  const set = (field: keyof FormState, value: unknown) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const validate = (): boolean => {
    const e: typeof errors = {};
    if (!form.title.trim()) e.title = 'Sınav başlığı gereklidir.';
    if (!form.subject.trim()) e.subject = 'Ders adı gereklidir.';
    if (form.question_types.length === 0) e.question_types = 'En az bir soru tipi seçiniz.';
    if (form.week_numbers.length === 0) e.week_numbers = 'En az bir hafta seçiniz.';
    const qc = parseInt(form.question_count);
    if (isNaN(qc) || qc < 1 || qc > 100) e.question_count = 'Soru sayısı 1-100 arasında olmalıdır.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setApiError(null);
    try {
      const payload: CreateExamPayload = {
        title: form.title.trim(),
        subject: form.subject.trim(),
        grade: form.grade || undefined,
        plan_id: form.plan_id ? parseInt(form.plan_id) : undefined,
        question_count: parseInt(form.question_count),
        question_types: form.question_types,
        week_numbers: form.week_numbers,
      };
      const exam = await createExam(payload);
      navigate(`/sinavlar/${exam.id}`);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        'Sınav oluşturulurken bir hata oluştu.';
      setApiError(typeof msg === 'string' ? msg : 'Hata.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className={styles.panel} onSubmit={handleSubmit} noValidate>
      <div className={styles.panelHeader}>
        <h2 className={styles.panelTitle}>📋 Yeni Sınav Oluştur</h2>
      </div>

      <div className={styles.panelBody}>
        {apiError && <Alert type="error" message={apiError} dismissible />}

        <div className={styles.row}>
          <div className={styles.field}>
            <label className={`${styles.label} ${styles.required}`}>Sınav Başlığı</label>
            <input
              className={`${styles.input} ${errors.title ? styles.inputError : ''}`}
              value={form.title}
              onChange={e => set('title', e.target.value)}
              placeholder="örn. 8. Sınıf 1. Dönem Sınavı"
            />
            {errors.title && <span className={styles.errorText}>{errors.title}</span>}
          </div>

          <div className={styles.field}>
            <label className={`${styles.label} ${styles.required}`}>Ders</label>
            <input
              className={`${styles.input} ${errors.subject ? styles.inputError : ''}`}
              value={form.subject}
              onChange={e => set('subject', e.target.value)}
              placeholder="örn. Matematik"
            />
            {errors.subject && <span className={styles.errorText}>{errors.subject}</span>}
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label}>Sınıf Seviyesi</label>
            <select
              className={styles.select}
              value={form.grade}
              onChange={e => set('grade', e.target.value)}
            >
              <option value="">Seçiniz</option>
              {GRADES.map(g => (
                <option key={g} value={g}>{g}. Sınıf</option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Soru Sayısı</label>
            <input
              type="number"
              min={1}
              max={100}
              className={`${styles.input} ${errors.question_count ? styles.inputError : ''}`}
              value={form.question_count}
              onChange={e => set('question_count', e.target.value)}
            />
            {errors.question_count && (
              <span className={styles.errorText}>{errors.question_count}</span>
            )}
          </div>
        </div>

        {plansData && plansData.items.length > 0 && (
          <div className={styles.field}>
            <label className={styles.label}>Yıllık Plan (opsiyonel)</label>
            <select
              className={styles.select}
              value={form.plan_id}
              onChange={e => set('plan_id', e.target.value)}
            >
              <option value="">Plan seçiniz</option>
              {plansData.items.map(p => (
                <option key={p.id} value={p.id}>{p.title} — {p.grade}. Sınıf</option>
              ))}
            </select>
          </div>
        )}

        <div className={styles.field}>
          <label className={`${styles.label} ${styles.required}`}>Soru Tipleri</label>
          <QuestionTypeSelector
            selected={form.question_types}
            onChange={v => set('question_types', v)}
          />
          {errors.question_types && (
            <span className={styles.errorText}>{errors.question_types}</span>
          )}
        </div>

        <div className={styles.field}>
          <label className={`${styles.label} ${styles.required}`}>Haftalar</label>
          <WeekSelector
            selected={form.week_numbers}
            onChange={v => set('week_numbers', v)}
          />
          {errors.week_numbers && (
            <span className={styles.errorText}>{errors.week_numbers}</span>
          )}
        </div>
      </div>

      <div className={styles.panelFooter}>
        <Button type="button" variant="ghost" onClick={() => setForm(initial)}>
          Sıfırla
        </Button>
        <Button type="submit" loading={submitting}>
          Sınav Oluştur
        </Button>
      </div>
    </form>
  );
}
