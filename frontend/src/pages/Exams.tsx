import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import { listExams, deleteExam } from '../services/exam';
import ExamPanel from '../components/ExamPanel/ExamPanel';
import Button from '../components/Common/Button';
import Modal from '../components/Common/Modal';
import Alert from '../components/Common/Alert';
import Loading from '../components/Common/Loading';
import { formatDate } from '../utils/formatters';
import type { Exam } from '../types';

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: 'Bekliyor', color: 'var(--color-warning)', bg: 'var(--color-warning-light)' },
  generating: { label: 'Oluşturuluyor', color: 'var(--color-info)', bg: 'var(--color-info-light)' },
  completed: { label: 'Tamamlandı', color: 'var(--color-success)', bg: 'var(--color-success-light)' },
  failed: { label: 'Başarısız', color: 'var(--color-danger)', bg: 'var(--color-danger-light)' },
};

const card: React.CSSProperties = {
  background: 'var(--color-bg-card)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-lg)',
  padding: '1.5rem',
  boxShadow: 'var(--shadow-sm)',
};

export default function Exams() {
  const [showCreate, setShowCreate] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Exam | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const { data, loading, error, refetch } = useFetch(() => listExams(1, 50));

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteExam(deleteTarget.id);
      setDeleteTarget(null);
      refetch();
    } catch {
      setDeleteError('Sınav silinemedi. Lütfen tekrar deneyin.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ marginBottom: '0.25rem' }}>📋 Sınavlar</h1>
          <p style={{ color: 'var(--color-text-muted)', margin: 0, fontSize: '0.875rem' }}>
            Tüm sınavlarınızı yönetin
          </p>
        </div>
        <Button onClick={() => setShowCreate(s => !s)}>
          {showCreate ? '✕ İptal' : '➕ Yeni Sınav'}
        </Button>
      </div>

      {showCreate && <ExamPanel />}

      <div style={card}>
        {loading && <Loading />}
        {error && <Alert type="error" message={error} />}
        {!loading && !error && (
          <>
            {!data?.items.length ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
                <p>Henüz sınav oluşturmadınız.</p>
                <Button onClick={() => setShowCreate(true)} style={{ marginTop: '1rem' }}>
                  İlk Sınavı Oluştur
                </Button>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                      {['Başlık', 'Ders', 'Sınıf', 'Soru Sayısı', 'Durum', 'Tarih', 'İşlemler'].map(h => (
                        <th
                          key={h}
                          style={{
                            textAlign: 'left',
                            padding: '0.75rem',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            color: 'var(--color-text-muted)',
                            textTransform: 'uppercase',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.items.map(exam => {
                      const s = STATUS_LABELS[exam.status] ?? STATUS_LABELS.pending;
                      return (
                        <tr
                          key={exam.id}
                          style={{ borderBottom: '1px solid var(--color-border)' }}
                        >
                          <td style={{ padding: '0.875rem 0.75rem' }}>
                            <Link
                              to={`/sinavlar/${exam.id}`}
                              style={{ color: 'var(--color-primary)', fontWeight: 500 }}
                            >
                              {exam.title}
                            </Link>
                          </td>
                          <td style={{ padding: '0.875rem 0.75rem', fontSize: '0.875rem' }}>
                            {exam.subject}
                          </td>
                          <td style={{ padding: '0.875rem 0.75rem', fontSize: '0.875rem' }}>
                            {exam.grade ? `${exam.grade}. Sınıf` : '—'}
                          </td>
                          <td style={{ padding: '0.875rem 0.75rem', fontSize: '0.875rem', textAlign: 'center' }}>
                            {exam.question_count}
                          </td>
                          <td style={{ padding: '0.875rem 0.75rem' }}>
                            <span
                              style={{
                                padding: '3px 10px',
                                borderRadius: '9999px',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                color: s.color,
                                background: s.bg,
                              }}
                            >
                              {s.label}
                            </span>
                          </td>
                          <td style={{ padding: '0.875rem 0.75rem', fontSize: '0.875rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                            {formatDate(exam.created_at)}
                          </td>
                          <td style={{ padding: '0.875rem 0.75rem' }}>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.location.href = `/sinavlar/${exam.id}`}
                              >
                                Görüntüle
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => setDeleteTarget(exam)}
                              >
                                Sil
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Confirm Modal */}
      <Modal
        open={!!deleteTarget}
        title="Sınavı Sil"
        onClose={() => setDeleteTarget(null)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
              İptal
            </Button>
            <Button variant="danger" onClick={handleDelete} loading={deleting}>
              Sil
            </Button>
          </>
        }
      >
        {deleteError && <Alert type="error" message={deleteError} />}
        <p>
          <strong>{deleteTarget?.title}</strong> sınavını silmek istediğinize emin misiniz? Bu
          işlem geri alınamaz.
        </p>
      </Modal>
    </div>
  );
}
