import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import styles from './Navigation.module.css';

interface NavbarProps {
  onMenuClick: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('theme', 'light');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const initials = user?.full_name
    ?.split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() ?? 'K';

  const handleLogout = async () => {
    setOpen(false);
    await logout();
  };

  const toggleTheme = () => setTheme(t => (t === 'light' ? 'dark' : 'light'));

  return (
    <header className={styles.navbar}>
      <button className={styles.menuBtn} onClick={onMenuClick} aria-label="Menüyü aç">
        ☰
      </button>
      <Link to="/panel" className={styles.brand}>
        📝 Sınav Hazırlama
      </Link>

      <div className={styles.spacer} />

      <button className={styles.themeToggle} onClick={toggleTheme} aria-label="Tema değiştir">
        {theme === 'light' ? '🌙' : '☀️'}
      </button>

      <div className={styles.userMenu} ref={ref}>
        <button className={styles.userBtn} onClick={() => setOpen(o => !o)} aria-haspopup="true">
          <div className={styles.avatar}>{initials}</div>
          <span className={styles.userName}>{user?.full_name}</span>
          <span>▾</span>
        </button>

        {open && (
          <div className={styles.dropdown} role="menu">
            <div style={{ padding: '10px 16px 6px', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
              {user?.email}
            </div>
            <div className={styles.divider} />
            <Link to="/ayarlar" className={styles.dropdownItem} onClick={() => setOpen(false)}>
              ⚙️ Ayarlar
            </Link>
            <div className={styles.divider} />
            <button className={`${styles.dropdownItem} ${styles.danger}`} onClick={handleLogout}>
              🚪 Çıkış Yap
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
