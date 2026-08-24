import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  app.enableShutdownHooks();
  const port = Number(process.env.PORT) || 4000;
  await app.listen(port);
  Logger.log(`ChurchOS API listening on port ${port}`, 'Bootstrap');
}

bootstrap().catch((error) => {
  console.error(error);
  process.exit(1);
});
