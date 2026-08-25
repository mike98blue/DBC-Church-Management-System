import { ForbiddenException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { DashboardController } from './dashboard.controller';
import type { DashboardService } from './dashboard.service';

function mockService(): DashboardService {
  return {
    summary: vi.fn().mockResolvedValue({ totalPeople: 0, upcomingEvents: 0, totalGivingCents: 0 }),
  } as unknown as DashboardService;
}

describe('DashboardController', () => {
  it('requires people.read for summary', async () => {
    const c = new DashboardController(mockService());
    await expect(c.summary(null)).rejects.toThrow(ForbiddenException);
  });
  it('returns summary for actor with people.read', async () => {
    const service = mockService();
    const c = new DashboardController(service);
    const result = await c.summary({ id: 'u1', permissions: ['people.read' as never] });
    expect(result).toEqual({ totalPeople: 0, upcomingEvents: 0, totalGivingCents: 0 });
    expect(service.summary).toHaveBeenCalledOnce();
  });
});
