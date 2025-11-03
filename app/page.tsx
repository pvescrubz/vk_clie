// src/app/page.tsx
'use client';

import { useState } from 'react';
import { LoadingState, SubscribeData, LikePostData, ShareData } from '@/types';
import { SubscribeForm } from '@/components/forms/SubscribeForm';
import { LikeForm } from '@/components/forms/LikeForm';
import { ShareForm } from '@/components/forms/ShareForm';

import styles from './page.module.css';
import { SubscribeResults } from '@/components/SubscribeResults';
import { LikeResults } from '@/components/LikeResult';
import { ShareResults } from '@/components/ShareResults';

export default function Home() {
  const [loading, setLoading] = useState<LoadingState>({
    wall: false,
    group: false,
    single: false,
    subscribe: false,
    like: false,
    share: false,
  });

  const [subscribeResult, setSubscribeResult] = useState<SubscribeData | null>(null);
  const [likeResult, setLikeResult] = useState<LikePostData | null>(null);
  const [shareResult, setShareResult] = useState<ShareData | null>(null);

  return (
    <div className={styles.container}>
      <h1>VK Data Processor</h1>

      <div className={styles.formSection}>
        <h2>📢 Подписка на паблик</h2>
        <SubscribeForm
          isLoading={loading.subscribe}
          onResult={setSubscribeResult}
          onLoading={(isLoading) =>
            setLoading((prev) => ({ ...prev, subscribe: isLoading }))
          }
        />
        <SubscribeResults result={subscribeResult} />
      </div>

      <div className={styles.formSection}>
        <h2>❤️ Лайк поста</h2>
        <LikeForm
          isLoading={loading.like}
          onResult={setLikeResult}
          onLoading={(isLoading) =>
            setLoading((prev) => ({ ...prev, like: isLoading }))
          }
        />
        <LikeResults result={likeResult} />
      </div>

      <div className={styles.formSection}>
        <h2>📨 Поделиться в ЛС</h2>
        <ShareForm
          isLoading={loading.share}
          onResult={setShareResult}
          onLoading={(isLoading) =>
            setLoading((prev) => ({ ...prev, share: isLoading }))
          }
        />
        <ShareResults result={shareResult} />
      </div>
    </div>
  );
}