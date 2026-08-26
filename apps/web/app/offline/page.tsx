export default function OfflinePage() {
  return (
    <main>
      <h1>Offline</h1>
      <p>
        The portal is cached for offline reads (PWA). Writes queue until back online — coming next
        via <code>next-pwa</code> background sync.
      </p>
      <p>
        Manifest at <code>/manifest.webmanifest</code> — install via the prompt in the portal
        header.
      </p>
    </main>
  );
}
