import type { Metadata } from 'next';
import './globals.css';
import packageJson from '../../package.json';
import DialogHost from '@/components/DialogHost';

export const metadata: Metadata = {
  title: 'Jeopardy!',
  description: 'Créez et jouez vos propres quizz Jeopardy',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="bg-jeopardy-blue">
        {children}
        <DialogHost />
        <p className="text-center text-purple-800 text-xs py-2">v{packageJson.version}</p>
      </body>
    </html>
  );
}
