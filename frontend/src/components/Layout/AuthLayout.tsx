import { Outlet } from 'react-router-dom';
import styles from './Layout.module.css';

export default function AuthLayout() {
  return (
    <div className={styles.authWrapper}>
      <div className={styles.authCard}>
        <div className={styles.authLogo}>
          <div style={{ fontSize: '3rem' }}>📝</div>
          <div className={styles.authLogoTitle}>Sınav Hazırlama</div>
          <div className={styles.authLogoSub}>Öğretmenler için sınav sorusu üretici</div>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
