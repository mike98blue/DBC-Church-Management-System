import { ForbiddenException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { PERMISSIONS } from '@churchos/auth';
import { PeopleController } from './people.controller';
import type { PeopleService } from './people.service';
import type { ReportingService } from '../reporting/reporting.service';

function mockService(): PeopleService {
  return {
    list: vi.fn().mockResolvedValue({ data: [], total: 0 }),
    get: vi.fn().mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' }),
    create: vi.fn().mockResolvedValue({ id: 'new-id' }),
    update: vi.fn().mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' }),
  } as unknown as PeopleService;
}

function mockReporting(): ReportingService {
  return {
    exportPeopleCsv: vi.fn().mockResolvedValue('csv'),
  } as unknown as ReportingService;
}

describe('PeopleController', () => {
  it('rejects list when actor lacks people.read', async () => {
    const controller = new PeopleController(mockService(), mockReporting());
    await expect(controller.list(null)).rejects.toThrow(ForbiddenException);
    await expect(controller.list({ id: 'u1', permissions: [] })).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('allows list when actor has people.read', async () => {
    const service = mockService();
    const controller = new PeopleController(service, mockReporting());
    const actor = { id: 'u1', permissions: [PERMISSIONS.PEOPLE_READ] };
    await controller.list(actor);
    expect(service.list).toHaveBeenCalledOnce();
  });

  it('rejects create when actor lacks people.write', async () => {
    const controller = new PeopleController(mockService(), mockReporting());
    const dto = { firstName: 'Alex', lastName: 'Example' } as never;
    await expect(
      controller.create({ id: 'u1', permissions: [PERMISSIONS.PEOPLE_READ] }, dto),
    ).rejects.toThrow(ForbiddenException);
    await expect(controller.create(null, dto)).rejects.toThrow(ForbiddenException);
  });

  it('rejects update when actor lacks people.write', async () => {
    const controller = new PeopleController(mockService(), mockReporting());
    await expect(
      controller.update({ id: 'u1', permissions: [] }, '00000000-0000-0000-0000-000000000001', {
        lastName: 'Updated',
      } as never),
    ).rejects.toThrow(ForbiddenException);
  });
});
