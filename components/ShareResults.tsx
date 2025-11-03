import { ShareData, PostResult } from '../types';
import styles from './ShareResults.module.css';

interface ShareResultsProps {
  result: ShareData | null;
}

export const ShareResults: React.FC<ShareResultsProps> = ({ result }) => {
  if (!result) return null;

  // 🔥 ОБРАБОТКА СТАТУСА "PROCESSING" С ПРОГРЕССОМ
  if (result.status === 'processing') {
    const progressPercent = result.totalPosts && result.processedPosts 
      ? Math.round((result.processedPosts / result.totalPosts) * 100)
      : 0;

    return (
      <div className={styles.processing}>
        <div className={styles.processingSpinner}>⏳</div>
        <strong>Выполняется...</strong>
        <div className={styles.processingMessage}>{result.message}</div>
        
        {/* 🔥 ПРОГРЕСС БАР ДЛЯ МНОЖЕСТВЕННЫХ ПОСТОВ */}
        {result.totalPosts && result.totalPosts > 1 && (
          <div className={styles.progress}>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className={styles.progressText}>
              Обработано: {result.processedPosts || 0} / {result.totalPosts} постов ({progressPercent}%)
            </div>
            {result.currentPost && (
              <div className={styles.currentPost}>
                Текущий пост: {result.currentPost}
              </div>
            )}
          </div>
        )}
        
        {result.requestId && (
          <div className={styles.requestId}>ID запроса: {result.requestId}</div>
        )}
      </div>
    );
  }

  // Обработка ошибок
  if (!result.success || result.error) {
    return (
      <div className={styles.error}>
        <strong>Ошибка:</strong> {result.error || result.message}
        {result.details && Array.isArray(result.details) && result.details.length > 0 && (
          <div className={styles.errorDetails}>
            <strong>Детали ошибок:</strong>
            {result.details.map((detail, index) => (
              !detail.success && (
                <div key={index} className={styles.errorDetailItem}>
                  {detail.senderName} → {detail.receiverName}: {detail.error}
                </div>
              )
            ))}
          </div>
        )}
      </div>
    );
  }

  // 🔥 ОБРАБОТКА РЕЗУЛЬТАТОВ ДЛЯ МНОЖЕСТВЕННЫХ ПОСТОВ
  if (result.posts && result.posts.length > 0) {
    return renderMultiplePostsResult(result);
  }

  // 🔥 ОБРАБОТКА РЕЗУЛЬТАТОВ ДЛЯ ОДНОГО ПОСТА
  return renderSinglePostResult(result);
};

// 🔥 КОМПОНЕНТ ДЛЯ ОДНОГО ПОСТА
const renderSinglePostResult = (result: ShareData) => {
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

// 🔥 КОМПОНЕНТ ДЛЯ МНОЖЕСТВЕННЫХ ПОСТОВ
const renderMultiplePostsResult = (result: ShareData) => {
  const successfulPosts = result.posts?.filter(post => post.success).length || 0;
  const totalPosts = result.posts?.length || 0;

  // Считаем общую статистику
  const totalStats = result.posts?.reduce((acc, post) => {
    if (post.summary) {
      acc.totalMessages += post.summary.totalMessages || 0;
      acc.successfulMessages += post.summary.successfulMessages || 0;
      acc.failedMessages += post.summary.failedMessages || 0;
    }
    return acc;
  }, { totalMessages: 0, successfulMessages: 0, failedMessages: 0 }) || { totalMessages: 0, successfulMessages: 0, failedMessages: 0 };

  return (
    <div className={styles.container}>
      {/* Общая статистика по всем постам */}
     

      {/* Результаты по каждому посту */}
      <div className={styles.postsResults}>
        <h4>📝 Результаты по постам:</h4>
        <div className={styles.postsList}>
          {result.posts?.map((post, index) => (
            <div key={index} className={`${styles.postItem} ${post.success ? styles.postSuccess : styles.postError}`}>
              <div className={styles.postHeader}>
                <span className={styles.postUrl}>
                  {post.success ? '✅' : '❌'} Пост {index + 1}: 
                  <a href={post.postUrl} target="_blank" rel="noopener noreferrer" className={styles.link}>
                    {post.postUrl}
                  </a>
                </span>
              </div>
              <div className={styles.postMessage}>
                {post.message || post.error}
              </div>
              {post.summary && (
                <div className={styles.postStats}>
                  📊 {post.summary.successfulMessages}/{post.summary.totalMessages} успешно
                  {post.summary.failedMessages > 0 && (
                    <span className={styles.postStatsError}> ({post.summary.failedMessages} ошибок)</span>
                  )}
                </div>
              )}
              {/* Детали по конкретному посту */}
              {post.results && post.results.length > 0 && (
                <div className={styles.postDetails}>
                  <details>
                    <summary>Детали отправки</summary>
                    <div className={styles.miniResultsList}>
                      {post.results.slice(0, 5).map((result, resultIndex) => (
                        <div key={resultIndex} className={`${styles.miniResultItem} ${result.success ? styles.miniSuccess : styles.miniFailed}`}>
                          {result.senderName} → {result.receiverName}: {result.success ? '✅' : '❌'}
                        </div>
                      ))}
                      {post.results.length > 5 && (
                        <div className={styles.moreResults}>
                          ... и еще {post.results.length - 5} отправок
                        </div>
                      )}
                    </div>
                  </details>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Общее сообщение */}
      {result.message && (
        <div className={styles.message}>
          {result.message}
        </div>
      )}
    </div>
  );
};