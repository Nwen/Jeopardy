import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Jeopardy!',
  description: 'Créez et jouez vos propres quizz Jeopardy',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="bg-jeopardy-blue">{children}</body>
    </html>
  );
}
