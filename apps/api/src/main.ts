import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { logger, requestIdMiddleware } from '@churchos/observability';
import { AppModule } from './app.module.js';

function assertProductionConfig(): void {
  if (process.env.NODE_ENV !== 'production') return;
  if (
    !process.env.OIDC_ISSUER ||
    !process.env.OIDC_AUDIENCE ||
    (!process.env.OIDC_JWKS_URI && !process.env.OIDC_JWKS_JSON)
  ) {
    throw new Error('Production OIDC configuration is incomplete');
  }
  if (process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_WEBHOOK_SECRET) {
    throw new Error(
      'STRIPE_WEBHOOK_SECRET is required when STRIPE_SECRET_KEY is set in production',
    );
  }
}

async function bootstrap(): Promise<void> {
  assertProductionConfig();
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { rawBody: true });

  // B-07: security headers baseline (CSP allows Next.js dev assets on the web app origin)
  app.use(
    helmet({
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'default-src': ["'self'"],
          'frame-ancestors': ["'self'"],
        },
      },
      crossOriginEmbedderPolicy: false,
    }),
  );
  app.set('trust proxy', 1);
  const swaggerConfig = new DocumentBuilder()
    .setTitle('ChurchOS API')
    .setDescription('Generated from source — no direct ORM exposure (ADR 0006)')
    .setVersion('1.0.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'bearer')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig, {
    operationIdFactory: (_controllerKey: string, methodKey: string) => methodKey,
  });
  SwaggerModule.setup('docs', app, document, { jsonDocumentUrl: '/api/v1/openapi.json' });
  for (const candidate of [
    resolve(process.cwd(), 'apps/api/openapi.json'),
    resolve(process.cwd(), 'openapi.json'),
  ]) {
    try {
      writeFileSync(candidate, JSON.stringify(document, null, 2));
      break;
    } catch {
      // try next candidate
    }
  }
  app.use(requestIdMiddleware);
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );
  app.enableShutdownHooks();
  const port = Number(process.env.PORT) || 4000;
  await app.listen(port);
  logger.info({ port }, 'ChurchOS API listening');
}

bootstrap().catch((error) => {
  logger.error({ err: error }, 'Bootstrap failed');
  process.exit(1);
});
