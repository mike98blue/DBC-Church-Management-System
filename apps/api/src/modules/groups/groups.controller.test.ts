import { ForbiddenException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { PERMISSIONS } from '@churchos/auth';
import { GroupsController } from './groups.controller';
import type { GroupsService } from './groups.service';

function mockService(): GroupsService {
  return {
    list: vi.fn().mockResolvedValue([]),
    get: vi.fn().mockResolvedValue({ group: { id: 'g1' }, members: [] }),
    create: vi.fn().mockResolvedValue({ id: 'g1' }),
    addMember: vi.fn().mockResolvedValue({ id: 'm1' }),
    removeMember: vi.fn().mockResolvedValue(undefined),
  } as unknown as GroupsService;
}

describe('GroupsController', () => {
  it('requires groups.read for list/get', async () => {
    const controller = new GroupsController(mockService());
    await expect(controller.list(null)).rejects.toThrow(ForbiddenException);
    await expect(controller.get(null, '00000000-0000-0000-0000-000000000001')).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('requires groups.manage for create/addMember/removeMember', async () => {
    const controller = new GroupsController(mockService());
    const reader = { id: 'u1', permissions: [PERMISSIONS.GROUPS_READ] };
    await expect(controller.create(reader, { name: 'Test' } as never)).rejects.toThrow(
      ForbiddenException,
    );
    await expect(
      controller.addMember(reader, '00000000-0000-0000-0000-000000000001', {
        personId: '00000000-0000-0000-0000-000000000002',
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
