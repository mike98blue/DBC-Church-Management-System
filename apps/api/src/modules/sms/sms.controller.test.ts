import { ForbiddenException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { SmsController } from './sms.controller';
import type { SmsService } from './sms.service';

function mockService(): SmsService {
  return { send: vi.fn().mockResolvedValue({ id: 'sms_mock_1' }) } as unknown as SmsService;
}

describe('SmsController (Phase 2, mock)', () => {
  it('requires communications.send', async () => {
    const c = new SmsController(mockService());
    await expect(c.send(null, { to: '+1555', body: 'hi' } as never)).rejects.toThrow(
      ForbiddenException,
    );
  });
  it('sends with permission', async () => {
    const service = mockService();
    const c = new SmsController(service);
    await c.send({ id: 'u1', permissions: ['communications.send' as never] }, {
      to: '+1555',
      body: 'hi',
    } as never);
    expect(service.send).toHaveBeenCalledWith('+1555', 'hi');
  });
});
