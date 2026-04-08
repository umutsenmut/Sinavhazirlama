import { range } from '../../utils/helpers';
import styles from './ExamPanel.module.css';

const TOTAL_WEEKS = 38;
const ALL_WEEKS = range(1, TOTAL_WEEKS);

interface Props {
  selected: number[];
  onChange: (weeks: number[]) => void;
}

export default function WeekSelector({ selected, onChange }: Props) {
  const toggle = (week: number) => {
    if (selected.includes(week)) {
      onChange(selected.filter(w => w !== week));
    } else {
      onChange([...selected, week].sort((a, b) => a - b));
    }
  };

  const selectAll = () => onChange(ALL_WEEKS);
  const clearAll = () => onChange([]);
  const selectSemester1 = () => onChange(range(1, 18));
  const selectSemester2 = () => onChange(range(19, 38));

  return (
    <div>
      <div className={styles.weekActions}>
        <button type="button" className={styles.weekActionBtn} onClick={selectAll}>
          Tümü
        </button>
        <button type="button" className={styles.weekActionBtn} onClick={clearAll}>
          Temizle
        </button>
        <button type="button" className={styles.weekActionBtn} onClick={selectSemester1}>
          1. Dönem (1–18)
        </button>
        <button type="button" className={styles.weekActionBtn} onClick={selectSemester2}>
          2. Dönem (19–38)
        </button>
        <span className={styles.selectionCount}>{selected.length} hafta seçildi</span>
      </div>

      <div className={styles.weekGrid}>
        {ALL_WEEKS.map(week => (
          <label key={week} className={styles.weekCell}>
            <input
              type="checkbox"
              className={styles.weekInput}
              checked={selected.includes(week)}
              onChange={() => toggle(week)}
            />
            <span className={styles.weekLabel}>{week}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
