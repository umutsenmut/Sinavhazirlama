import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { validateEmail, validatePassword } from '../utils/validators';
import Button from '../components/Common/Button';
import Alert from '../components/Common/Alert';

interface FormState {
  email: string;
  password: string;
}

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>({ email: '', password: '' });
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const set = (field: keyof FormState, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const validate = (): boolean => {
    const e: Partial<FormState> = {};
    const emailErr = validateEmail(form.email);
    if (emailErr) e.email = emailErr;
    if (!form.password) e.password = 'Şifre gereklidir.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setApiError(null);
    try {
      await login(form.email, form.password);
      navigate('/panel');
    } catch {
      setApiError('E-posta veya şifre hatalı. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem', textAlign: 'center', fontSize: '1.25rem' }}>
        Hesabınıza Giriş Yapın
      </h2>

      {apiError && <Alert type="error" message={apiError} dismissible />}

      <form onSubmit={handleSubmit} noValidate style={{ marginTop: '1rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>E-posta Adresi</label>
            <input
              type="email"
              value={form.email}
              onChange={e => set('email', e.target.value)}
              autoComplete="email"
              placeholder="ornek@email.com"
              style={{
                padding: '10px 12px',
                border: `1px solid ${errors.email ? 'var(--color-danger)' : 'var(--color-border)'}`,
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
                background: 'var(--color-bg-primary)',
                color: 'var(--color-text-primary)',
              }}
            />
            {errors.email && (
              <span style={{ fontSize: '0.75rem', color: 'var(--color-danger)' }}>
                {errors.email}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Şifre</label>
            <input
              type="password"
              value={form.password}
              onChange={e => set('password', e.target.value)}
              autoComplete="current-password"
              placeholder="••••••••"
              style={{
                padding: '10px 12px',
                border: `1px solid ${errors.password ? 'var(--color-danger)' : 'var(--color-border)'}`,
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
                background: 'var(--color-bg-primary)',
                color: 'var(--color-text-primary)',
              }}
            />
            {errors.password && (
              <span style={{ fontSize: '0.75rem', color: 'var(--color-danger)' }}>
                {errors.password}
              </span>
            )}
          </div>

          <Button type="submit" fullWidth loading={loading} size="lg">
            Giriş Yap
          </Button>
        </div>
      </form>

      <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem' }}>
        Hesabınız yok mu?{' '}
        <Link to="/kayit" style={{ color: 'var(--color-primary)', fontWeight: 500 }}>
          Kayıt Olun
        </Link>
      </p>
    </div>
  );
}

// Suppress unused import warning
void validatePassword;
