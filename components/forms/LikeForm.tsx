'use client';

import { useState, useEffect } from 'react';
import { LikePostData } from '@/types';

interface Props {
  isLoading: boolean;
  onResult: (result: LikePostData | null) => void;
  onLoading: (isLoading: boolean) => void;
}

export function LikeForm({ isLoading, onResult, onLoading }: Props) {
  const [postUrls, setPostUrls] = useState('');
  const [tokenCount, setTokenCount] = useState(10);
  const [requestId, setRequestId] = useState<string | null>(null);

  // 🔥 ФУНКЦИЯ ДЛЯ ПАРСИНГА МНОЖЕСТВЕННЫХ ССЫЛОК
  const parseMultipleUrls = (input: string): string[] => {
    if (!input.trim()) return [];
    
    const separators = [',', ';', '\n', ' ', '|'];
    let urls: string[] = [];
    
    for (const separator of separators) {
      if (input.includes(separator)) {
        urls = input.split(separator)
          .map(url => url.trim())
          .filter(url => url.length > 0);
        break;
      }
    }
    
    if (urls.length === 0) {
      const urlRegex = /https?:\/\/[^\s]+/g;
      urls = input.match(urlRegex) || [];
    }
    
    return urls.filter(url => {
      const vkPattern = /https?:\/\/vk\.com\/wall(-?\d+)_(\d+)/;
      return vkPattern.test(url);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onLoading(true);
    onResult(null);
    setRequestId(null);

    try {
      const urls = parseMultipleUrls(postUrls);
      
      if (urls.length === 0) {
        throw new Error('Не найдено валидных ссылок на посты');
      }

      console.log(`📨 Отправка ${urls.length} постов на лайкинг:`, urls);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/like/posts`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            postUrls: urls, 
            tokenCount 
          }),
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
        setRequestId(result.requestId);
        onResult({
          success: true,
          message: `✅ Запрос принят! Лайкаем ${urls.length} постов...`,
          status: 'processing',
          requestId: result.requestId,
          totalPosts: urls.length
        });
        
        checkStatusRepeatedly(result.requestId, urls.length);
      } else {
        processResult(result, urls.length);
      }

    } catch (error) {
      console.error('Like error:', error);
      onResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      onLoading(false);
    }
  };

  // 🔥 ФУНКЦИЯ ПРОВЕРКИ СТАТУСА
  const checkStatusRepeatedly = async (id: string, totalPosts: number) => {
    let attempts = 0;
    const maxAttempts = 120;

    const check = async () => {
      attempts++;
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/like/status/${id}`
        );

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const status = await response.json();

        if (status.status === 'completed') {
          processResult(status.result, totalPosts);
        } else if (status.status === 'failed') {
          onResult({
            success: false,
            error: status.error || 'Произошла ошибка при выполнении',
          });
          setRequestId(null);
        } else if (status.status === 'processing') {
          if (status.processedPosts !== undefined) {
            onResult({
              success: true,
              message: `⏳ Обработано ${status.processedPosts}/${totalPosts} постов...`,
              status: 'processing',
              requestId: id,
              processedPosts: status.processedPosts,
              totalPosts: totalPosts,
              currentPost: status.currentPost
            });
          }
          
          if (attempts < maxAttempts) {
            setTimeout(check, 5000);
          } else {
            onResult({
              success: false,
              error: 'Превышено время ожидания выполнения запроса',
            });
            setRequestId(null);
          }
        }

      } catch (error) {
        console.error('Status check error:', error);
        if (attempts < maxAttempts) {
          setTimeout(check, 5000);
        } else {
          onResult({
            success: false,
            error: 'Ошибка при проверке статуса выполнения',
          });
          setRequestId(null);
        }
      }
    };

    setTimeout(check, 3000);
  };

  // 🔥 ОБРАБОТКА РЕЗУЛЬТАТА
  const processResult = (result: any, totalPosts: number) => {
    const formattedResult: LikePostData = {
      success: result.success,
      message: result.message,
      error: result.error,
      status: 'completed',
      totalPosts: totalPosts,
      processedPosts: totalPosts,
    };

    if (result.posts && Array.isArray(result.posts)) {
      formattedResult.posts = result.posts;
      
      // Суммируем общую статистику
      const totalStats = result.posts.reduce((acc: any, post: any) => {
        if (post.summary) {
          acc.totalAccounts += post.summary.totalAccounts || 0;
          acc.successfulLikes += post.summary.successfulLikes || 0;
          acc.failedLikes += post.summary.failedLikes || 0;
        }
        return acc;
      }, { totalAccounts: 0, successfulLikes: 0, failedLikes: 0 });

      formattedResult.summary = {
        totalAccounts: totalStats.totalAccounts,
        successfulLikes: totalStats.successfulLikes,
        failedLikes: totalStats.failedLikes,
        postInfo: { ownerId: '0', postId: '0', fullPostId: 'multiple' },
        postUrl: 'multiple',
        results: []
      };
    }

    onResult(formattedResult);
    setRequestId(null);
    onLoading(false);
  };

  const urlsCount = parseMultipleUrls(postUrls).length;
  const isSubmitDisabled = isLoading || requestId !== null;

  return (
    <form onSubmit={handleSubmit}>
      <div className="inputGroup">
        <label htmlFor="postUrls">
          Ссылки на посты (можно несколько через запятую, пробел или с новой строки):
        </label>
        <textarea
          id="postUrls"
          value={postUrls}
          onChange={(e) => setPostUrls(e.target.value)}
          placeholder="https://vk.com/wall-91724083_84530
https://vk.com/wall-91724083_84531
https://vk.com/wall-91724083_84532"
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
          Найдено валидных ссылок: {urlsCount}
        </div>
      </div>
      
      <div className="inputGroup">
        <label htmlFor="tokenCount">Количество аккаунтов на пост (1–100):</label>
        <input
          type="number"
          id="tokenCount"
          value={tokenCount}
          onChange={(e) => setTokenCount(Math.min(100, Math.max(1, parseInt(e.target.value) || 10)))}
          min="1"
          max="100"
        />
      </div>
      
      <button type="submit" disabled={isSubmitDisabled}>
        {isLoading 
          ? 'Отправка...' 
          : requestId 
            ? 'Выполняется...' 
            : `Лайкнуть ${urlsCount} постов`}
      </button>
      
      {/* Индикатор выполнения */}
      {requestId && (
        <div style={{ 
          marginTop: '10px', 
          fontSize: '14px', 
          color: '#666',
          padding: '10px',
          backgroundColor: '#f0f8ff',
          borderRadius: '4px'
        }}>
          ⏳ Запрос выполняется... ID: {requestId}
        </div>
      )}
    </form>
  );
}