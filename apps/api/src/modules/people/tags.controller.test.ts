import { ForbiddenException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { TagsController } from './tags.controller';
import type { TagsService } from './tags.service';

function mockService(): TagsService {
  return {
    createTag: vi.fn().mockResolvedValue({ id: 't1', name: 'Volunteer' }),
    listTags: vi.fn().mockResolvedValue([]),
    tagPerson: vi.fn().mockResolvedValue({ tag: { id: 't1' } }),
    untagPerson: vi.fn().mockResolvedValue(undefined),
    listPersonTags: vi.fn().mockResolvedValue(['Volunteer']),
  } as unknown as TagsService;
}

describe('TagsController (C-08)', () => {
  const id = '00000000-0000-0000-0000-000000000001';

  it('requires people.write to create/assign/unassign', async () => {
    const c = new TagsController(mockService());
    await expect(c.create(null, { name: 'X' } as never)).rejects.toThrow(ForbiddenException);
    await expect(c.assign(null, { personId: id, tagName: 'X' } as never)).rejects.toThrow(
      ForbiddenException,
    );
    await expect(c.unassign(null, id, 'X')).rejects.toThrow(ForbiddenException);
  });

  it('requires people.read to list', async () => {
    const c = new TagsController(mockService());
    await expect(c.list(null)).rejects.toThrow(ForbiddenException);
    await expect(c.personTags(null, id)).rejects.toThrow(ForbiddenException);
  });

  it('allows assign with people.write', async () => {
    const service = mockService();
    const c = new TagsController(service);
    await c.assign(
      { id: 'u1', permissions: ['people.write' as never] },
      { personId: id, tagName: 'Volunteer' },
    );
    expect(service.tagPerson).toHaveBeenCalledWith(id, 'Volunteer');
  });
});
