import React from 'react';
import styles from './Settings.module.css';
import Button from '../Common/Button';

interface Field {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  helper?: string;
  autoComplete?: string;
}

interface Props {
  fields: Field[];
  values: Record<string, string>;
  errors: Record<string, string>;
  onChange: (name: string, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitting?: boolean;
  submitLabel?: string;
}

export default function SettingsForm({
  fields,
  values,
  errors,
  onChange,
  onSubmit,
  submitting = false,
  submitLabel = 'Kaydet',
}: Props) {
  return (
    <form onSubmit={onSubmit} noValidate>
      <div className={styles.sectionBody}>
        {fields.map(f => (
          <div key={f.name} className={styles.field}>
            <label className={styles.label}>{f.label}{f.required && ' *'}</label>
            <input
              type={f.type ?? 'text'}
              className={`${styles.input} ${errors[f.name] ? styles.inputError : ''}`}
              value={values[f.name] ?? ''}
              onChange={e => onChange(f.name, e.target.value)}
              placeholder={f.placeholder}
              autoComplete={f.autoComplete}
            />
            {errors[f.name] && <span className={styles.errorText}>{errors[f.name]}</span>}
            {f.helper && !errors[f.name] && <span className={styles.helperText}>{f.helper}</span>}
          </div>
        ))}
      </div>
      <div className={styles.sectionFooter}>
        <Button type="submit" loading={submitting}>{submitLabel}</Button>
      </div>
    </form>
  );
}
