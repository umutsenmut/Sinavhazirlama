import { Link } from 'react-router-dom';
import Button from '../components/Common/Button';

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-bg-primary)',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      <div>
        <div style={{ fontSize: '6rem', marginBottom: '1rem' }}>😕</div>
        <h1
          style={{
            fontSize: '6rem',
            fontWeight: 900,
            color: 'var(--color-primary)',
            lineHeight: 1,
            marginBottom: '0.5rem',
          }}
        >
          404
        </h1>
        <h2 style={{ marginBottom: '0.75rem' }}>Sayfa Bulunamadı</h2>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
          Aradığınız sayfa mevcut değil veya taşınmış olabilir.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/panel">
            <Button>🏠 Ana Sayfaya Dön</Button>
          </Link>
          <Button variant="ghost" onClick={() => window.history.back()}>
            ← Geri Git
          </Button>
        </div>
      </div>
    </div>
  );
}
