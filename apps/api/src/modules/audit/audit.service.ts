import { Inject, Injectable } from '@nestjs/common';
import { auditEvents } from '@churchos/db';
import type { Database } from '@churchos/db';

@Injectable()
export class AuditService {
  constructor(@Inject('DATABASE') private readonly db: Database | null) {}

  async log(params: {
    actorId: string | null;
    action: string;
    resourceType: string;
    resourceId?: string | null;
    metadata?: Record<string, unknown> | null;
  }): Promise<void> {
    if (!this.db) throw new Error('Audit database is not configured');
    try {
      await this.db.insert(auditEvents).values({
        actorId: params.actorId ?? null,
        action: params.action,
        resourceType: params.resourceType,
        resourceId: params.resourceId ?? null,
        metadata: params.metadata ?? null,
      });
    } catch (error) {
      throw new Error('Failed to persist audit event', { cause: error });
    }
  }

  async logInTx(
    tx: Database,
    params: {
      actorId: string | null;
      action: string;
      resourceType: string;
      resourceId?: string | null;
      metadata?: Record<string, unknown> | null;
    },
  ): Promise<void> {
    try {
      await tx.insert(auditEvents).values({
        actorId: params.actorId ?? null,
        action: params.action,
        resourceType: params.resourceType,
        resourceId: params.resourceId ?? null,
        metadata: params.metadata ?? null,
      });
    } catch (error) {
      throw new Error('Failed to persist audit event', { cause: error });
    }
  }
}
