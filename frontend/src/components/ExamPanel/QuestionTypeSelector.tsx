import type { QuestionType } from '../../types';
import styles from './ExamPanel.module.css';

const TYPES: { value: QuestionType; icon: string; label: string }[] = [
  { value: 'test', icon: '🔤', label: 'Test (Çoktan Seçmeli)' },
  { value: 'yazili', icon: '✍️', label: 'Yazılı (Açık Uçlu)' },
  { value: 'dogru_yanlis', icon: '✓✗', label: 'Doğru / Yanlış' },
  { value: 'bosluk_doldurma', icon: '📝', label: 'Boşluk Doldurma' },
];

interface Props {
  selected: QuestionType[];
  onChange: (types: QuestionType[]) => void;
}

export default function QuestionTypeSelector({ selected, onChange }: Props) {
  const toggle = (type: QuestionType) => {
    if (selected.includes(type)) {
      onChange(selected.filter(t => t !== type));
    } else {
      onChange([...selected, type]);
    }
  };

  return (
    <div className={styles.typeGrid}>
      {TYPES.map(({ value, icon, label }) => (
        <label key={value} className={styles.typeCard}>
          <input
            type="checkbox"
            className={styles.typeInput}
            checked={selected.includes(value)}
            onChange={() => toggle(value)}
          />
          <span className={styles.typeLabel}>
            <span className={styles.typeIcon}>{icon}</span>
            <span className={styles.typeName}>{label}</span>
          </span>
        </label>
      ))}
    </div>
  );
}
