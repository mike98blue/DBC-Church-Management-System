import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { PERMISSIONS, assertPermission, type Actor } from '@churchos/auth';
import { CurrentActor } from '../../common/decorators/current-actor.decorator.js';
import type { CustomFieldsService } from './custom-fields.service.js';
import type { CreateFieldDefinitionDto, SetFieldValueDto } from './dto/custom-field.dto.js';

@Controller('api/v1/custom-fields')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
export class CustomFieldsController {
  constructor(private readonly customFields: CustomFieldsService) {}

  @Post('definitions')
  @HttpCode(201)
  async createDefinition(
    @CurrentActor() actor: Actor | null,
    @Body() dto: CreateFieldDefinitionDto,
  ) {
    assertPermission(actor, PERMISSIONS.PEOPLE_WRITE);
    return this.customFields.createDefinition(dto);
  }

  @Get('definitions')
  async listDefinitions(@CurrentActor() actor: Actor | null) {
    assertPermission(actor, PERMISSIONS.PEOPLE_READ);
    return this.customFields.listDefinitions();
  }

  @Post('values')
  @HttpCode(200)
  async setValue(
    @CurrentActor() actor: Actor | null,
    @Body() dto: SetFieldValueDto,
    @Query('personId') personId: string,
  ) {
    assertPermission(actor, PERMISSIONS.PEOPLE_WRITE);
    return this.customFields.setValue(personId, dto.key, dto.value);
  }

  @Get('values')
  async getValues(@CurrentActor() actor: Actor | null, @Query('personId') personId: string) {
    assertPermission(actor, PERMISSIONS.PEOPLE_READ);
    return this.customFields.getPersonValues(personId);
  }
}
