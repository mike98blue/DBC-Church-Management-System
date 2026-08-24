import { Body, Controller, Get, Header, HttpCode, Post, UsePipes, ValidationPipe, Headers, Req } from '@nestjs/common';
import { PERMISSIONS, assertPermission, type Actor } from '@churchos/auth';
import { CurrentActor } from '../../common/decorators/current-actor.decorator.js';
import type { ReportingService } from '../reporting/reporting.service.js';
import type { CreateCheckoutDto, CreateFundDto } from './dto/create-fund.dto.js';
import type { GivingService } from './giving.service.js';

@Controller('api/v1/giving')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
export class GivingController {
  constructor(
    private readonly giving: GivingService,
    private readonly reporting: ReportingService
  ) {}

  @Get('funds')
  async listFunds(@CurrentActor() actor: Actor | null) {
    assertPermission(actor, PERMISSIONS.GIVING_READ);
    return this.giving.listFunds();
  }

  @Post('funds')
  @HttpCode(201)
  async createFund(@CurrentActor() actor: Actor | null, @Body() dto: CreateFundDto) {
    assertPermission(actor, PERMISSIONS.GIVING_MANAGE);
    return this.giving.createFund(dto.name, dto.description);
  }

  @Post('checkout')
  @HttpCode(201)
  async checkout(@CurrentActor() actor: Actor | null, @Body() dto: CreateCheckoutDto) {
    assertPermission(actor, PERMISSIONS.GIVING_READ);
    return this.giving.createCheckoutSession({
      fundId: dto.fundId,
      amountCents: dto.amountCents,
      currency: dto.currency,
    });
  }

  @Get('contributions')
  async listContributions(@CurrentActor() actor: Actor | null) {
    assertPermission(actor, PERMISSIONS.GIVING_READ);
    return this.giving.listContributions();
  }

  @Get('export')
  @Header('Content-Type', 'text/csv')
  @Header('Content-Disposition', 'attachment; filename="giving.csv"')
  async exportGiving(@CurrentActor() actor: Actor | null) {
    assertPermission(actor, PERMISSIONS.GIVING_EXPORT);
    return this.reporting.exportGivingCsv(actor?.id ?? null);
  }

  @Post('webhook')
  @HttpCode(200)
  async webhook(@Req() req: { rawBody?: string; body?: unknown }, @Headers('stripe-signature') signature?: string) {
    const raw =
      (req as unknown as { rawBody?: string }).rawBody ??
      JSON.stringify((req as unknown as { body?: unknown }).body ?? {});
    return this.giving.handleWebhook(raw, signature ?? null);
  }
}
