import { ForbiddenException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { CommunicationsController } from './communications.controller';
import type { CommunicationsService } from './communications.service';

function mockService(): CommunicationsService {
  return {
    sendGroupEmail: vi.fn().mockResolvedValue({ id: 'm1' }),
    listMessages: vi.fn().mockResolvedValue([]),
    unsubscribe: vi.fn().mockResolvedValue(undefined),
  } as unknown as CommunicationsService;
}

describe('CommunicationsController', () => {
  it('requires communications.send to send', async () => {
    const controller = new CommunicationsController(mockService());
    await expect(controller.send(null, { subject: 'Hi', body: 'Hello' } as never)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('requires communications.send to list', async () => {
    const controller = new CommunicationsController(mockService());
    await expect(controller.list(null)).rejects.toThrow(ForbiddenException);
  });

  it('allows unsubscribe without auth (public)', async () => {
    const service = mockService();
    const controller = new CommunicationsController(service);
    await controller.unsubscribe('00000000-0000-0000-0000-000000000001');
    expect(service.unsubscribe).toHaveBeenCalledOnce();
  });
});
