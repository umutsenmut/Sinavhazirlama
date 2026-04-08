import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../Navigation/Navbar';
import Sidebar from '../Navigation/Sidebar';
import styles from './Layout.module.css';

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className={styles.layout}>
      {/* Mobile overlay */}
      <div
        className={`${styles.mobileOverlay} ${sidebarOpen ? styles.visible : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <div className={`${styles.sidebar} ${sidebarOpen ? styles.open : ''}`}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main content */}
      <div className={styles.mainContent}>
        <Navbar onMenuClick={() => setSidebarOpen(prev => !prev)} />
        <main className={styles.pageContent}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
