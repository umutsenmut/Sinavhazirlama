import styles from './PlanUpload.module.css';

interface Props {
  percent: number;
  label?: string;
}

export default function UploadProgress({ percent, label = 'Yükleniyor...' }: Props) {
  return (
    <div className={styles.progressWrap}>
      <div className={styles.progressBar}>
        <div className={styles.progressFill} style={{ width: `${percent}%` }} />
      </div>
      <div className={styles.progressMeta}>
        <span>{label}</span>
        <span>{percent}%</span>
      </div>
    </div>
  );
}
