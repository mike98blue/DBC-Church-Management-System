import { ForbiddenException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { FormsController } from './forms.controller';
import type { FormsService } from './forms.service';

function mockService(): FormsService {
  return {
    create: vi.fn().mockResolvedValue({ id: 'f1' }),
    list: vi.fn().mockResolvedValue([{ id: 'f1', visibility: 'public' }]),
    get: vi.fn().mockResolvedValue({ form: { id: 'f1' }, fields: [] }),
    submit: vi.fn().mockResolvedValue({ id: 's1' }),
    listSubmissions: vi.fn().mockResolvedValue([]),
    exportSubmissionsCsv: vi.fn().mockResolvedValue('submissionId,submittedAt\n'),
  } as unknown as FormsService;
}

describe('FormsController', () => {
  it('requires forms.manage to create', async () => {
    const controller = new FormsController(mockService());
    const dto = { title: 'Test', fields: [] } as never;
    await expect(controller.create(null, dto)).rejects.toThrow(ForbiddenException);
    await expect(controller.create({ id: 'u1', permissions: [] }, dto)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('requires forms.manage to list submissions', async () => {
    const controller = new FormsController(mockService());
    const id = '00000000-0000-0000-0000-000000000001';
    await expect(controller.listSubmissions(null, id)).rejects.toThrow(ForbiddenException);
  });

  it('requires forms.manage to export submissions (F-08)', async () => {
    const service = mockService();
    const controller = new FormsController(service);
    const id = '00000000-0000-0000-0000-000000000001';
    await expect(controller.exportSubmissions(null, id)).rejects.toThrow(ForbiddenException);
    await controller.exportSubmissions({ id: 'u1', permissions: ['forms.manage' as never] }, id);
    expect(service.exportSubmissionsCsv).toHaveBeenCalledWith(id);
  });

  it('allows public submission without auth', async () => {
    const service = mockService();
    const controller = new FormsController(service);
    const id = '00000000-0000-0000-0000-000000000001';
    await controller.submit(null, id, { answers: [] } as never);
    expect(service.submit).toHaveBeenCalledOnce();
  });
});
