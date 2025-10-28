/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';


import { LikeResults } from '@/components/LikeResult';
import { ShareResults } from '@/components/ShareResults';
import { SubscribeResults } from '@/components/SubscribeResults';
import { useState } from 'react';
import {
  LikePostData,
  LoadingState,
  ShareData,
  ShareRequest,
  SubscribeData,
} from '../types';
import styles from './page.module.css';

const API_BASE = 'http://92.63.176.115/api';



// Улучшенная функция fetch с обработкой ошибок
const apiFetch = async (url: string, options: RequestInit = {}) => {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    // Проверяем Content-Type
    const contentType = response.headers.get('content-type');
    
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('❌ Non-JSON response:', text.substring(0, 200));
      throw new Error(`Server returned non-JSON response: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }
    
    return data;
  } catch (error) {
    console.error('🚨 API fetch error:', error);
    throw error;
  }
};

export default function Home() {

  // Добавляем состояния
const [shareData, setShareData] = useState<ShareRequest>({ postUrl: '' });
const [shareResult, setShareResult] = useState<ShareData | null>(null);
const [shareLoading, setShareLoading] = useState(false);


  const [subscribeData, setSubscribeData] = useState({ publicUrl: '' });
  const [likeData, setLikeData] = useState({ 
    postUrl: '', 
    tokenCount: 10 
  });
const [subscribeResult, setSubscribeResult] = useState<SubscribeData | null>(null);
const [likeResult, setLikeResult] = useState<LikePostData | null>(null);


const subscribeToPublic = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading((prev: LoadingState) => ({ ...prev, subscribe: true }));
  setSubscribeResult(null);
  
  try {
    const result: SubscribeData = await apiFetch(`${API_BASE}/subscribe/public`, {
      method: 'POST',
      body: JSON.stringify({ publicUrl: subscribeData.publicUrl })
    });
    setSubscribeResult(result);
  } catch (error) {
    setSubscribeResult({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  } finally {
    setLoading((prev: LoadingState) => ({ ...prev, subscribe: false }));
  }
};


  const likePost = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading((prev: LoadingState) => ({ ...prev, like: true }));
    setLikeResult(null);
    
    try {
      const result = await apiFetch(`${API_BASE}/like/post`, {
        method: 'POST',
        body: JSON.stringify({
          postUrl: likeData.postUrl,
          tokenCount: likeData.tokenCount
        })
      });
      setLikeResult(result);
    } catch (error) {
      setLikeResult({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    } finally {
      setLoading((prev: LoadingState) => ({ ...prev, like: false }));
    }
  };

  // Добавляем функцию
const sharePost = async (e: React.FormEvent) => {
  e.preventDefault();
  setShareLoading(true);
  setShareResult(null);
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 300000);

    const response = await fetch(`${API_BASE}/share/post`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        postUrl: shareData.postUrl
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const responseText = await response.text();
    
    if (!response.ok) {
      console.error('❌ Server error response:', responseText);
      let errorMessage = `HTTP ${response.status}: ${responseText}`;
      try {
        const errorData = JSON.parse(responseText);
        errorMessage = errorData.error || errorData.message || responseText;
      } catch {}
      throw new Error(errorMessage);
    }

    const serverResult = JSON.parse(responseText);
    console.log('✅ Server response:', serverResult);
    
    // ✅ ПРЕОБРАЗУЕМ в правильный формат для типов
    const formattedResult: ShareData = {
      success: serverResult.success,
      message: serverResult.message,
      error: serverResult.error,
      // ✅ Кладем данные в summary И data (для надежности)
      summary: {
        totalMessages: serverResult.totalMessages || 0,
        successfulMessages: serverResult.successfulMessages || 0,
        failedMessages: serverResult.failedMessages || 0,
        totalSenders: serverResult.totalMessages || 0,
        postInfo: {
          ownerId: "0",
          postId: "0",
          fullPostId: serverResult.postUrl || shareData.postUrl
        },
        postUrl: serverResult.postUrl || shareData.postUrl,
        results: (serverResult.details || []).map((detail: any, index: number) => ({
          messageNumber: index + 1,
          senderNumber: index + 1,
          senderToken: '',
          senderName: detail.sender || detail.senderName || 'Unknown Sender',
          senderId: index + 1,
          receiverName: detail.receiver || detail.receiverName || 'Unknown Receiver',
          receiverId: index + 1000,
          success: detail.success || false,
          error: detail.error,
          message: detail.success ? 'Сообщение отправлено' : detail.error
        }))
      },
      // ✅ Дублируем в data для совместимости
      data: {
        totalMessages: serverResult.totalMessages || 0,
        successfulMessages: serverResult.successfulMessages || 0,
        failedMessages: serverResult.failedMessages || 0,
        totalSenders: serverResult.totalMessages || 0,
        postInfo: {
          ownerId: "0",
          postId: "0",
          fullPostId: serverResult.postUrl || shareData.postUrl
        },
        postUrl: serverResult.postUrl || shareData.postUrl,
        results: (serverResult.details || []).map((detail: any, index: number) => ({
          messageNumber: index + 1,
          senderNumber: index + 1,
          senderToken: '',
          senderName: detail.sender || detail.senderName || 'Unknown Sender',
          senderId: index + 1,
          receiverName: detail.receiver || detail.receiverName || 'Unknown Receiver',
          receiverId: index + 1000,
          success: detail.success || false,
          error: detail.error,
          message: detail.success ? 'Сообщение отправлено' : detail.error
        }))
      }
    };
    
    console.log('📤 Formatted result for ShareResults:', formattedResult);
    setShareResult(formattedResult);
    
  } catch (error) {
    console.error('Share error:', error);
    setShareResult({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  } finally {
    setShareLoading(false);
  }
};
// Обновляем LoadingState
const [loading, setLoading] = useState<LoadingState>({ 
  wall: false, 
  group: false, 
  single: false,
  subscribe: false,
  like: false,
  share: false // ← ДОБАВЬТЕ ЭТУ СТРОЧКУ
});
  return (
    <div className={styles.container}>
      <h1>VK Data Processor</h1>
      {/* Subscribe to Public */}
<div className={styles.formSection}>
  <h2>📢 Подписка на паблик</h2>
  <form onSubmit={subscribeToPublic}>
    <div className={styles.inputGroup}>
      <label htmlFor="publicUrl">Ссылка на паблик:</label>
      <input
        type="text"
        id="publicUrl"
        value={subscribeData.publicUrl}
        onChange={(e) => setSubscribeData({ publicUrl: e.target.value })}
        placeholder="https://vk.com/timelessstyle"
        required
      />
    </div>
    <button type="submit" disabled={loading.subscribe}>
      {loading.subscribe ? 'Подписываем...' : 'Подписать все аккаунты'}
    </button>
  </form>
  {/* Заменяем ResultDisplay на SubscribeResults */}
  <SubscribeResults result={subscribeResult} />
</div>

      {/* Like Post */}
      <div className={styles.formSection}>
  <h2>❤️ Лайк поста</h2>
  <form onSubmit={likePost}>
    <div className={styles.inputGroup}>
      <label htmlFor="postUrl">Ссылка на пост:</label>
      <input
        type="text"
        id="postUrl"
        value={likeData.postUrl}
        onChange={(e) => setLikeData({ ...likeData, postUrl: e.target.value })}
        placeholder="https://vk.com/wall-91724083_84530"
        required
      />
    </div>
    <div className={styles.inputGroup}>
      <label htmlFor="tokenCount">Количество аккаунтов (1-100):</label>
      <input
        type="number"
        id="tokenCount"
        value={likeData.tokenCount}
        onChange={(e) => setLikeData({ ...likeData, tokenCount: parseInt(e.target.value) || 10 })}
        min="1"
        max="100"
      />
    </div>
    <button type="submit" disabled={loading.like}>
      {loading.like ? 'Ставим лайки...' : 'Лайкнуть пост'}
    </button>
  </form>
  {/* Заменяем ResultDisplay на LikeResults */}
  <LikeResults result={likeResult} />
</div>

<div className={styles.formSection}>
  <h2>📨 Поделиться в ЛС</h2>
  <form onSubmit={sharePost}>
    <div className={styles.inputGroup}>
      <label htmlFor="sharePostUrl">Ссылка на пост:</label>
      <input
        type="text"
        id="sharePostUrl"
        value={shareData.postUrl}
        onChange={(e) => setShareData({ postUrl: e.target.value })}
        placeholder="https://vk.com/wall13365227_3861"
        required
      />
    </div>
    <button type="submit" disabled={shareLoading}>
      {shareLoading ? 'Отправляем...' : 'Поделиться между ботами'}
    </button>
  </form>
  <ShareResults result={shareResult} />
</div>
    </div>
  );
}