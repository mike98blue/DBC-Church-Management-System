export async function GET() {
  const sw = `
self.addEventListener('install', (e) => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(clients.claim()));
self.addEventListener('fetch', (e) => {
  // Stale-while-revalidate for portal reads; network first for API
  if (e.request.url.includes('/api/')) {
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
  } else {
    e.respondWith(caches.match(e.request).then((r) => r || fetch(e.request)));
  }
});
`;
  return new Response(sw, {
    headers: { 'Content-Type': 'application/javascript' },
  });
}
