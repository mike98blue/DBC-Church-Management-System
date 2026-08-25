import { ForbiddenException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { DuplicateController } from './duplicate.controller';
import type { DuplicateService } from './duplicate.service';

function mockService(): DuplicateService {
  return {
    findDuplicates: vi.fn().mockResolvedValue([]),
  } as unknown as DuplicateService;
}

describe('DuplicateController (C-12)', () => {
  it('requires people.read', async () => {
    const c = new DuplicateController(mockService());
    await expect(
      c.check(null, { firstName: 'Alex', lastName: 'Example' } as never),
    ).rejects.toThrow(ForbiddenException);
  });
  it('returns matches for actor with people.read', async () => {
    const service = mockService();
    const c = new DuplicateController(service);
    const result = await c.check(
      { id: 'u1', permissions: ['people.read' as never] },
      { firstName: 'Alex', lastName: 'Example' },
    );
    expect(result).toEqual([]);
    expect(service.findDuplicates).toHaveBeenCalledWith({ firstName: 'Alex', lastName: 'Example' });
  });
});
