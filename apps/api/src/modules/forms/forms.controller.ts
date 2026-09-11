import {
  Body,
  Controller,
  Get,
  Header,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { PERMISSIONS, assertPermission, type Actor } from '@churchos/auth';
import { RateLimit } from '../../common/guards/rate-limit.guard.js';
import { CurrentActor } from '../../common/decorators/current-actor.decorator.js';
import type { CreateFormDto } from './dto/create-form.dto.js';
import type { SubmitFormDto } from './dto/submit-form.dto.js';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { FormsService } from './forms.service.js';

@Controller('api/v1/forms')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
export class FormsController {
  constructor(private readonly forms: FormsService) {}

  @Post()
  @HttpCode(201)
  async create(@CurrentActor() actor: Actor | null, @Body() dto: CreateFormDto) {
    assertPermission(actor, PERMISSIONS.FORMS_MANAGE);
    return this.forms.create(dto);
  }

  @Get()
  async list(@CurrentActor() actor: Actor | null) {
    // public forms are visible to anyone; staff can see all
    if (actor && actor.permissions.includes(PERMISSIONS.FORMS_MANAGE)) {
      return this.forms.list();
    }
    const all = await this.forms.list();
    return all.filter((f) => f.visibility === 'public');
  }

  @Get(':id')
  async get(@CurrentActor() actor: Actor | null, @Param('id', ParseUUIDPipe) id: string) {
    const result = await this.forms.get(id);
    if (result.form.visibility !== 'public') assertPermission(actor, PERMISSIONS.FORMS_MANAGE);
    return result;
  }

  @Post(':id/submissions')
  @HttpCode(201)
  @RateLimit({ windowMs: 60_000, max: 10 })
  async submit(
    @CurrentActor() actor: Actor | null,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SubmitFormDto,
  ) {
    const form = await this.forms.get(id);
    if (form.form.visibility !== 'public') assertPermission(actor, PERMISSIONS.FORMS_MANAGE);
    return this.forms.submit(id, dto, actor?.id ?? null);
  }

  @Get(':id/submissions')
  async listSubmissions(
    @CurrentActor() actor: Actor | null,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    assertPermission(actor, PERMISSIONS.FORMS_MANAGE);
    return this.forms.listSubmissions(id);
  }

  @Get(':id/submissions/export')
  @Header('Content-Type', 'text/csv')
  @Header('Content-Disposition', 'attachment; filename="form-submissions.csv"')
  async exportSubmissions(
    @CurrentActor() actor: Actor | null,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    assertPermission(actor, PERMISSIONS.FORMS_MANAGE);
    return this.forms.exportSubmissionsCsv(id);
  }
}
