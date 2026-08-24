import { randomUUID } from 'crypto';

/**
 * Request ID middleware — attaches `x-request-id` to every request/response
 * for tracing (§18: request IDs, user/action IDs where appropriate).
 */
export function requestIdMiddleware(
  req: { headers: Record<string, string | string[] | undefined> } & Record<string, unknown>,
  res: { setHeader: (k: string, v: string) => void },
  next: () => void,
): void {
  const existing = req.headers['x-request-id'] as string | undefined;
  const id = existing && existing.length >= 8 ? existing : randomUUID();
  (req as Record<string, unknown>).requestId = id;
  res.setHeader('x-request-id', id);
  next();
}
