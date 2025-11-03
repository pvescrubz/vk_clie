// src/components/forms/SubscribeForm.tsx
'use client';

import { useState } from 'react';
import { SubscribeData } from '@/types';
import { apiFetch } from '@/lib/apiClient';

interface Props {
  isLoading: boolean; // ← добавили
  onResult: (result: SubscribeData | null) => void;
  onLoading: (isLoading: boolean) => void;
}

export function SubscribeForm({ isLoading, onResult, onLoading }: Props) { // ← деструктурируем
  const [publicUrl, setPublicUrl] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onLoading(true);
    onResult(null);

    try {
      const result: SubscribeData = await apiFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/subscribe/public`,
        {
          method: 'POST',
          body: JSON.stringify({ publicUrl }),
        }
      );
      onResult(result);
    } catch (error) {
      onResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      onLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="inputGroup">
        <label htmlFor="publicUrl">Ссылка на паблик:</label>
        <input
          type="text"
          id="publicUrl"
          value={publicUrl}
          onChange={(e) => setPublicUrl(e.target.value)}
          placeholder="https://vk.com/timelessstyle"
          required
        />
      </div>
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Подписываем...' : 'Подписать все аккаунты'}
      </button>
    </form>
  );
}