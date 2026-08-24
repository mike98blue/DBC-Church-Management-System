import { ForbiddenException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { WorshipController } from './worship.controller';
import type { WorshipService } from './worship.service';

function mockService(): WorshipService {
  return {
    createSong: vi.fn().mockResolvedValue({ id: 's1' }),
    listSongs: vi.fn().mockResolvedValue([]),
    createService: vi.fn().mockResolvedValue({ id: 'svc1' }),
    getService: vi.fn().mockResolvedValue({ id: 'svc1', items: [] }),
    addItem: vi.fn().mockResolvedValue({ id: 'item1' }),
  } as unknown as WorshipService;
}

describe('WorshipController', () => {
  it('requires worship.manage for create', async () => {
    const c = new WorshipController(mockService());
    await expect(c.createSong(null, { title: 'Test' } as never)).rejects.toThrow(
      ForbiddenException,
    );
    await expect(
      c.createService(null, { title: 'Sunday', serviceDate: '2026-09-01' } as never),
    ).rejects.toThrow(ForbiddenException);
  });
  it('requires worship.read for list', async () => {
    const c = new WorshipController(mockService());
    await expect(c.listSongs(null)).rejects.toThrow(ForbiddenException);
    await expect(c.getService(null, '00000000-0000-0000-0000-000000000001')).rejects.toThrow(
      ForbiddenException,
    );
  });
});
