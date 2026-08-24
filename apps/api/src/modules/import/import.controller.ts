import { Body, Controller, HttpCode, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { IsString } from 'class-validator';
import { PERMISSIONS, assertPermission, type Actor } from '@churchos/auth';
import { CurrentActor } from '../../common/decorators/current-actor.decorator.js';
import type { ImportService } from './import.service.js';

export class PreviewDto {
  @IsString()
  csv!: string;
}

@Controller('api/v1/import')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
export class ImportController {
  constructor(private readonly importer: ImportService) {}

  @Post('people/preview')
  @HttpCode(200)
  async preview(@CurrentActor() actor: Actor | null, @Body() dto: PreviewDto) {
    assertPermission(actor, PERMISSIONS.PEOPLE_WRITE);
    return this.importer.previewPeopleCsv(dto.csv);
  }
}
