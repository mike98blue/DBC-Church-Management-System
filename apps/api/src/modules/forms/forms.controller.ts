import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { PERMISSIONS, assertPermission, type Actor } from '@churchos/auth';
import { CurrentActor } from '../../common/decorators/current-actor.decorator.js';
import type { CreateFormDto } from './dto/create-form.dto.js';
import type { SubmitFormDto } from './dto/submit-form.dto.js';
import type { FormsService } from './forms.service.js';

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
  async get(@Param('id', ParseUUIDPipe) id: string) {
    return this.forms.get(id);
  }

  @Post(':id/submissions')
  @HttpCode(201)
  async submit(
    @CurrentActor() actor: Actor | null,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SubmitFormDto,
  ) {
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
}
