import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import styles from './Navigation.module.css';

const navItems = [
  { to: '/panel', icon: '🏠', label: 'Panel' },
  { to: '/sinavlar', icon: '📋', label: 'Sınavlar' },
  { to: '/planlar', icon: '📅', label: 'Yıllık Planlar' },
];

const settingsItems = [
  { to: '/ayarlar', icon: '⚙️', label: 'Ayarlar' },
];

interface SidebarProps {
  onClose: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
  const { user } = useAuth();

  return (
    <div className={styles.sidebar}>
      <div className={styles.sidebarLogo}>
        <span className={styles.sidebarLogoText}>📝 Sınav</span>
        <button className={styles.sidebarClose} onClick={onClose} aria-label="Menüyü kapat">
          ×
        </button>
      </div>

      <nav className={styles.nav}>
        <div className={styles.navLabel}>Ana Menü</div>
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `${styles.navLink} ${isActive ? styles.active : ''}`
            }
            onClick={onClose}
          >
            <span className={styles.navIcon}>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}

        <div className={styles.navLabel} style={{ marginTop: '8px' }}>Hesap</div>
        {settingsItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `${styles.navLink} ${isActive ? styles.active : ''}`
            }
            onClick={onClose}
          >
            <span className={styles.navIcon}>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className={styles.sidebarFooter}>
        {user?.school && <div>{user.school}</div>}
        {user?.subject && <div>{user.subject}</div>}
        <div style={{ marginTop: '4px' }}>© 2024 Sınav Hazırlama</div>
      </div>
    </div>
  );
}
