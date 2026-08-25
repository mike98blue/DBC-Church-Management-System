import { Controller, Get, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { PERMISSIONS, assertPermission, type Actor } from '@churchos/auth';
import { CurrentActor } from '../../common/decorators/current-actor.decorator.js';
import type { AuditViewerService } from './audit-viewer.service.js';

@Controller('api/v1/admin/audit')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
export class AuditViewerController {
  constructor(private readonly viewer: AuditViewerService) {}

  @Get()
  async list(
    @CurrentActor() actor: Actor | null,
    @Query('resourceType') resourceType?: string,
    @Query('actorId') actorId?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    assertPermission(actor, PERMISSIONS.AUDIT_READ);
    return this.viewer.list({
      resourceType,
      actorId,
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
    });
  }
}
