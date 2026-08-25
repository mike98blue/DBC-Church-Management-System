import { describe, expect, it, vi } from 'vitest';
import { BounceWebhookController } from './bounce.controller';
import type { BounceService } from './bounce.service';

function mockService(): BounceService {
  return {
    handle: vi.fn().mockResolvedValue({ processed: true }),
  } as unknown as BounceService;
}

describe('BounceWebhookController (H-06)', () => {
  it('is public (no auth) and processes bounce', async () => {
    const service = mockService();
    const c = new BounceWebhookController(service);
    const result = await c.handle({
      type: 'bounce',
      personId: '00000000-0000-0000-0000-000000000001',
    } as never);
    expect(result).toEqual({ processed: true });
    expect(service.handle).toHaveBeenCalledOnce();
  });
});
