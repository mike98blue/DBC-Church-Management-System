import 'reflect-metadata';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { logger } from '@churchos/observability';
import { requestIdMiddleware } from '@churchos/observability';
import { AppModule } from './app.module.js';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  app.use(requestIdMiddleware);
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );
  app.enableShutdownHooks();
  const port = Number(process.env.PORT) || 4000;
  await app.listen(port);
  logger.info({ port }, 'ChurchOS API listening');
  Logger.log(`ChurchOS API listening on port ${port}`, 'Bootstrap');
}

bootstrap().catch((error) => {
  logger.error({ err: error }, 'Bootstrap failed');
  console.error(error);
  process.exit(1);
});
