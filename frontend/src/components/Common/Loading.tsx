import styles from './Common.module.css';
import { classNames } from '../../utils/helpers';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  fullPage?: boolean;
  className?: string;
}

export default function Loading({ size = 'md', fullPage = false, className }: LoadingProps) {
  return (
    <div className={classNames(styles.spinnerWrap, fullPage && styles.fullPage, className)}>
      <div
        className={classNames(styles.spinner, size !== 'md' && styles[size])}
        role="status"
        aria-label="Yükleniyor"
      />
    </div>
  );
}
