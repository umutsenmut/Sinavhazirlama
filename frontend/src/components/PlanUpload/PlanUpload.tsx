import { useState, useRef, DragEvent } from 'react';
import { uploadPlan } from '../../services/plan';
import { validateFile } from '../../utils/validators';
import { formatFileSize } from '../../utils/formatters';
import Button from '../Common/Button';
import Alert from '../Common/Alert';
import UploadProgress from './UploadProgress';
import type { Plan } from '../../types';
import styles from './PlanUpload.module.css';

const GRADES = ['5', '6', '7', '8', '9', '10', '11', '12'];
const YEARS = ['2024-2025', '2025-2026', '2026-2027'];

interface FormState {
  title: string;
  subject: string;
  grade: string;
  academic_year: string;
  file: File | null;
}

const initial: FormState = {
  title: '',
  subject: '',
  grade: '',
  academic_year: YEARS[0],
  file: null,
};

interface Props {
  onSuccess?: (plan: Plan) => void;
}

export default function PlanUpload({ onSuccess }: Props) {
  const [form, setForm] = useState<FormState>(initial);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [dragOver, setDragOver] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const set = (field: keyof FormState, value: unknown) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) set('file', file);
  };

  const validate = (): boolean => {
    const e: typeof errors = {};
    if (!form.title.trim()) e.title = 'Plan başlığı gereklidir.';
    if (!form.subject.trim()) e.subject = 'Ders gereklidir.';
    if (!form.grade) e.grade = 'Sınıf seçiniz.';
    const fileErr = validateFile(form.file, ['docx', 'doc']);
    if (fileErr) e.file = fileErr;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !form.file) return;
    setUploading(true);
    setApiError(null);
    setSuccess(false);
    try {
      const plan = await uploadPlan(
        {
          title: form.title.trim(),
          subject: form.subject.trim(),
          grade: form.grade,
          academic_year: form.academic_year,
          file: form.file,
        },
        setProgress
      );
      setSuccess(true);
      setForm(initial);
      onSuccess?.(plan);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        'Yükleme başarısız. Lütfen tekrar deneyin.';
      setApiError(typeof msg === 'string' ? msg : 'Hata.');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      {apiError && <Alert type="error" message={apiError} dismissible />}
      {success && (
        <Alert
          type="success"
          message="Plan başarıyla yüklendi! İşleme alınıyor..."
          dismissible
        />
      )}

      <div className={styles.row}>
        <div className={styles.field}>
          <label className={`${styles.label} ${styles.required}`}>Plan Başlığı</label>
          <input
            className={styles.input}
            value={form.title}
            onChange={e => set('title', e.target.value)}
            placeholder="örn. 8. Sınıf Matematik Yıllık Planı"
          />
          {errors.title && <span className={styles.errorText}>{errors.title}</span>}
        </div>

        <div className={styles.field}>
          <label className={`${styles.label} ${styles.required}`}>Ders</label>
          <input
            className={styles.input}
            value={form.subject}
            onChange={e => set('subject', e.target.value)}
            placeholder="örn. Matematik"
          />
          {errors.subject && <span className={styles.errorText}>{errors.subject}</span>}
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label className={`${styles.label} ${styles.required}`}>Sınıf</label>
          <select
            className={styles.select}
            value={form.grade}
            onChange={e => set('grade', e.target.value)}
          >
            <option value="">Sınıf seçiniz</option>
            {GRADES.map(g => (
              <option key={g} value={g}>{g}. Sınıf</option>
            ))}
          </select>
          {errors.grade && <span className={styles.errorText}>{errors.grade}</span>}
        </div>

        <div className={styles.field}>
          <label className={`${styles.label} ${styles.required}`}>Eğitim Yılı</label>
          <select
            className={styles.select}
            value={form.academic_year}
            onChange={e => set('academic_year', e.target.value)}
          >
            {YEARS.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.field}>
        <label className={`${styles.label} ${styles.required}`}>Word Dosyası (.docx)</label>

        {form.file ? (
          <div className={styles.selectedFile}>
            <span className={styles.fileIcon}>📄</span>
            <div className={styles.fileInfo}>
              <div className={styles.fileName}>{form.file.name}</div>
              <div className={styles.fileSize}>{formatFileSize(form.file.size)}</div>
            </div>
            <button
              type="button"
              className={styles.removeFile}
              onClick={() => set('file', null)}
            >
              ×
            </button>
          </div>
        ) : (
          <div
            className={`${styles.uploadArea} ${dragOver ? styles.dragOver : ''}`}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
          >
            <input
              ref={inputRef}
              type="file"
              className={styles.uploadInput}
              accept=".docx,.doc"
              onChange={e => set('file', e.target.files?.[0] ?? null)}
            />
            <div className={styles.uploadIcon}>📤</div>
            <div className={styles.uploadTitle}>Dosyayı sürükleyip bırakın</div>
            <div className={styles.uploadSub}>veya tıklayarak seçin (.docx, .doc, maks. 10 MB)</div>
          </div>
        )}
        {errors.file && <span className={styles.errorText}>{errors.file}</span>}
      </div>

      {uploading && <UploadProgress percent={progress} />}

      <Button type="submit" loading={uploading} fullWidth>
        Planı Yükle
      </Button>
    </form>
  );
}
