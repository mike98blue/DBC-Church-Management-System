import type { CanActivate } from '@nestjs/common';
import { type ExecutionContext, HttpException, Injectable, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

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

export interface RateLimitStore {
  get(key: string): Promise<Bucket | undefined>;
  set(key: string, bucket: Bucket): Promise<void>;
  delete(key: string): Promise<void>;
  entries(): Promise<[string, Bucket][]>;
}

export class InMemoryRateLimitStore implements RateLimitStore {
  private readonly map = new Map<string, Bucket>();
  async get(key: string): Promise<Bucket | undefined> {
    return this.map.get(key);
  }
  async set(key: string, bucket: Bucket): Promise<void> {
    this.map.set(key, bucket);
  }
  async delete(key: string): Promise<void> {
    this.map.delete(key);
  }
  async entries(): Promise<[string, Bucket][]> {
    return [...this.map.entries()];
  }
}

export interface RateLimitOptions {
  windowMs?: number;
  max?: number;
  store?: RateLimitStore;
}

export const DEFAULT_RATE_LIMIT: Required<Omit<RateLimitOptions, 'store'>> = {
  windowMs: 60_000,
  max: 120,
};

export const RATE_LIMIT_KEY = 'rateLimit';
export const RateLimit = (options: RateLimitOptions) => SetMetadata(RATE_LIMIT_KEY, options);

@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly store: RateLimitStore;
  private readonly windowMs: number;
  private readonly max: number;
  private readonly reflector: Reflector;

  now: () => number = () => Date.now();

  constructor(
    reflectorOrOptions: Reflector | RateLimitOptions = new Reflector(),
    maybeOptions: RateLimitOptions = {},
  ) {
    let reflector: Reflector;
    let options: RateLimitOptions;
    if (
      reflectorOrOptions &&
      typeof (reflectorOrOptions as Reflector).getAllAndOverride === 'function'
    ) {
      reflector = reflectorOrOptions as Reflector;
      options = maybeOptions;
    } else {
      reflector = new Reflector();
      options = reflectorOrOptions as RateLimitOptions;
    }
    this.reflector = reflector;
    const store = options.store;
    if (store) {
      this.store = store;
    } else if (process.env.REDIS_URL) {
      this.store = new InMemoryRateLimitStore();
    } else {
      this.store = new InMemoryRateLimitStore();
    }
    this.windowMs = options.windowMs ?? DEFAULT_RATE_LIMIT.windowMs;
    this.max = options.max ?? DEFAULT_RATE_LIMIT.max;
  }

  private clientKey(req: {
    ip?: string;
    headers: Record<string, string | string[] | undefined>;
  }): string {
    return req.ip ?? 'unknown';
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<{
      ip?: string;
      headers: Record<string, string | string[] | undefined>;
      path?: string;
      route?: { path?: string };
    }>();
    const res = context.switchToHttp().getResponse<{ setHeader: (k: string, v: string) => void }>();

    if (req.path === '/healthz') return true;

    let routeOptions: RateLimitOptions = {};
    try {
      const handler = (context as unknown as { getHandler?: () => unknown }).getHandler?.();
      const klass = (context as unknown as { getClass?: () => unknown }).getClass?.();
      const targets = [handler, klass].filter(Boolean) as unknown[];
      if (targets.length) {
        routeOptions =
          this.reflector.getAllAndOverride<RateLimitOptions>(RATE_LIMIT_KEY, targets as never) ??
          {};
      }
    } catch {
      routeOptions = {};
    }
    const effectiveWindowMs = routeOptions.windowMs ?? this.windowMs;
    const effectiveMax = routeOptions.max ?? this.max;
    const key = `${req.path ?? 'global'}:${this.clientKey(req)}`;
    const nowMs = this.now();
    for (const [storedKey, storedBucket] of await this.store.entries()) {
      if (nowMs >= storedBucket.resetAt) await this.store.delete(storedKey);
    }
    const bucket = await this.store.get(key);

    if (!bucket || nowMs >= bucket.resetAt) {
      await this.store.set(key, { count: 1, resetAt: nowMs + effectiveWindowMs });
      res.setHeader('x-ratelimit-limit', String(effectiveMax));
      res.setHeader('x-ratelimit-remaining', String(effectiveMax - 1));
      return true;
    }

    bucket.count += 1;
    await this.store.set(key, bucket);
    const remaining = Math.max(effectiveMax - bucket.count, 0);
    res.setHeader('x-ratelimit-limit', String(effectiveMax));
    res.setHeader('x-ratelimit-remaining', String(remaining));

    if (bucket.count > effectiveMax) {
      const retryAfterSec = Math.ceil((bucket.resetAt - nowMs) / 1000);
      res.setHeader('retry-after', String(retryAfterSec));
      throw new HttpException('Too Many Requests', 429);
    }
    return true;
  }
}
