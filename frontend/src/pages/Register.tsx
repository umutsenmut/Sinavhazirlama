import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../services/auth';
import { validateEmail, validatePassword } from '../utils/validators';
import type { RegisterPayload } from '../types';
import Button from '../components/Common/Button';
import Alert from '../components/Common/Alert';

interface FormState {
  full_name: string;
  email: string;
  password: string;
  confirm: string;
  school: string;
  subject: string;
}

const initial: FormState = {
  full_name: '',
  email: '',
  password: '',
  confirm: '',
  school: '',
  subject: '',
};

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>(initial);
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const set = (field: keyof FormState, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const validate = (): boolean => {
    const e: Partial<FormState> = {};
    if (!form.full_name.trim()) e.full_name = 'Ad Soyad gereklidir.';
    const emailErr = validateEmail(form.email);
    if (emailErr) e.email = emailErr;
    const pwErr = validatePassword(form.password);
    if (pwErr) e.password = pwErr;
    if (form.password !== form.confirm) e.confirm = 'Şifreler eşleşmiyor.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setApiError(null);
    try {
      const payload: RegisterPayload = {
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        password: form.password,
        school: form.school.trim() || undefined,
        subject: form.subject.trim() || undefined,
      };
      await register(payload);
      navigate('/giris', { state: { registered: true } });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setApiError(typeof msg === 'string' ? msg : 'Kayıt başarısız. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (field: keyof FormState) => ({
    padding: '10px 12px',
    border: `1px solid ${errors[field] ? 'var(--color-danger)' : 'var(--color-border)'}`,
    borderRadius: 'var(--radius-md)',
    fontSize: '0.875rem',
    background: 'var(--color-bg-primary)',
    color: 'var(--color-text-primary)',
    width: '100%',
  });

  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem', textAlign: 'center', fontSize: '1.25rem' }}>
        Yeni Hesap Oluşturun
      </h2>

      {apiError && <Alert type="error" message={apiError} dismissible />}

      <form onSubmit={handleSubmit} noValidate style={{ marginTop: '1rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[
            { field: 'full_name' as const, label: 'Ad Soyad', type: 'text', placeholder: 'Adınız Soyadınız', ac: 'name' },
            { field: 'email' as const, label: 'E-posta', type: 'email', placeholder: 'ornek@email.com', ac: 'email' },
            { field: 'password' as const, label: 'Şifre', type: 'password', placeholder: '••••••••', ac: 'new-password' },
            { field: 'confirm' as const, label: 'Şifre Tekrar', type: 'password', placeholder: '••••••••', ac: 'new-password' },
            { field: 'school' as const, label: 'Okul (opsiyonel)', type: 'text', placeholder: 'örn. Atatürk Ortaokulu', ac: 'organization' },
            { field: 'subject' as const, label: 'Branş (opsiyonel)', type: 'text', placeholder: 'örn. Matematik', ac: 'off' },
          ].map(({ field, label, type, placeholder, ac }) => (
            <div key={field} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>{label}</label>
              <input
                type={type}
                value={form[field]}
                onChange={e => set(field, e.target.value)}
                placeholder={placeholder}
                autoComplete={ac}
                style={inputStyle(field)}
              />
              {errors[field] && (
                <span style={{ fontSize: '0.75rem', color: 'var(--color-danger)' }}>
                  {errors[field]}
                </span>
              )}
            </div>
          ))}

          <Button type="submit" fullWidth loading={loading} size="lg">
            Kayıt Ol
          </Button>
        </div>
      </form>

      <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem' }}>
        Zaten hesabınız var mı?{' '}
        <Link to="/giris" style={{ color: 'var(--color-primary)', fontWeight: 500 }}>
          Giriş Yapın
        </Link>
      </p>
    </div>
  );
}
