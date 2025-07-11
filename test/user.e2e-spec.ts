// test/user.e2e-spec.ts

import { AllExceptionsFilter } from '@common/filters/all-exceptions.filter';
import { ResponseInterceptor } from '@common/interceptors/response.interceptor';
import { CustomLoggerService } from '@common/logger/custom-logger.service';
import { PrismaService } from '@common/prisma/prisma.service';
import { INestApplication } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { User } from '@user/domain/user';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('UserController (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let prismaService: PrismaService;
  let testUser: User;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    const reflector = app.get(Reflector);
    const logger = new CustomLoggerService();

    app.useGlobalFilters(new AllExceptionsFilter(logger));
    app.useGlobalInterceptors(new ResponseInterceptor(reflector));
    app.setGlobalPrefix('api');

    await app.init();

    jwtService = app.get(JwtService);
    prismaService = app.get(PrismaService);

    // 테스트용 사용자 생성
    const uniqueEmail = `test_${Date.now()}@example.com`;
    testUser = await prismaService.user.create({
      data: {
        email: uniqueEmail,
        password: 'hashedpassword',
        targetCalories: 2000,
      },
    });

    // JWT 토큰 생성
    authToken = jwtService.sign({ sub: testUser.id, email: testUser.email });
  });

  afterAll(async () => {
    // 테스트용 사용자 삭제
    await prismaService.user.delete({ where: { id: testUser.id } });
    await app.close();
  });

  describe('/user/info (GET)', () => {
    it('should return user info', () => {
      return request(app.getHttpServer())
        .get('/api/user/info')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('success', true);
          expect(res.body).toHaveProperty('data');
          expect(res.body.data).toHaveProperty('id', testUser.id);
          expect(res.body.data).toHaveProperty('email', testUser.email);
          expect(res.body.data).toHaveProperty(
            'targetCalories',
            testUser.targetCalories,
          );
          expect(res.body.data).toHaveProperty('createdAt');
          expect(res.body.data).toHaveProperty('updatedAt');
        });
    });

    it('should return 401 Unauthorized when no token is provided', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/user/info')
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('code', 'UNAUTHORIZED');
    });
  });

  describe('/user/target-calories (PUT)', () => {
    it('should update target calories', () => {
      const newTargetCalories = 2500;
      return request(app.getHttpServer())
        .put('/api/user/target-calories')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ targetCalories: newTargetCalories })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('success', true);
          expect(res.body).toHaveProperty('data');
          expect(res.body.data).toHaveProperty(
            'message',
            'Target calories updated successfully',
          );
          expect(res.body.data).toHaveProperty(
            'targetCalories',
            newTargetCalories,
          );
        });
    });

    it('should return 400 Bad Request when invalid calories are provided', async () => {
      const response = await request(app.getHttpServer())
        .put('/api/user/target-calories')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ targetCalories: 499 }) // 최소값 미만
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('code', 'BAD_REQUEST');
    });

    it('should return 401 Unauthorized when no token is provided', async () => {
      const response = await request(app.getHttpServer())
        .put('/api/user/target-calories')
        .send({ targetCalories: 2500 })
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('code', 'UNAUTHORIZED');
    });
  });
});
