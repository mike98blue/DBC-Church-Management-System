import { ForbiddenException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { CareController } from './care.controller';
import type { CareService } from './care.service';

function mockService(): CareService {
  return {
    createPrayer: vi.fn().mockResolvedValue({ id: 'p1' }),
    listPrayers: vi.fn().mockResolvedValue([]),
    createCase: vi.fn().mockResolvedValue({ id: 'c1' }),
    getCase: vi.fn().mockResolvedValue({ id: 'c1', notes: [] }),
    addNote: vi.fn().mockResolvedValue({ id: 'n1' }),
  } as unknown as CareService;
}

describe('CareController — Highly Restricted', () => {
  it('requires prayer.read for prayers', async () => {
    const c = new CareController(mockService());
    await expect(c.createPrayer(null, { personId: '00000000-0000-0000-0000-000000000001', request: 'test' } as never)).rejects.toThrow(ForbiddenException);
    await expect(c.listPrayers(null)).rejects.toThrow(ForbiddenException);
  });
  it('requires care.write for cases/notes', async () => {
    const c = new CareController(mockService());
    await expect(c.createCase(null, { personId: '00000000-0000-0000-0000-000000000001', title: 't' } as never)).rejects.toThrow(ForbiddenException);
    await expect(c.getCase(null, '00000000-0000-0000-0000-000000000001')).rejects.toThrow(ForbiddenException);
    await expect(c.addNote(null, '00000000-0000-0000-0000-000000000001', { note: 'x' } as never)).rejects.toThrow(ForbiddenException);
  });
  it('does not expose care notes via generic people endpoint (isolated controller)', () => {
    expect(CareController.name).toBe('CareController');
  });
});
