import { ShareData } from '../types';
import styles from './ShareResults.module.css';

interface ShareResultsProps {
  result: ShareData | null;
}

export const ShareResults: React.FC<ShareResultsProps> = ({ result }) => {
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
      {/* Основная статистика */}
      <div className={styles.summary}>
        <h3>📊 ИТОГИ РАССЫЛКИ</h3>
        <div className={styles.stats}>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Всего сообщений:</span>
            <span className={styles.statValue}>{summary.totalMessages}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>✅ Успешных отправок:</span>
            <span className={styles.statSuccess}>{summary.successfulMessages}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>❌ Ошибок:</span>
            <span className={styles.statError}>{summary.failedMessages}</span>
          </div>
          {summary.totalSenders && (
            <div className={styles.statItem}>
              <span className={styles.statLabel}>👥 Отправителей:</span>
              <span className={styles.statValue}>{summary.totalSenders}</span>
            </div>
          )}
          <div className={styles.statItem}>
            <span className={styles.statLabel}>📍 Пост:</span>
            <span className={styles.statValue}>{summary.postInfo.fullPostId}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>🔗 URL:</span>
            <a href={summary.postUrl} target="_blank" rel="noopener noreferrer" className={styles.link}>
              {summary.postUrl}
            </a>
          </div>
        </div>
      </div>

      {/* Детальные результаты */}
      {summary.results && summary.results.length > 0 && (
        <div className={styles.details}>
          <h4>Детальные результаты:</h4>
          <div className={styles.resultsList}>
            {summary.results.map((item, index) => (
              <div key={index} className={`${styles.resultItem} ${item.success ? styles.success : styles.failed}`}>
                <div className={styles.resultHeader}>
                  <span className={styles.senderInfo}>
                    📤 {item.senderName} → {item.receiverName}
                  </span>
                  {item.messageNumber && (
                    <span className={styles.messageNumber}>#{item.messageNumber}</span>
                  )}
                </div>
                <div className={styles.resultMessage}>
                  {item.success ? '✅ ' : '❌ '}
                  {item.message || (item.success ? 'Сообщение отправлено' : item.error || 'Ошибка')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Общее сообщение */}
      {result.message && (
        <div className={styles.message}>
          {result.message}
        </div>
      )}
    </div>
  );
};