import { SubscribeData } from '../types';
import styles from './SubscribeResults.module.css';

interface SubscribeResultsProps {
  result: SubscribeData | null;
}

export const SubscribeResults: React.FC<SubscribeResultsProps> = ({ result }) => {
  if (!result) return null;

  // Обработка ошибок
  if (!result.success || result.error) {
    return (
      <div className={styles.error}>
        <strong>Ошибка:</strong> {result.error || result.message}
        {result.details && (
          <div className={styles.errorDetails}>Детали: {result.details}</div>
        )}
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
      {/* Общее сообщение */}
      {result.message && (
        <div className={styles.message}>
          {result.message}
        </div>
      )}
    </div>
  );
};