'use client';

import { useEffect } from 'react';

export function Analytics() {
  const domain = process.env.NEXT_PUBLIC_ANALYTICS_DOMAIN;
  const src = process.env.NEXT_PUBLIC_ANALYTICS_SRC ?? 'https://plausible.io/js/script.js';

  useEffect(() => {
    if (!domain) return;
    const script = document.createElement('script');
    script.defer = true;
    script.dataset.domain = domain;
    script.src = src;
    document.head.appendChild(script);
    return () => {
      script.remove();
    };
  }, [domain, src]);

  return null;
}
