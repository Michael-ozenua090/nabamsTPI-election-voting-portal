import './polyfills';
import './globals.css';

import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'NABAMS TPI — Executive Election Portal',
    template: '%s | NABAMS TPI Election',
  },
  description:
    'Official executive election voting portal for NABAMS, The Polytechnic Ibadan. ND1 and HND1 students only.',
  keywords: ['NABAMS', 'TPI', 'election', 'voting', 'Polytechnic Ibadan', 'student'],
  robots: 'noindex, nofollow', // Keep results private during election
  authors: [{ name: 'NABAMS TPI Electoral Committee' }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0a1628',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
