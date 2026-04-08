import { useAuth } from '../hooks/useAuth';
import SettingsComponent from '../components/Settings/Settings';

export default function Settings() {
  const { user } = useAuth();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ marginBottom: '0.25rem' }}>⚙️ Ayarlar</h1>
        <p style={{ color: 'var(--color-text-muted)', margin: 0, fontSize: '0.875rem' }}>
          {user?.email}
        </p>
      </div>
      <SettingsComponent />
    </div>
  );
}
