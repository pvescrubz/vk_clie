// src/components/forms/ShareForm.tsx
'use client';

import { useEffect, useState } from 'react';
import { PostResult, ShareData, ShareRequest } from '@/types';

interface Props {
  isLoading: boolean;
  onResult: (result: ShareData | null) => void;
  onLoading: (isLoading: boolean) => void;
}

export function ShareForm({ isLoading, onResult, onLoading }: Props) {
  const [postUrls, setPostUrls] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onLoading(true);
    onResult(null);

    try {
      // 🔥 ПАРСИМ МНОЖЕСТВЕННЫЕ ССЫЛКИ
      const urls = parseMultipleUrls(postUrls);
      
      if (urls.length === 0) {
        throw new Error('Не найдено валидных ссылок на посты');
      }

      console.log(`📨 Отправка ${urls.length} постов:`, urls);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}/share/posts`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ postUrls: urls }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `HTTP ${response.status}: ${errorText}`;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorData.message || errorText;
        } catch {}
        throw new Error(errorMessage);
      }

      const result = await response.json();

      if (result.status === 'processing') {
        onResult({
          success: true,
          message: `✅ Запрос принят! Обрабатываем ${urls.length} постов...`,
          status: 'processing',
          requestId: result.requestId,
          totalPosts: urls.length
        });
        
        checkStatusRepeatedly(result.requestId, urls.length);
      } else {
        processResult(result, urls.length);
      }

    } catch (error) {
      console.error('Share error:', error);
      onResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      } as ShareData);
    } finally {
      onLoading(false);
    }
  };

  // 🔥 ФУНКЦИЯ ДЛЯ ПАРСИНГА МНОЖЕСТВЕННЫХ ССЫЛОК
  const parseMultipleUrls = (input: string): string[] => {
    if (!input.trim()) return [];
    
    // Разные способы разделения ссылок
    const separators = [',', ';', '\n', ' ', '|'];
    
    let urls: string[] = [];
    
    // Пробуем разные разделители
    for (const separator of separators) {
      if (input.includes(separator)) {
        urls = input.split(separator)
          .map(url => url.trim())
          .filter(url => url.length > 0);
        break;
      }
    }
    
    // Если не нашли разделителей, пробуем извлечь ссылки из текста
    if (urls.length === 0) {
      const urlRegex = /https?:\/\/[^\s]+/g;
      urls = input.match(urlRegex) || [];
    }
    
    // Фильтруем только валидные VK ссылки
    return urls.filter(url => {
      const vkPattern = /https?:\/\/vk\.com\/wall(-?\d+)_(\d+)/;
      return vkPattern.test(url);
    });
  };

  // 🔥 ОБНОВЛЕННАЯ ПРОВЕРКА СТАТУСА
  const checkStatusRepeatedly = async (id: string, totalPosts: number) => {
    let attempts = 0;
    const maxAttempts = 120; // 10 минут (120 * 5 секунд)

    const check = async () => {
      attempts++;
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE}/share/status/${id}`
        );

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const status = await response.json();

        if (status.status === 'completed') {
          processResult(status.result, totalPosts);
        } else if (status.status === 'failed') {
          onResult({
            success: false,
            error: status.error || 'Произошла ошибка при выполнении',
          } as ShareData);
        } else if (status.status === 'processing') {
          // 🔥 ОБНОВЛЯЕМ ПРОГРЕСС
          if (status.processedPosts !== undefined) {
            onResult({
              success: true,
              message: `⏳ Обработано ${status.processedPosts}/${totalPosts} постов...`,
              status: 'processing',
              requestId: id,
              processedPosts: status.processedPosts,
              totalPosts: totalPosts
            } as ShareData);
          }
          
          if (attempts < maxAttempts) {
            setTimeout(check, 5000);
          } else {
            onResult({
              success: false,
              error: 'Превышено время ожидания выполнения запроса',
            } as ShareData);
          }
        }

      } catch (error) {
        console.error('Status check error:', error);
        if (attempts < maxAttempts) {
          setTimeout(check, 5000);
        }
      }
    };

    setTimeout(check, 3000);
  };

  // 🔥 ОБНОВЛЕННАЯ ОБРАБОТКА РЕЗУЛЬТАТА
  const processResult = (result: any, totalPosts: number) => {
    const formattedResult: ShareData = {
      success: result.success,
      message: result.message,
      error: result.error,
      status: 'completed',
      totalPosts: totalPosts,
      processedPosts: totalPosts,
    };

    // Если есть массив постов с результатами
    if (result.posts && Array.isArray(result.posts)) {
      formattedResult.posts = result.posts;
      
      // Суммируем общую статистику
      const totalStats = result.posts.reduce((acc: any, post: PostResult) => {
        if (post.summary) {
          acc.totalMessages += post.summary.totalMessages || 0;
          acc.successfulMessages += post.summary.successfulMessages || 0;
          acc.failedMessages += post.summary.failedMessages || 0;
        }
        return acc;
      }, { totalMessages: 0, successfulMessages: 0, failedMessages: 0 });

      formattedResult.summary = {
        totalMessages: totalStats.totalMessages,
        successfulMessages: totalStats.successfulMessages,
        failedMessages: totalStats.failedMessages,
        totalSenders: totalStats.totalMessages, // приблизительно
        postInfo: { ownerId: '0', postId: '0', fullPostId: 'multiple' },
        postUrl: 'multiple',
        results: []
      };
    }

    onResult(formattedResult);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="inputGroup">
        <label htmlFor="sharePostUrls">
          Ссылки на посты (можно несколько через запятую, пробел или с новой строки):
        </label>
        <textarea
          id="sharePostUrls"
          value={postUrls}
          onChange={(e) => setPostUrls(e.target.value)}
          placeholder="https://vk.com/wall13365227_3860
https://vk.com/wall13365227_3861
https://vk.com/wall13365227_3862"
          rows={4}
          required
          style={{ 
            width: '100%', 
            padding: '8px',
            fontFamily: 'monospace',
            fontSize: '14px'
          }}
        />
        <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
          Поддерживаются: запятые, точки с запятой, пробелы, переносы строк
        </div>
      </div>
      
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Отправка...' : `Отправить ${parseMultipleUrls(postUrls).length} постов`}
      </button>
      
      {/* Превью ссылок */}
      {postUrls && (
        <div style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
          Найдено ссылок: {parseMultipleUrls(postUrls).length}
        </div>
      )}
    </form>
  );
}