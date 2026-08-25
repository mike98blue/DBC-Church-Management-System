import { ForbiddenException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { BackgroundChecksController } from './background-checks.controller';
import type { BackgroundChecksService } from './background-checks.service';

function mockService(): BackgroundChecksService {
  return {
    requestCheck: vi.fn().mockResolvedValue({ id: 'bc1', status: 'clear' }),
    list: vi.fn().mockResolvedValue([]),
  } as unknown as BackgroundChecksService;
}

describe('BackgroundChecksController', () => {
  it('requires backgroundcheck.manage to request', async () => {
    const c = new BackgroundChecksController(mockService());
    await expect(
      c.request(null, { personId: '00000000-0000-0000-0000-000000000001' } as never),
    ).rejects.toThrow(ForbiddenException);
  });
  it('requires backgroundcheck.read to list', async () => {
    const c = new BackgroundChecksController(mockService());
    await expect(c.list(null)).rejects.toThrow(ForbiddenException);
  });
  it('allows request with manage permission', async () => {
    const service = mockService();
    const c = new BackgroundChecksController(service);
    await c.request({ id: 'u1', permissions: ['backgroundcheck.manage' as never] }, {
      personId: '00000000-0000-0000-0000-000000000001',
    } as never);
    expect(service.requestCheck).toHaveBeenCalledOnce();
  });
});
