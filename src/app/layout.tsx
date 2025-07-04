import type { Metadata } from 'next';
import './globals.css';
import { MainLayout } from '@/components/main-layout';
import { Toaster } from '@/components/ui/toaster';
import { PwaLoader } from '@/components/pwa-loader';

export const metadata: Metadata = {
  title: 'Business Manager',
  description: 'An application to manage your business operations.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <PwaLoader />
        <MainLayout>{children}</MainLayout>
        <Toaster />
      </body>
    </html>
  );
}
