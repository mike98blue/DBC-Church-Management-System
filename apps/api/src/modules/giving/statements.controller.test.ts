import { ForbiddenException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { StatementsController } from './statements.controller';
import type { StatementsService } from './statements.service';

function mockService(): StatementsService {
  return {
    generate: vi.fn().mockResolvedValue({ donorId: 'd1', totalCents: 1000 }),
  } as unknown as StatementsService;
}

describe('StatementsController', () => {
  it('requires giving.export', async () => {
    const c = new StatementsController(mockService());
    await expect(
      c.generate(null, '00000000-0000-0000-0000-000000000001', '2026-01-01', '2026-12-31'),
    ).rejects.toThrow(ForbiddenException);
    await expect(
      c.generate(
        { id: 'u1', permissions: ['giving.read' as never] },
        '00000000-0000-0000-0000-000000000001',
        '2026-01-01',
        '2026-12-31',
      ),
    ).rejects.toThrow(ForbiddenException);
  });
  it('allows with giving.export', async () => {
    const service = mockService();
    const c = new StatementsController(service);
    await c.generate(
      { id: 'u1', permissions: ['giving.export' as never] },
      '00000000-0000-0000-0000-000000000001',
      '2026-01-01',
      '2026-12-31',
    );
    expect(service.generate).toHaveBeenCalledOnce();
  });
});
