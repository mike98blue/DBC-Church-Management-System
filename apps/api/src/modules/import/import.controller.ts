import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { IsOptional, IsString } from 'class-validator';
import { Inject } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { idempotencyKeys } from '@churchos/db';
import type { Database } from '@churchos/db';
import { PERMISSIONS, assertPermission, type Actor } from '@churchos/auth';
import { RateLimit } from '../../common/guards/rate-limit.guard.js';
import { CurrentActor } from '../../common/decorators/current-actor.decorator.js';
import { ImportService } from './import.service.js';

export class PreviewDto {
  @IsString()
  csv!: string;

  @IsOptional()
  @IsString()
  idempotencyKey?: string;
}

@Controller('api/v1/import')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
export class ImportController {
  constructor(
    @Inject(ImportService) private readonly importer: ImportService,
    @Inject('DATABASE') private readonly db: Database | null = null,
  ) {}

  @Post('people/preview')
  @HttpCode(200)
  @RateLimit({ windowMs: 60_000, max: 20 })
  async preview(@CurrentActor() actor: Actor | null, @Body() dto: PreviewDto) {
    assertPermission(actor, PERMISSIONS.PEOPLE_WRITE);
    if (dto.idempotencyKey && (dto.idempotencyKey.length < 8 || dto.idempotencyKey.length > 128)) {
      throw new BadRequestException('idempotencyKey must be 8-128 characters');
    }
    if (dto.idempotencyKey && this.db) {
      const compositeKey = `${actor!.id}:${dto.idempotencyKey}`;
      const [existing] = await this.db
        .select()
        .from(idempotencyKeys)
        .where(eq(idempotencyKeys.key, compositeKey))
        .limit(1);
      if (existing)
        return existing.response as Awaited<ReturnType<ImportService['previewPeopleCsv']>>;
      const result = await this.importer.previewPeopleCsv(dto.csv);
      try {
        await this.db.insert(idempotencyKeys).values({
          key: compositeKey,
          actorId: actor!.id,
          response: result as unknown as Record<string, unknown>,
        });
      } catch (error) {
        if ((error as { code?: string }).code === '23505') {
          const [race] = await this.db
            .select()
            .from(idempotencyKeys)
            .where(eq(idempotencyKeys.key, compositeKey))
            .limit(1);
          if (race) return race.response as typeof result;
        }
        throw error;
      }
      return result;
    }
    return this.importer.previewPeopleCsv(dto.csv);
  }
}
