import { ForbiddenException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { GivingController } from './giving.controller';
import type { GivingService } from './giving.service';
import type { ReportingService } from '../reporting/reporting.service';

function mockService(): GivingService {
  return {
    listFunds: vi.fn().mockResolvedValue([]),
    createFund: vi.fn().mockResolvedValue({ id: 'f1' }),
    createCheckoutSession: vi.fn().mockResolvedValue({ url: 'https://mock', sessionId: 'cs_mock' }),
    listContributions: vi.fn().mockResolvedValue([]),
    handleWebhook: vi.fn().mockResolvedValue({ received: true, id: 'evt_1' }),
  } as unknown as GivingService;
}

function mockReporting(): ReportingService {
  return {
    exportGivingCsv: vi.fn().mockResolvedValue('csv'),
  } as unknown as ReportingService;
}

describe('GivingController', () => {
  it('requires giving.read to list funds', async () => {
    const c = new GivingController(mockService(), mockReporting());
    await expect(c.listFunds(null)).rejects.toThrow(ForbiddenException);
  });
  it('requires giving.manage to create fund', async () => {
    const c = new GivingController(mockService(), mockReporting());
    await expect(c.createFund(null, { name: 'General' } as never)).rejects.toThrow(
      ForbiddenException,
    );
  });
  it('requires giving.read to checkout', async () => {
    const c = new GivingController(mockService(), mockReporting());
    await expect(c.checkout(null, { fundId: 'f1', amountCents: 1000 } as never)).rejects.toThrow(
      ForbiddenException,
    );
  });
  it('webhook is public (no auth)', async () => {
    const service = mockService();
    const c = new GivingController(service, mockReporting());
    const result = await c.webhook(
      {
        body: { id: 'evt_1', type: 'checkout.session.completed', data: { object: { id: 'cs_1' } } },
      } as never,
      'sig',
    );
    expect(service.handleWebhook).toHaveBeenCalledOnce();
    expect(result).toEqual({ received: true, id: 'evt_1' });
  });
});
