import { ForbiddenException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { UsersController } from './users.controller';
import type { UsersService } from './users.service';

function mockService(): UsersService {
  return {
    upsertUser: vi.fn().mockResolvedValue({ user: { id: 'u1' }, link: null }),
    list: vi.fn().mockResolvedValue([]),
    findBySubject: vi.fn().mockResolvedValue({ user: { id: 'u1' }, link: null }),
  } as unknown as UsersService;
}

describe('UsersController (admin provisioning, B-02)', () => {
  it('requires admin.users to upsert', async () => {
    const c = new UsersController(mockService());
    await expect(c.upsert(null, { subject: 'auth0|1' } as never)).rejects.toThrow(
      ForbiddenException,
    );
  });
  it('requires admin.users to list', async () => {
    const c = new UsersController(mockService());
    await expect(c.list(null)).rejects.toThrow(ForbiddenException);
  });
  it('requires admin.users to lookup by subject', async () => {
    const c = new UsersController(mockService());
    await expect(c.bySubject(null, 'auth0|1')).rejects.toThrow(ForbiddenException);
  });
});
