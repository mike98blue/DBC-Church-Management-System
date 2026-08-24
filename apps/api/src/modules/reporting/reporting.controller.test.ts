import { ForbiddenException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { ReportingController } from './reporting.controller';
import type { ReportingService } from './reporting.service';

function mockService(): ReportingService {
  return {
    peopleCounts: vi.fn().mockResolvedValue({ member: 2 }),
    givingByFund: vi.fn().mockResolvedValue([]),
    exportPeopleCsv: vi.fn().mockResolvedValue('csv'),
    exportGivingCsv: vi.fn().mockResolvedValue('csv'),
  } as unknown as ReportingService;
}

describe('ReportingController', () => {
  it('requires people.read for counts', async () => {
    const c = new ReportingController(mockService());
    await expect(c.peopleCounts(null)).rejects.toThrow(ForbiddenException);
  });
  it('requires giving.read for by-fund', async () => {
    const c = new ReportingController(mockService());
    await expect(c.givingByFund(null)).rejects.toThrow(ForbiddenException);
  });
});
