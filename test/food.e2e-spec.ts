import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import * as path from 'path';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@common/prisma/prisma.service';

describe('FoodController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let jwtService: JwtService;
  let prismaService: PrismaService;
  const isMockMode = process.env.USE_MOCK_OPENAI === 'true';

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prismaService = app.get(PrismaService);
    jwtService = app.get(JwtService);
    // 데이터베이스 정리
    await prismaService.$transaction(async (prisma) => {
      await prisma.diary.deleteMany();
      await prisma.user.deleteMany();

      // 테스트용 사용자 생성
      const user = await prisma.user.create({
        data: {
          email: 'test_diary@example.com',
          password: 'hashedpassword',
        },
      });

      // JWT 토큰 생성
      authToken = jwtService.sign({ sub: user.id, email: user.email });
    });
  });

  describe('Food Analysis Tests', () => {
    if (isMockMode) {
      it('/food/analyze (POST) - mock: default scenario', () => {
        const filePath = path.join(__dirname, 'assets', 'mac.png');

        return request(app.getHttpServer())
          .post('/food/analyze')
          .set('Authorization', `Bearer ${authToken}`)
          .attach('image', filePath)
          .field('description', '건강한 식단')
          .expect(201)
          .expect((res) => {
            expect(res.body.ingredients).toEqual([
              '닭가슴살',
              '브로콜리',
              '현미밥',
            ]);
            expect(res.body.totalCalories).toBe(448);
            expect(res.body.breakdown).toHaveProperty('닭가슴살');
          });
      });

      it('/food/analyze (POST) - mock: pizza scenario', () => {
        const filePath = path.join(__dirname, 'assets', 'mac.png');

        return request(app.getHttpServer())
          .post('/food/analyze')
          .set('Authorization', `Bearer ${authToken}`)
          .attach('image', filePath)
          .field('description', '맛있는 피자')
          .expect(201)
          .expect((res) => {
            expect(res.body.ingredients).toEqual([
              '피자 도우',
              '토마토 소스',
              '모짜렐라 치즈',
              '페퍼로니',
            ]);
            expect(res.body.totalCalories).toBe(854);
          });
      });

      it('/food/analyze (POST) - mock: error scenario', () => {
        const filePath = path.join(__dirname, 'assets', 'mac.png');

        // 에러 테스트 시 콘솔 에러 로그는 정상적인 동작입니다
        return request(app.getHttpServer())
          .post('/food/analyze')
          .set('Authorization', `Bearer ${authToken}`)
          .attach('image', filePath)
          .field('description', '에러 테스트')
          .expect(500)
          .expect((res) => {
            expect(res.body.message).toContain(
              'Mock API error for testing purposes',
            );
          });
      });
    } else {
      it('/food/analyze (POST) - real API: basic functionality', () => {
        const filePath = path.join(__dirname, 'assets', 'mac.png');

        return request(app.getHttpServer())
          .post('/food/analyze')
          .set('Authorization', `Bearer ${authToken}`)
          .attach('image', filePath)
          .field('description', '음식 사진 분석')
          .expect(201)
          .expect((res) => {
            // 실제 API이므로 구체적인 값 검증보다는 구조 검증
            expect(res.body).toHaveProperty('ingredients');
            expect(res.body).toHaveProperty('totalCalories');
            expect(res.body).toHaveProperty('breakdown');
            expect(Array.isArray(res.body.ingredients)).toBe(true);
            expect(typeof res.body.totalCalories).toBe('number');
          });
      }, 30000); // 실제 API는 시간이 더 걸림
    }
  });

  it('/food/analyze (POST) - file size exceeds limit', () => {
    const largeFakeFile = Buffer.alloc(4 * 1024 * 1024); // 4MB

    return request(app.getHttpServer())
      .post('/food/analyze')
      .set('Authorization', `Bearer ${authToken}`)
      .attach('image', largeFakeFile, 'large_image.jpg')
      .field('description', '큰 이미지')
      .expect(400)
      .expect((res) => {
        expect(res.body.message).toContain(
          '파일 크기는 3MB를 초과할 수 없습니다.',
        );
      });
  });

  it('/food/analyze (POST) - invalid file type', () => {
    const filePath = path.join(__dirname, 'assets', 'test.txt');

    return request(app.getHttpServer())
      .post('/food/analyze')
      .set('Authorization', `Bearer ${authToken}`)
      .attach('image', filePath)
      .field('description', '잘못된 파일 타입')
      .expect(400)
      .expect((res) => {
        expect(res.body.message).toContain(
          'Validation failed (expected type is /(jpg|jpeg|png)$/)',
        );
      });
  });

  afterAll(async () => {
    await prismaService.$transaction(async (prisma) => {
      await prisma.diary.deleteMany();
      await prisma.user.deleteMany();
    });
    await prismaService.$disconnect();
    await app.close();
  });
});
