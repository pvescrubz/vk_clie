import { LikePostData } from '../types';
import styles from './LikeResults.module.css';

interface LikeResultsProps {
  result: LikePostData | null;
}

export const LikeResults: React.FC<LikeResultsProps> = ({ result }) => {
  if (!result) return null;

  if (!result.success) {
    return (
      <div className={styles.error}>
        <strong>Ошибка:</strong> {result.message || result.error}
      </div>
    );
  }

  const summary = result.summary || result.data;

  if (!summary) {
    return (
      <div className={styles.error}>
        <strong>Ошибка:</strong> Нет данных о результатах
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Основная статистика */}
      {/* Общее сообщение */}
      {result.message && (
        <div className={styles.message}>
          {result.message}
        </div>
      )}
    </div>
  );
};