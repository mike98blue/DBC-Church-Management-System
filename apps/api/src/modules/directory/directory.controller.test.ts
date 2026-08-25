import { ForbiddenException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { DirectoryController } from './directory.controller';
import type { DirectoryService } from './directory.service';

function mockService(): DirectoryService {
  return {
    list: vi.fn().mockResolvedValue([]),
    updatePreferences: vi.fn().mockResolvedValue({ id: 'd1' }),
    getPreferences: vi.fn().mockResolvedValue(null),
  } as unknown as DirectoryService;
}

describe('DirectoryController', () => {
  it('requires directory.read for list', async () => {
    const c = new DirectoryController(mockService());
    await expect(c.list(null)).rejects.toThrow(ForbiddenException);
  });
  it('allows self to update own preferences', async () => {
    const service = mockService();
    const c = new DirectoryController(service);
    const personId = '00000000-0000-0000-0000-000000000001';
    await c.updatePreferences({ id: 'u1', permissions: [], personId } as never, personId, {
      showInDirectory: true,
    } as never);
    expect(service.updatePreferences).toHaveBeenCalledOnce();
  });
  it('requires directory.manage for other person', async () => {
    const c = new DirectoryController(mockService());
    const personId = '00000000-0000-0000-0000-000000000001';
    await expect(
      c.updatePreferences(
        { id: 'u1', permissions: [], personId: 'other' } as never,
        personId,
        {} as never,
      ),
    ).rejects.toThrow(ForbiddenException);
  });
});
