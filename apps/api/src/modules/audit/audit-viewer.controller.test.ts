import { ForbiddenException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { AuditViewerController } from './audit-viewer.controller';
import type { AuditViewerService } from './audit-viewer.service';

function mockService(): AuditViewerService {
  return {
    list: vi.fn().mockResolvedValue({ data: [] }),
  } as unknown as AuditViewerService;
}

describe('AuditViewerController (B-10-lite)', () => {
  it('requires audit.read to list', async () => {
    const c = new AuditViewerController(mockService());
    await expect(c.list(null)).rejects.toThrow(ForbiddenException);
    await expect(c.list({ id: 'u1', permissions: [] })).rejects.toThrow(ForbiddenException);
  });

  it('allows listing with audit.read and forwards filters', async () => {
    const service = mockService();
    const c = new AuditViewerController(service);
    await c.list(
      { id: 'u1', permissions: ['audit.read' as never] },
      'people',
      'actor-1',
      '25',
      '5',
    );
    expect(service.list).toHaveBeenCalledWith({
      resourceType: 'people',
      actorId: 'actor-1',
      limit: 25,
      offset: 5,
    });
  });
});
