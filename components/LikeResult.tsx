import { LikePostData, LikePostResult } from '../types';
import styles from './LikeResults.module.css';

interface LikeResultsProps {
  result: LikePostData | null;
}

export const LikeResults: React.FC<LikeResultsProps> = ({ result }) => {
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
        
        {/* ПРОГРЕСС БАР */}
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

  if (!result.success) {
    return (
      <div className={styles.error}>
        <strong>Ошибка:</strong> {result.message || result.error}
      </div>
    );
  }

  // 🔥 ОБРАБОТКА МНОЖЕСТВЕННЫХ ПОСТОВ
  if (result.posts && result.posts.length > 0) {
    return renderMultiplePostsResult(result);
  }

  // 🔥 ОБРАБОТКА ОДНОГО ПОСТА
  return renderSinglePostResult(result);
};

// КОМПОНЕНТ ДЛЯ ОДНОГО ПОСТА
const renderSinglePostResult = (result: LikePostData) => {
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
      <div className={styles.summary}>
        <h3>📊 ИТОГИ ЛАЙКИНГА</h3>
        <div className={styles.stats}>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Всего аккаунтов:</span>
            <span className={styles.statValue}>{summary.totalAccounts}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>✅ Успешных лайков:</span>
            <span className={styles.statSuccess}>{summary.successfulLikes}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>❌ Ошибок:</span>
            <span className={styles.statError}>{summary.failedLikes}</span>
          </div>
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
                  <span className={styles.accountInfo}>
                    👤 Аккаунт {item.accountNumber}: {item.tokenPreview}
                  </span>
                </div>
                <div className={styles.resultMessage}>
                  {item.success ? '✅ ' : '❌ '}
                  {item.message || (item.success ? 'Лайк поставлен' : item.error || 'Ошибка')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {result.message && (
        <div className={styles.message}>
          {result.message}
        </div>
      )}
    </div>
  );
};

// КОМПОНЕНТ ДЛЯ МНОЖЕСТВЕННЫХ ПОСТОВ
const renderMultiplePostsResult = (result: LikePostData) => {
  const successfulPosts = result.posts?.filter(post => post.success).length || 0;
  const totalPosts = result.posts?.length || 0;

  // Считаем общую статистику
  const totalStats = result.posts?.reduce((acc, post) => {
    if (post.summary) {
      acc.totalAccounts += post.summary.totalAccounts || 0;
      acc.successfulLikes += post.summary.successfulLikes || 0;
      acc.failedLikes += post.summary.failedLikes || 0;
    }
    return acc;
  }, { totalAccounts: 0, successfulLikes: 0, failedLikes: 0 }) || { totalAccounts: 0, successfulLikes: 0, failedLikes: 0 };

  return (
    <div className={styles.container}>
      {/* Общая статистика */}
      <div className={styles.summary}>
        <h3>📊 ИТОГИ ЛАЙКИНГА ПО {totalPosts} ПОСТАМ</h3>
        <div className={styles.stats}>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>✅ Успешных постов:</span>
            <span className={styles.statSuccess}>{successfulPosts} / {totalPosts}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Всего аккаунтов:</span>
            <span className={styles.statValue}>{totalStats.totalAccounts}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>✅ Успешных лайков:</span>
            <span className={styles.statSuccess}>{totalStats.successfulLikes}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>❌ Ошибок лайков:</span>
            <span className={styles.statError}>{totalStats.failedLikes}</span>
          </div>
        </div>
      </div>

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
                  📊 {post.summary.successfulLikes}/{post.summary.totalAccounts} успешно
                  {post.summary.failedLikes > 0 && (
                    <span className={styles.postStatsError}> ({post.summary.failedLikes} ошибок)</span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {result.message && (
        <div className={styles.message}>
          {result.message}
        </div>
      )}
    </div>
  );
};