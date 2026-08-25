import { ForbiddenException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { CustomFieldsController } from './custom-fields.controller';
import type { CustomFieldsService } from './custom-fields.service';

function mockService(): CustomFieldsService {
  return {
    createDefinition: vi.fn().mockResolvedValue({ id: 'd1', key: 'baptism_date' }),
    listDefinitions: vi.fn().mockResolvedValue([]),
    setValue: vi.fn().mockResolvedValue({ id: 'v1' }),
    getPersonValues: vi.fn().mockResolvedValue({}),
  } as unknown as CustomFieldsService;
}

describe('CustomFieldsController (C-09)', () => {
  const personId = '00000000-0000-0000-0000-000000000001';
  const writer = { id: 'u1', permissions: ['people.write' as never] };

  it('requires people.write to create definitions and set values', async () => {
    const c = new CustomFieldsController(mockService());
    await expect(
      c.createDefinition(null, { key: 'x', label: 'X', type: 'text' } as never),
    ).rejects.toThrow(ForbiddenException);
    await expect(c.setValue(null, { key: 'x', value: 'y' } as never, personId)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('requires people.read to read definitions/values', async () => {
    const c = new CustomFieldsController(mockService());
    await expect(c.listDefinitions(null)).rejects.toThrow(ForbiddenException);
    await expect(c.getValues(null, personId)).rejects.toThrow(ForbiddenException);
  });

  it('allows value set with people.write', async () => {
    const service = mockService();
    const c = new CustomFieldsController(service);
    await c.setValue(writer, { key: 'baptism_date', value: '2020-01-01' }, personId);
    expect(service.setValue).toHaveBeenCalledWith(personId, 'baptism_date', '2020-01-01');
  });
});
