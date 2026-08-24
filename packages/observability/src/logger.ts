import pino from 'pino';

/**
 * Structured logger per blueprint §18. Never log highly sensitive payloads
 * (tokens, card data, pastoral notes). Use `audit` for sensitive access.
 */
export const logger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
  base: { service: 'churchos-api' },
  formatters: {
    level(label) {
      return { level: label };
    },
  },
  // In production, logs are JSON; in dev, pino-pretty can be used via transport
});

export function getLogger(context: string) {
  return logger.child({ context });
}
