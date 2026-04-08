import React from 'react';
import styles from './Common.module.css';
import { classNames } from '../../utils/helpers';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  loading?: boolean;
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled,
  className,
  ...rest
}: ButtonProps) {
  const cls = classNames(
    styles.btn,
    styles[variant],
    size !== 'md' && styles[size],
    fullWidth && styles.fullWidth,
    className
  );

  return (
    <button className={cls} disabled={disabled || loading} {...rest}>
      {loading && <span className={classNames(styles.spinner, styles.sm)} />}
      {children}
    </button>
  );
}
