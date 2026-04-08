import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useFetch } from '../hooks/useFetch';
import { listExams } from '../services/exam';
import { listPlans } from '../services/plan';
import Loading from '../components/Common/Loading';
import Alert from '../components/Common/Alert';
import Button from '../components/Common/Button';
import { formatDate } from '../utils/formatters';

const cardStyle: React.CSSProperties = {
  background: 'var(--color-bg-card)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-lg)',
  padding: '1.5rem',
  boxShadow: 'var(--shadow-sm)',
};

const statStyle: React.CSSProperties = {
  ...cardStyle,
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
};

export default function Dashboard() {
  const { user } = useAuth();
  const { data: examsData, loading: examsLoading, error: examsError } = useFetch(() => listExams(1, 5));
  const { data: plansData, loading: plansLoading } = useFetch(() => listPlans(1, 100));

  const stats = useMemo(() => {
    const completedExams = examsData?.items.filter(e => e.status === 'completed').length ?? 0;
    const totalExams = examsData?.total ?? 0;
    const totalPlans = plansData?.total ?? 0;
    return { completedExams, totalExams, totalPlans };
  }, [examsData, plansData]);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Günaydın';
    if (h < 18) return 'İyi günler';
    return 'İyi akşamlar';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Welcome */}
      <div>
        <h1 style={{ marginBottom: '0.5rem' }}>
          {greeting()}, {user?.full_name?.split(' ')[0]}! 👋
        </h1>
        <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>
          Sınav hazırlama platformuna hoş geldiniz.
        </p>
      </div>

      {/* Stats */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
        }}
      >
        <div style={statStyle}>
          <span style={{ fontSize: '2rem' }}>📋</span>
          <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-primary)' }}>
            {examsLoading ? '…' : stats.totalExams}
          </span>
          <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
            Toplam Sınav
          </span>
        </div>
        <div style={statStyle}>
          <span style={{ fontSize: '2rem' }}>✅</span>
          <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-success)' }}>
            {examsLoading ? '…' : stats.completedExams}
          </span>
          <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
            Tamamlanan Sınav
          </span>
        </div>
        <div style={statStyle}>
          <span style={{ fontSize: '2rem' }}>📅</span>
          <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-warning)' }}>
            {plansLoading ? '…' : stats.totalPlans}
          </span>
          <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
            Yıllık Plan
          </span>
        </div>
        <div style={statStyle}>
          <span style={{ fontSize: '2rem' }}>🏫</span>
          <span
            style={{
              fontSize: '1rem',
              fontWeight: 600,
              color: 'var(--color-text-primary)',
              wordBreak: 'break-word',
            }}
          >
            {user?.school || '—'}
          </span>
          <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Okul</span>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={cardStyle}>
        <h3 style={{ marginBottom: '1rem' }}>Hızlı İşlemler</h3>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Button onClick={() => window.location.href = '/sinavlar'} variant="primary">
            ➕ Yeni Sınav
          </Button>
          <Button onClick={() => window.location.href = '/planlar'} variant="secondary">
            📤 Plan Yükle
          </Button>
        </div>
      </div>

      {/* Recent Exams */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0 }}>Son Sınavlar</h3>
          <Link to="/sinavlar" style={{ fontSize: '0.875rem', color: 'var(--color-primary)' }}>
            Tümünü Gör →
          </Link>
        </div>

        {examsLoading && <Loading />}
        {examsError && <Alert type="error" message={examsError} />}
        {!examsLoading && !examsError && (
          <>
            {!examsData?.items.length ? (
              <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '2rem 0' }}>
                Henüz sınav oluşturmadınız.{' '}
                <Link to="/sinavlar">İlk sınavınızı oluşturun!</Link>
              </p>
            ) : (
              <table>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                    {['Başlık', 'Ders', 'Durum', 'Tarih'].map(h => (
                      <th
                        key={h}
                        style={{
                          textAlign: 'left',
                          padding: '0.5rem 0.75rem',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          color: 'var(--color-text-muted)',
                          textTransform: 'uppercase',
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {examsData.items.map(exam => (
                    <tr
                      key={exam.id}
                      style={{ borderBottom: '1px solid var(--color-border)' }}
                    >
                      <td style={{ padding: '0.75rem' }}>
                        <Link
                          to={`/sinavlar/${exam.id}`}
                          style={{ fontWeight: 500, color: 'var(--color-primary)' }}
                        >
                          {exam.title}
                        </Link>
                      </td>
                      <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>{exam.subject}</td>
                      <td style={{ padding: '0.75rem' }}>
                        <StatusBadge status={exam.status} />
                      </td>
                      <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                        {formatDate(exam.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}
      </div>
    </div>
  );
}

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: 'Bekliyor', color: 'var(--color-warning)', bg: 'var(--color-warning-light)' },
  generating: { label: 'Oluşturuluyor', color: 'var(--color-info)', bg: 'var(--color-info-light)' },
  completed: { label: 'Tamamlandı', color: 'var(--color-success)', bg: 'var(--color-success-light)' },
  failed: { label: 'Başarısız', color: 'var(--color-danger)', bg: 'var(--color-danger-light)' },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_MAP[status] ?? STATUS_MAP.pending;
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 8px',
        borderRadius: '9999px',
        fontSize: '0.75rem',
        fontWeight: 600,
        color: s.color,
        background: s.bg,
      }}
    >
      {s.label}
    </span>
  );
}
