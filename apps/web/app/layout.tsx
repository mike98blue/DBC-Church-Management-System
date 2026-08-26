import type { Metadata } from 'next';
import { Analytics } from '@/components/Analytics';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'DBC Church',
    template: '%s | DBC Church',
  },
  description: 'A welcoming church community — worship, ministries, and groups.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_WEB_URL ?? 'https://example.test'),
  openGraph: {
    title: 'DBC Church',
    description: 'A welcoming church community.',
    type: 'website',
  },
  twitter: { card: 'summary_large_image' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
