import { useState } from 'react';
import { useFetch } from '../hooks/useFetch';
import { listPlans, deletePlan } from '../services/plan';
import PlanUpload from '../components/PlanUpload/PlanUpload';
import Button from '../components/Common/Button';
import Modal from '../components/Common/Modal';
import Alert from '../components/Common/Alert';
import Loading from '../components/Common/Loading';
import { formatDate } from '../utils/formatters';
import type { Plan } from '../types';

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: 'Bekliyor', color: 'var(--color-warning)', bg: 'var(--color-warning-light)' },
  processing: { label: 'İşleniyor', color: 'var(--color-info)', bg: 'var(--color-info-light)' },
  completed: { label: 'Hazır', color: 'var(--color-success)', bg: 'var(--color-success-light)' },
  failed: { label: 'Başarısız', color: 'var(--color-danger)', bg: 'var(--color-danger-light)' },
};

export default function Plans() {
  const [showUpload, setShowUpload] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Plan | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const { data, loading, error, refetch } = useFetch(() => listPlans(1, 50));

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deletePlan(deleteTarget.id);
      setDeleteTarget(null);
      refetch();
    } catch {
      setDeleteError('Plan silinemedi. Lütfen tekrar deneyin.');
    } finally {
      setDeleting(false);
    }
  };

  const card: React.CSSProperties = {
    background: 'var(--color-bg-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-lg)',
    padding: '1.5rem',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ marginBottom: '0.25rem' }}>📅 Yıllık Planlar</h1>
          <p style={{ color: 'var(--color-text-muted)', margin: 0, fontSize: '0.875rem' }}>
            Müfredat planlarınızı yükleyin ve yönetin
          </p>
        </div>
        <Button onClick={() => setShowUpload(s => !s)}>
          {showUpload ? '✕ İptal' : '📤 Plan Yükle'}
        </Button>
      </div>

      {showUpload && (
        <div style={card}>
          <h3 style={{ marginBottom: '1.25rem' }}>📤 Yeni Plan Yükle</h3>
          <PlanUpload
            onSuccess={() => {
              setShowUpload(false);
              refetch();
            }}
          />
        </div>
      )}

      <div style={card}>
        {loading && <Loading />}
        {error && <Alert type="error" message={error} />}
        {!loading && !error && (
          <>
            {!data?.items.length ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
                <p>Henüz plan yüklemediniz.</p>
                <Button onClick={() => setShowUpload(true)} style={{ marginTop: '1rem' }}>
                  İlk Planı Yükle
                </Button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                {data.items.map(plan => {
                  const s = STATUS_LABELS[plan.status] ?? STATUS_LABELS.pending;
                  return (
                    <div
                      key={plan.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        padding: '1rem 0',
                        borderBottom: '1px solid var(--color-border)',
                        flexWrap: 'wrap',
                      }}
                    >
                      <span style={{ fontSize: '1.5rem' }}>📄</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{plan.title}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                          <span>📚 {plan.subject}</span>
                          <span>🎓 {plan.grade}. Sınıf</span>
                          <span>📆 {plan.academic_year}</span>
                          {plan.kazanim_count !== undefined && (
                            <span>✅ {plan.kazanim_count} kazanım</span>
                          )}
                          <span>🗓 {formatDate(plan.created_at)}</span>
                        </div>
                      </div>
                      <span
                        style={{
                          padding: '3px 10px',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          color: s.color,
                          background: s.bg,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {s.label}
                      </span>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => setDeleteTarget(plan)}
                      >
                        Sil
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      <Modal
        open={!!deleteTarget}
        title="Planı Sil"
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
          <strong>{deleteTarget?.title}</strong> planını silmek istediğinize emin misiniz?
          Bu plan ile ilişkili sınavlar etkilenebilir.
        </p>
      </Modal>
    </div>
  );
}
