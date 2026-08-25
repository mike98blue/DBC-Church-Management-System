import type { CanActivate } from '@nestjs/common';
import { type ExecutionContext, HttpException, Injectable } from '@nestjs/common';

/**
 * In-memory rate limiter (B-08). Per-IP sliding window, suitable for a single
 * API instance. For multi-instance production, swap the store for Redis
 * (interface is intentionally store-shaped).
 *
 * Public endpoints (registrations, forms, unsubscribe, webhooks) are the
 * abuse surface; the guard applies globally with a generous default and a
 * stricter window can be layered per-route later.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

export interface RateLimitOptions {
  windowMs?: number;
  max?: number;
}

export const DEFAULT_RATE_LIMIT: Required<RateLimitOptions> = {
  windowMs: 60_000,
  max: 120,
};

@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly store = new Map<string, Bucket>();
  private readonly windowMs: number;
  private readonly max: number;

  // Test hook: inject a fake clock
  now: () => number = () => Date.now();

  constructor(options: RateLimitOptions = {}) {
    this.windowMs = options.windowMs ?? DEFAULT_RATE_LIMIT.windowMs;
    this.max = options.max ?? DEFAULT_RATE_LIMIT.max;
  }

  private clientKey(req: {
    ip?: string;
    headers: Record<string, string | string[] | undefined>;
  }): string {
    const fwd = req.headers['x-forwarded-for'];
    if (typeof fwd === 'string' && fwd.length > 0) return fwd.split(',')[0]?.trim() ?? 'unknown';
    return req.ip ?? 'unknown';
  }

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<{
      ip?: string;
      headers: Record<string, string | string[] | undefined>;
      path?: string;
    }>();
    const res = context.switchToHttp().getResponse<{ setHeader: (k: string, v: string) => void }>();

    // Never rate-limit health checks (monitoring must not be throttled)
    if (req.path === '/healthz') return true;

    const key = this.clientKey(req);
    const nowMs = this.now();
    const bucket = this.store.get(key);

    if (!bucket || nowMs >= bucket.resetAt) {
      this.store.set(key, { count: 1, resetAt: nowMs + this.windowMs });
      res.setHeader('x-ratelimit-limit', String(this.max));
      res.setHeader('x-ratelimit-remaining', String(this.max - 1));
      return true;
    }

    bucket.count += 1;
    const remaining = Math.max(this.max - bucket.count, 0);
    res.setHeader('x-ratelimit-limit', String(this.max));
    res.setHeader('x-ratelimit-remaining', String(remaining));

    if (bucket.count > this.max) {
      const retryAfterSec = Math.ceil((bucket.resetAt - nowMs) / 1000);
      res.setHeader('retry-after', String(retryAfterSec));
      throw new HttpException('Too Many Requests', 429);
    }
    return true;
  }
}
