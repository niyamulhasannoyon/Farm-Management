import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { LocaleThemeProvider } from '@/context/LocaleThemeContext';
import { Header } from '@/components/common/Header';
import { OfflineSyncBanner } from '@/components/offline/OfflineSyncBanner';

export const metadata: Metadata = {
  title: 'RBCL Flock Monitor | Unit-B Breeder Farm',
  description: 'Production-ready poultry flock monitor replacing spreadsheet tracking with live calculations, alerts, and offline entry.',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full antialiased">
      <head>
        <meta name="theme-color" content="#020617" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-white">
        <AuthProvider>
          <LocaleThemeProvider>
            <Header />
            <OfflineSyncBanner />
            <main className="flex-1 pb-16 lg:pb-8">{children}</main>
          </LocaleThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
