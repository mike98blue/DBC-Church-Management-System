'use client';

import { useEffect, useState } from 'react';

export function PwaInstallPrompt() {
  const [prompt, setPrompt] = useState<unknown>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (!prompt) return null;

  return (
    <button
      onClick={async () => {
        const p = prompt as { prompt: () => Promise<void> };
        await p.prompt();
        setPrompt(null);
      }}
    >
      Install app
    </button>
  );
}
