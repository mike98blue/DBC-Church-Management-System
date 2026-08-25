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
    createManualEntry: vi.fn().mockResolvedValue({ id: 'c1', provider: 'manual' }),
    refundContribution: vi.fn().mockResolvedValue({ id: 'c2', amountCents: -1000 }),
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
  it('requires giving.manage for manual entry (G-10)', async () => {
    const service = mockService();
    const c = new GivingController(service, mockReporting());
    const dto = {
      donorPersonId: '00000000-0000-0000-0000-000000000001',
      amountCents: 2500,
      fundId: '00000000-0000-0000-0000-000000000002',
      method: 'check' as const,
      checkNumber: '1042',
    };
    await expect(c.createManualEntry(null, dto)).rejects.toThrow(ForbiddenException);
    await expect(
      c.createManualEntry({ id: 'u1', permissions: ['giving.read' as never] }, dto),
    ).rejects.toThrow(ForbiddenException);
    await c.createManualEntry({ id: 'u1', permissions: ['giving.manage' as never] }, dto);
    expect(service.createManualEntry).toHaveBeenCalledOnce();
  });

  it('requires giving.manage for refunds (G-13)', async () => {
    const service = mockService();
    const c = new GivingController(service, mockReporting());
    const id = '00000000-0000-0000-0000-000000000003';
    await expect(c.refund(null, id)).rejects.toThrow(ForbiddenException);
    await c.refund({ id: 'u1', permissions: ['giving.manage' as never] }, id);
    expect(service.refundContribution).toHaveBeenCalledWith(id, 'u1');
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
