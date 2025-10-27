import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'VK Processor',
  description: 'Обработчик VK ссылок',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}