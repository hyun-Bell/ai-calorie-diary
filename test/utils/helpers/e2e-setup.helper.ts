import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AllExceptionsFilter } from '@common/filters/all-exceptions.filter';
import { ResponseInterceptor } from '@common/interceptors/response.interceptor';
import { CustomLoggerService } from '@common/logger/custom-logger.service';
import { Reflector } from '@nestjs/core';
import { AppModule } from '../../../src/app.module';

export interface E2ETestContext {
  app: INestApplication;
  moduleFixture: TestingModule;
}

/**
 * Creates and configures a NestJS application for E2E testing
 * Centralizes all app setup logic to ensure consistency across tests
 */
export async function createE2ETestApp(): Promise<E2ETestContext> {
  const moduleFixture = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();

  configureGlobalPipesAndFilters(app);
  configureGlobalPrefix(app);

  await app.init();

  return { app, moduleFixture };
}

/**
 * Configures global pipes, filters, and interceptors
 */
export function configureGlobalPipesAndFilters(app: INestApplication): void {
  const reflector = app.get(Reflector);
  const logger = new CustomLoggerService();

  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new AllExceptionsFilter(logger));
  app.useGlobalInterceptors(new ResponseInterceptor(reflector));
}

/**
 * Sets the global API prefix
 */
export function configureGlobalPrefix(app: INestApplication): void {
  app.setGlobalPrefix('api');
}

/**
 * Properly closes the E2E test app and cleans up resources
 */
export async function closeE2ETestApp(context: E2ETestContext): Promise<void> {
  if (context.app) {
    await context.app.close();
  }
}
