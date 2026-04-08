import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import { getExam, generateExam, downloadExam, triggerDownload } from '../services/exam';
import Button from '../components/Common/Button';
import Alert from '../components/Common/Alert';
import Loading from '../components/Common/Loading';
import { formatDateTime } from '../utils/formatters';
import type { Question } from '../types';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: 'Bekliyor', color: 'var(--color-warning)' },
  generating: { label: 'Oluşturuluyor', color: 'var(--color-info)' },
  completed: { label: 'Tamamlandı', color: 'var(--color-success)' },
  failed: { label: 'Başarısız', color: 'var(--color-danger)' },
};

const QTYPE_LABELS: Record<string, string> = {
  test: 'Test',
  yazili: 'Yazılı',
  dogru_yanlis: 'D/Y',
  bosluk_doldurma: 'Boşluk',
};

export default function ExamDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  const { data: exam, loading, error, refetch } = useFetch(
    () => getExam(parseInt(id!)),
    { deps: [id] }
  );

  const handleGenerate = async () => {
    if (!exam) return;
    setGenerating(true);
    setGenError(null);
    try {
      await generateExam(exam.id);
      refetch();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        'Sınav oluşturma başarısız.';
      setGenError(typeof msg === 'string' ? msg : 'Hata.');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async (format: 'docx' | 'pdf') => {
    if (!exam) return;
    setDownloading(true);
    try {
      const blob = await downloadExam(exam.id, format);
      triggerDownload(blob, `${exam.title}.${format}`);
    } catch {
      // silent
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return <Loading fullPage />;
  if (error) return <Alert type="error" message={error} />;
  if (!exam) return null;

  const status = STATUS_LABELS[exam.status] ?? STATUS_LABELS.pending;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/sinavlar')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}
          >
            ← Sınavlar
          </button>
          <span style={{ color: 'var(--color-border)' }}>/</span>
          <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>{exam.title}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ marginBottom: '0.25rem' }}>{exam.title}</h1>
            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem', color: 'var(--color-text-muted)', flexWrap: 'wrap' }}>
              <span>📚 {exam.subject}</span>
              {exam.grade && <span>🎓 {exam.grade}. Sınıf</span>}
              <span>📅 {formatDateTime(exam.created_at)}</span>
              <span style={{ color: status.color, fontWeight: 600 }}>● {status.label}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {exam.status === 'pending' && (
              <Button onClick={handleGenerate} loading={generating}>
                ⚡ Soruları Oluştur
              </Button>
            )}
            {exam.status === 'completed' && (
              <>
                <Button variant="secondary" onClick={() => handleDownload('docx')} loading={downloading}>
                  ⬇ Word İndir
                </Button>
                <Button variant="ghost" onClick={() => handleDownload('pdf')} loading={downloading}>
                  ⬇ PDF İndir
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {genError && <Alert type="error" message={genError} dismissible />}
      {exam.status === 'generating' && (
        <Alert type="info" message="Sorular yapay zeka tarafından oluşturuluyor, lütfen bekleyin..." />
      )}

      {/* Info Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
        {[
          { icon: '❓', label: 'Soru Sayısı', value: exam.question_count },
          { icon: '📆', label: 'Hafta Sayısı', value: exam.week_numbers.length },
          { icon: '🗂️', label: 'Soru Tipleri', value: exam.question_types.map(t => QTYPE_LABELS[t] ?? t).join(', ') },
          { icon: '📋', label: 'Haftalar', value: exam.week_numbers.slice(0, 5).join(', ') + (exam.week_numbers.length > 5 ? '…' : '') },
        ].map(card => (
          <div
            key={card.label}
            style={{
              background: 'var(--color-bg-card)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
            }}
          >
            <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{card.icon}</div>
            <div style={{ fontWeight: 700, fontSize: '1.1rem', wordBreak: 'break-word' }}>{card.value}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{card.label}</div>
          </div>
        ))}
      </div>

      {/* Questions */}
      {exam.questions && exam.questions.length > 0 && (
        <div
          style={{
            background: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '1rem 1.5rem',
              borderBottom: '1px solid var(--color-border)',
              fontWeight: 600,
            }}
          >
            Sorular ({exam.questions.length})
          </div>
          <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {exam.questions
              .sort((a, b) => a.order - b.order)
              .map((q, idx) => (
                <QuestionCard key={q.id} question={q} index={idx + 1} />
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

function QuestionCard({ question, index }: { question: Question; index: number }) {
  return (
    <div
      style={{
        borderLeft: '3px solid var(--color-primary)',
        paddingLeft: '1rem',
      }}
    >
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
        <span
          style={{
            fontSize: '0.7rem',
            fontWeight: 700,
            background: 'var(--color-primary-light)',
            color: 'var(--color-primary)',
            padding: '2px 8px',
            borderRadius: '9999px',
            flexShrink: 0,
          }}
        >
          {index}. {QTYPE_LABELS[question.question_type] ?? question.question_type}
        </span>
        {question.kazanim && (
          <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
            {question.kazanim}
          </span>
        )}
      </div>
      <p style={{ margin: '0 0 0.5rem', fontWeight: 500, lineHeight: 1.6 }}>
        {question.question_text}
      </p>
      {question.options && (
        <ol type="A" style={{ paddingLeft: '1.5rem', margin: '0.5rem 0', fontSize: '0.875rem' }}>
          {question.options.map((opt, i) => (
            <li
              key={i}
              style={{
                color:
                  question.correct_answer === String.fromCharCode(65 + i)
                    ? 'var(--color-success)'
                    : 'var(--color-text-secondary)',
                fontWeight:
                  question.correct_answer === String.fromCharCode(65 + i) ? 600 : 400,
              }}
            >
              {opt}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

// Suppress unused import
void Link;
