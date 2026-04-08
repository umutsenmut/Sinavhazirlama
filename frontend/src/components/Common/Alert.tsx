import { useState } from 'react';
import styles from './Common.module.css';
import { classNames } from '../../utils/helpers';

type AlertType = 'success' | 'warning' | 'error' | 'info';

const icons: Record<AlertType, string> = {
  success: '✓',
  warning: '⚠',
  error: '✕',
  info: 'ℹ',
};

interface AlertProps {
  type?: AlertType;
  message: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}

export default function Alert({
  type = 'info',
  message,
  dismissible = false,
  onDismiss,
  className,
}: AlertProps) {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  const dismiss = () => {
    setVisible(false);
    onDismiss?.();
  };

  return (
    <div className={classNames(styles.alert, styles[type], className)} role="alert">
      <span className={styles.alertIcon}>{icons[type]}</span>
      <span>{message}</span>
      {dismissible && (
        <button className={styles.alertClose} onClick={dismiss} aria-label="Kapat">×</button>
      )}
    </div>
  );
}
