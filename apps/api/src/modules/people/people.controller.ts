import {
  Body,
  Controller,
  Get,
  Header,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { assertPermission, PERMISSIONS, type Actor } from '@churchos/auth';
import { CurrentActor } from '../../common/decorators/current-actor.decorator.js';
import type { ReportingService } from '../reporting/reporting.service.js';
import type { CreatePersonDto } from './dto/create-person.dto.js';
import type { UpdatePersonDto } from './dto/update-person.dto.js';
import type { PeopleService } from './people.service.js';

@Controller('api/v1/people')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
export class PeopleController {
  constructor(
    private readonly people: PeopleService,
    private readonly reporting: ReportingService,
  ) {}

  @Get('export')
  @Header('Content-Type', 'text/csv')
  @Header('Content-Disposition', 'attachment; filename="people.csv"')
  async export(@CurrentActor() actor: Actor | null) {
    assertPermission(actor, PERMISSIONS.PEOPLE_EXPORT);
    return this.reporting.exportPeopleCsv(actor?.id ?? null);
  }

  @Get()
  async list(
    @CurrentActor() actor: Actor | null,
    @Query('q') q?: string,
    @Query('status') status?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    assertPermission(actor, PERMISSIONS.PEOPLE_READ);
    return this.people.list({
      q,
      status,
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
    });
  }

  @Get(':id')
  async get(@CurrentActor() actor: Actor | null, @Param('id', ParseUUIDPipe) id: string) {
    assertPermission(actor, PERMISSIONS.PEOPLE_READ);
    return this.people.get(id);
  }

  @Post()
  @HttpCode(201)
  async create(@CurrentActor() actor: Actor | null, @Body() dto: CreatePersonDto) {
    assertPermission(actor, PERMISSIONS.PEOPLE_WRITE);
    return this.people.create(dto, actor?.id ?? null);
  }

  @Patch(':id')
  async update(
    @CurrentActor() actor: Actor | null,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePersonDto,
  ) {
    assertPermission(actor, PERMISSIONS.PEOPLE_WRITE);
    return this.people.update(id, dto, actor?.id ?? null);
  }
}
