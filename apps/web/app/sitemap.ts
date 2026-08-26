import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_WEB_URL ?? 'https://example.test';
  const now = new Date();
  const pages = [
    '',
    '/about',
    '/ministries',
    '/sermons',
    '/events',
    '/visit',
    '/contact',
    '/portal',
  ];
  return pages.map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: path === '' ? 'daily' : 'weekly',
    priority: path === '' ? 1 : 0.7,
  }));
}
