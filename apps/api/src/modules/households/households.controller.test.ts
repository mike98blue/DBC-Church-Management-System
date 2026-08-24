import { ForbiddenException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { PERMISSIONS } from '@churchos/auth';
import { HouseholdsController } from './households.controller';
import type { HouseholdsService } from './households.service';

function mockService(): HouseholdsService {
  return {
    list: vi.fn().mockResolvedValue([]),
    get: vi.fn().mockResolvedValue({ household: { id: 'h1' }, members: [] }),
    create: vi.fn().mockResolvedValue({ id: 'h1' }),
    addMember: vi.fn().mockResolvedValue({ id: 'm1' }),
    removeMember: vi.fn().mockResolvedValue(undefined),
  } as unknown as HouseholdsService;
}

describe('HouseholdsController', () => {
  it('rejects list when actor lacks households.read', async () => {
    const controller = new HouseholdsController(mockService());
    await expect(controller.list(null)).rejects.toThrow(ForbiddenException);
    await expect(controller.list({ id: 'u1', permissions: [] })).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('allows list and get with households.read', async () => {
    const service = mockService();
    const controller = new HouseholdsController(service);
    const actor = { id: 'u1', permissions: [PERMISSIONS.HOUSEHOLDS_READ] };
    await controller.list(actor);
    expect(service.list).toHaveBeenCalledOnce();
    await controller.get(actor, '00000000-0000-0000-0000-000000000001');
    expect(service.get).toHaveBeenCalledOnce();
  });

  it('rejects create/addMember/removeMember without households.write', async () => {
    const controller = new HouseholdsController(mockService());
    const reader = { id: 'u1', permissions: [PERMISSIONS.HOUSEHOLDS_READ] };
    await expect(controller.create(reader, { name: 'Test' } as never)).rejects.toThrow(
      ForbiddenException,
    );
    await expect(
      controller.addMember(reader, '00000000-0000-0000-0000-000000000001', {
        personId: '00000000-0000-0000-0000-000000000002',
        role: 'other',
      } as never),
    ).rejects.toThrow(ForbiddenException);
    await expect(
      controller.removeMember(
        reader,
        '00000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0000-000000000002',
      ),
    ).rejects.toThrow(ForbiddenException);
  });
});
