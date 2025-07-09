import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AllExceptionsFilter } from '@common/filters/all-exceptions.filter';
import { CustomLoggerService } from '@common/logger/custom-logger.service';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const logger = new CustomLoggerService();

  const app = await NestFactory.create(AppModule, {
    logger,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter(logger));
  app.setGlobalPrefix('api');
  app.use(cookieParser());

  const config = new DocumentBuilder()
    .setTitle('AI 칼로리 다이어리 API')
    .setDescription(
      '음식 사진을 분석하여 칼로리를 계산하고 일기를 작성하는 API',
    )
    .setVersion('1.0')
    .addTag('auth', '인증 관련 API')
    .addTag('diary', '일기 관련 API')
    .addTag('food', '음식 분석 관련 API')
    .addTag('user', '사용자 관련 API')
    .addBearerAuth()
    .addServer('http://localhost:3000', '개발 서버')
    .build();

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT');

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, document);

  app.enableCors();
  await app.listen(port);

  console.log('\n🚀 \x1b[32m\x1b[1mAI Calorie Diary API is running!\x1b[0m\n');
  console.log(`📱 Server URL: \x1b[36mhttp://localhost:${port}/api\x1b[0m`);
  console.log(`📖 Swagger docs: \x1b[36mhttp://localhost:${port}/api\x1b[0m`);
}
bootstrap();
