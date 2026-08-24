import { ForbiddenException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { FacilityController } from './facility.controller';
import type { FacilityService } from './facility.service';

function mockService(): FacilityService {
  return {
    listFacilities: vi.fn().mockResolvedValue([]),
    createFacility: vi.fn().mockResolvedValue({ id: 'f1' }),
    listRooms: vi.fn().mockResolvedValue([]),
    createRoom: vi.fn().mockResolvedValue({ id: 'r1' }),
    listReservations: vi.fn().mockResolvedValue([]),
    createReservation: vi.fn().mockResolvedValue({ id: 'res1' }),
  } as unknown as FacilityService;
}

describe('FacilityController', () => {
  it('requires facility.read for list', async () => {
    const c = new FacilityController(mockService());
    await expect(c.list(null)).rejects.toThrow(ForbiddenException);
    await expect(c.listRooms(null)).rejects.toThrow(ForbiddenException);
  });
  it('requires facility.manage for create', async () => {
    const c = new FacilityController(mockService());
    await expect(c.create(null, { name: 'Test' } as never)).rejects.toThrow(ForbiddenException);
    await expect(c.createRoom(null, { name: 'Room 1' } as never)).rejects.toThrow(
      ForbiddenException,
    );
    await expect(
      c.createReservation(null, {
        roomId: '00000000-0000-0000-0000-000000000001',
        title: 'Test',
        startsAt: new Date().toISOString(),
        endsAt: new Date(Date.now() + 3600000).toISOString(),
      } as never),
    ).rejects.toThrow(ForbiddenException);
  });
});
