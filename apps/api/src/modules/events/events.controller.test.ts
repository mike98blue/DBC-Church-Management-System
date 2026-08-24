import { ForbiddenException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { PERMISSIONS } from '@churchos/auth';
import { EventsController } from './events.controller';
import type { EventsService } from './events.service';

function mockService(): EventsService {
  return {
    listPublic: vi.fn().mockResolvedValue([]),
    listAll: vi.fn().mockResolvedValue([]),
    get: vi.fn().mockResolvedValue({ id: 'e1', visibility: 'public' }),
    create: vi.fn().mockResolvedValue({ id: 'e1' }),
    register: vi.fn().mockResolvedValue({ id: 'r1' }),
    listRegistrations: vi.fn().mockResolvedValue([]),
    recordAttendance: vi.fn().mockResolvedValue({ id: 'a1' }),
    listAttendance: vi.fn().mockResolvedValue([]),
  } as unknown as EventsService;
}

describe('EventsController', () => {
  it('allows public list without auth', async () => {
    const service = mockService();
    const controller = new EventsController(service);
    await controller.list(null);
    expect(service.listPublic).toHaveBeenCalledOnce();
  });

  it('requires events.manage for includePrivate', async () => {
    const controller = new EventsController(mockService());
    await expect(controller.list(null, 'true')).rejects.toThrow(ForbiddenException);
    await expect(
      controller.list({ id: 'u1', permissions: [PERMISSIONS.EVENTS_READ] }, 'true'),
    ).rejects.toThrow(ForbiddenException);
  });

  it('requires events.manage to create', async () => {
    const controller = new EventsController(mockService());
    const dto = { title: 'Test', startsAt: new Date().toISOString() } as never;
    await expect(controller.create(null, dto)).rejects.toThrow(ForbiddenException);
    await expect(
      controller.create({ id: 'u1', permissions: [PERMISSIONS.EVENTS_READ] }, dto),
    ).rejects.toThrow(ForbiddenException);
  });

  it('requires events.manage to list registrations', async () => {
    const controller = new EventsController(mockService());
    const id = '00000000-0000-0000-0000-000000000001';
    await expect(controller.listRegistrations(null, id)).rejects.toThrow(ForbiddenException);
  });

  it('requires attendance.record to record attendance', async () => {
    const controller = new EventsController(mockService());
    const id = '00000000-0000-0000-0000-000000000001';
    await expect(controller.recordAttendance(null, id, { personId: id })).rejects.toThrow(
      ForbiddenException,
    );
    await expect(
      controller.recordAttendance({ id: 'u1', permissions: [PERMISSIONS.EVENTS_MANAGE] }, id, {
        personId: id,
      }),
    ).rejects.toThrow(ForbiddenException);
  });

  it('allows registration without auth (public)', async () => {
    const service = mockService();
    const controller = new EventsController(service);
    const id = '00000000-0000-0000-0000-000000000001';
    await controller.register(id, { guestName: 'Alex Example' } as never);
    expect(service.register).toHaveBeenCalledOnce();
  });
});
