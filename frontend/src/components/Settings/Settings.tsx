import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { updateProfile } from '../../services/auth';
import { validatePassword } from '../../utils/validators';
import SettingsForm from './SettingsForm';
import Alert from '../Common/Alert';
import styles from './Settings.module.css';

export default function SettingsComponent() {
  const { user, refreshUser } = useAuth();

  // Profile form
  const [profile, setProfile] = useState({
    full_name: user?.full_name ?? '',
    school: user?.school ?? '',
    subject: user?.subject ?? '',
  });
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Password form
  const [passwords, setPasswords] = useState({ password: '', confirm: '' });
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const e2: Record<string, string> = {};
    if (!profile.full_name.trim()) e2.full_name = 'Ad Soyad gereklidir.';
    setProfileErrors(e2);
    if (Object.keys(e2).length > 0) return;

    setProfileSaving(true);
    setProfileMsg(null);
    try {
      await updateProfile(profile);
      await refreshUser();
      setProfileMsg({ type: 'success', text: 'Profil başarıyla güncellendi.' });
    } catch {
      setProfileMsg({ type: 'error', text: 'Güncelleme başarısız.' });
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const e2: Record<string, string> = {};
    const pwErr = validatePassword(passwords.password);
    if (pwErr) e2.password = pwErr;
    if (passwords.password !== passwords.confirm) e2.confirm = 'Şifreler eşleşmiyor.';
    setPasswordErrors(e2);
    if (Object.keys(e2).length > 0) return;

    setPasswordSaving(true);
    setPasswordMsg(null);
    try {
      await updateProfile({ password: passwords.password } as never);
      setPasswords({ password: '', confirm: '' });
      setPasswordMsg({ type: 'success', text: 'Şifre başarıyla değiştirildi.' });
    } catch {
      setPasswordMsg({ type: 'error', text: 'Şifre değiştirme başarısız.' });
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Profile */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>👤</span>
          <h3 className={styles.sectionTitle}>Profil Bilgileri</h3>
        </div>
        {profileMsg && <div style={{ padding: '0 24px 0' }}><Alert type={profileMsg.type} message={profileMsg.text} dismissible /></div>}
        <SettingsForm
          fields={[
            { name: 'full_name', label: 'Ad Soyad', required: true, autoComplete: 'name' },
            { name: 'school', label: 'Okul', placeholder: 'örn. Atatürk Ortaokulu' },
            { name: 'subject', label: 'Branş', placeholder: 'örn. Matematik' },
          ]}
          values={profile}
          errors={profileErrors}
          onChange={(name, value) => setProfile(prev => ({ ...prev, [name]: value }))}
          onSubmit={handleProfileSubmit}
          submitting={profileSaving}
          submitLabel="Profili Güncelle"
        />
      </div>

      {/* Password */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🔒</span>
          <h3 className={styles.sectionTitle}>Şifre Değiştir</h3>
        </div>
        {passwordMsg && <div style={{ padding: '0 24px 0' }}><Alert type={passwordMsg.type} message={passwordMsg.text} dismissible /></div>}
        <SettingsForm
          fields={[
            {
              name: 'password',
              label: 'Yeni Şifre',
              type: 'password',
              autoComplete: 'new-password',
              helper: 'En az 8 karakter, bir büyük harf ve bir rakam içermelidir.',
            },
            {
              name: 'confirm',
              label: 'Şifre Tekrar',
              type: 'password',
              autoComplete: 'new-password',
            },
          ]}
          values={passwords}
          errors={passwordErrors}
          onChange={(name, value) => setPasswords(prev => ({ ...prev, [name]: value }))}
          onSubmit={handlePasswordSubmit}
          submitting={passwordSaving}
          submitLabel="Şifreyi Değiştir"
        />
      </div>
    </div>
  );
}
