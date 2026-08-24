import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'DBC Church',
    template: '%s | DBC Church',
  },
  description: 'A welcoming church community — worship, ministries, and groups.',
  openGraph: {
    title: 'DBC Church',
    description: 'A welcoming church community.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
