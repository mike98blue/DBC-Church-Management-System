import { ForbiddenException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { ImportController } from './import.controller';
import type { ImportService } from './import.service';

function mockService(): ImportService {
  return {
    previewPeopleCsv: vi.fn().mockResolvedValue({ total: 1, valid: 1, duplicates: 0, errors: [] }),
  } as unknown as ImportService;
}

describe('ImportController', () => {
  it('requires people.write to preview', async () => {
    const c = new ImportController(mockService());
    await expect(c.preview(null, { csv: 'a,b' } as never)).rejects.toThrow(ForbiddenException);
  });
});
