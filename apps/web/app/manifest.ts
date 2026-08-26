import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ChurchOS Member Portal',
    short_name: 'ChurchOS',
    description: 'Member portal — update profile, view groups/events, giving history',
    start_url: '/portal',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#111827',
    icons: [{ src: '/icon.png', sizes: '512x512', type: 'image/png' }],
  };
}
