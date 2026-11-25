import type { Metadata, Viewport } from 'next';
import React, { Suspense } from 'react';
import './globals.css';
import { MobileContainer } from '@/components/layout/MobileContainer';
import { BottomNavigation } from '@/components/layout/BottomNavigation';

export const metadata: Metadata = {
  title: 'WMS - Wedangan Management System',
  description: 'Aplikasi Distribusi Produk Makanan ke Wedangan',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'WMS',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#FF9012',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="min-h-full bg-slate-100 text-slate-800">
        <MobileContainer>
          <Suspense fallback={<div className="p-4 text-center text-xs text-slate-400">Memuat WMS...</div>}>
            {children}
          </Suspense>
          <Suspense fallback={<div className="h-14" />}>
            <BottomNavigation />
          </Suspense>
        </MobileContainer>
      </body>
    </html>
  );
}
