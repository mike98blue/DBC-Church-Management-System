import { HttpException, type ExecutionContext } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import { RateLimitGuard } from './rate-limit.guard';

function makeContext(ip: string, path = '/api/v1/people'): ExecutionContext {
  const headers: Record<string, string> = {};
  return {
    switchToHttp: () => ({
      getRequest: () => ({ ip, headers, path }),
      getResponse: () => ({ setHeader: (k: string, v: string) => void (headers[k] = v) }),
    }),
  } as unknown as ExecutionContext;
}

describe('RateLimitGuard (B-08)', () => {
  it('allows requests under the limit and blocks over it with 429', async () => {
    const fakeNow = 1_000_000;
    const guard = new RateLimitGuard({ windowMs: 60_000, max: 3 });
    guard.now = () => fakeNow;

    const ctx = makeContext('1.2.3.4');
    await expect(guard.canActivate(ctx)).resolves.toBe(true);
    await expect(guard.canActivate(ctx)).resolves.toBe(true);
    await expect(guard.canActivate(ctx)).resolves.toBe(true);
    await expect(guard.canActivate(ctx)).rejects.toThrow(HttpException);
    await expect(guard.canActivate(ctx)).rejects.toThrow(/Too Many/);
  });

  it('resets the window after it elapses', async () => {
    let fakeNow = 1_000_000;
    const guard = new RateLimitGuard({ windowMs: 60_000, max: 1 });
    guard.now = () => fakeNow;

    const ctx = makeContext('5.6.7.8');
    await expect(guard.canActivate(ctx)).resolves.toBe(true);
    await expect(guard.canActivate(ctx)).rejects.toThrow(HttpException);
    fakeNow += 61_000;
    await expect(guard.canActivate(ctx)).resolves.toBe(true);
  });

  it('tracks clients independently by ip', async () => {
    const guard = new RateLimitGuard({ windowMs: 60_000, max: 1 });
    guard.now = () => 1_000_000;
    await expect(guard.canActivate(makeContext('a'))).resolves.toBe(true);
    await expect(guard.canActivate(makeContext('b'))).resolves.toBe(true);
    await expect(guard.canActivate(makeContext('a'))).rejects.toThrow(HttpException);
  });

  it('never rate-limits /healthz', async () => {
    const guard = new RateLimitGuard({ windowMs: 60_000, max: 1 });
    guard.now = () => 1_000_000;
    const ctx = makeContext('9.9.9.9', '/healthz');
    await expect(guard.canActivate(ctx)).resolves.toBe(true);
    await expect(guard.canActivate(ctx)).resolves.toBe(true);
  });

  it('ignores spoofable x-forwarded-for and uses direct ip', async () => {
    const guard = new RateLimitGuard({ windowMs: 60_000, max: 1 });
    guard.now = () => 1_000_000;
    const ctx = makeContext('1.2.3.4');
    (ctx.switchToHttp().getRequest() as { headers: Record<string, string> }).headers[
      'x-forwarded-for'
    ] = '10.0.0.1, 10.0.0.2';
    await expect(guard.canActivate(ctx)).resolves.toBe(true);
    await expect(guard.canActivate(ctx)).rejects.toThrow(HttpException);
  });
});
