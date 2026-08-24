import { ForbiddenException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { CheckinController } from './checkin.controller';
import type { CheckinService } from './checkin.service';

function mockService(): CheckinService {
  return {
    checkIn: vi.fn().mockResolvedValue({ id: 'c1', pickupCode: '123456' }),
    checkOut: vi.fn().mockResolvedValue({ id: 'c1', status: 'checked_out' }),
    roster: vi.fn().mockResolvedValue([]),
  } as unknown as CheckinService;
}

describe('CheckinController', () => {
  it('requires checkin.operate for check-in', async () => {
    const c = new CheckinController(mockService());
    await expect(
      c.checkIn(null, {
        childPersonId: '00000000-0000-0000-0000-000000000001',
        eventId: '00000000-0000-0000-0000-000000000002',
      } as never),
    ).rejects.toThrow(ForbiddenException);
  });
  it('requires checkin.operate for check-out', async () => {
    const c = new CheckinController(mockService());
    await expect(
      c.checkOut(null, '00000000-0000-0000-0000-000000000001', { pickupCode: '123456' } as never),
    ).rejects.toThrow(ForbiddenException);
  });
  it('requires checkin.operate for roster', async () => {
    const c = new CheckinController(mockService());
    await expect(c.roster(null, '00000000-0000-0000-0000-000000000001')).rejects.toThrow(
      ForbiddenException,
    );
  });
});
