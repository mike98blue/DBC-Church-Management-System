import { ForbiddenException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { SchedulingController } from './scheduling.controller';
import type { SchedulingService } from './scheduling.service';

function mockService(): SchedulingService {
  return {
    setAvailability: vi.fn().mockResolvedValue({ id: 'a1' }),
    listAvailability: vi.fn().mockResolvedValue([]),
    createAssignment: vi.fn().mockResolvedValue({ id: 's1' }),
    listAssignments: vi.fn().mockResolvedValue([]),
  } as unknown as SchedulingService;
}

describe('SchedulingController', () => {
  it('requires availability.manage for availability', async () => {
    const c = new SchedulingController(mockService());
    await expect(
      c.setAvailability(null, {
        personId: '00000000-0000-0000-0000-000000000001',
        date: '2026-09-01',
        status: 'available',
      } as never),
    ).rejects.toThrow(ForbiddenException);
    await expect(c.listAvailability(null, '00000000-0000-0000-0000-000000000001')).rejects.toThrow(
      ForbiddenException,
    );
  });
  it('requires scheduling.manage for assignments', async () => {
    const c = new SchedulingController(mockService());
    await expect(
      c.createAssignment(null, {
        personId: '00000000-0000-0000-0000-000000000001',
        scheduledFor: '2026-09-01',
      } as never),
    ).rejects.toThrow(ForbiddenException);
    await expect(c.listAssignments(null)).rejects.toThrow(ForbiddenException);
  });
});
