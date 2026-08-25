import { Body, Controller, HttpCode, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { PERMISSIONS, assertPermission, type Actor } from '@churchos/auth';
import { CurrentActor } from '../../common/decorators/current-actor.decorator.js';
import type { DuplicateCheckDto } from './dto/duplicate-check.dto.js';
import type { DuplicateService } from './duplicate.service.js';

@Controller('api/v1/people')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
export class DuplicateController {
  constructor(private readonly duplicates: DuplicateService) {}

  @Post('duplicate-check')
  @HttpCode(200)
  async check(@CurrentActor() actor: Actor | null, @Body() dto: DuplicateCheckDto) {
    assertPermission(actor, PERMISSIONS.PEOPLE_READ);
    return this.duplicates.findDuplicates(dto);
  }
}
