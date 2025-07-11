import * as path from 'path';
import * as request from 'supertest';
import * as fs from 'fs';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '@common/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { AppModule } from '../src/app.module';
import {
  configureGlobalPipesAndFilters,
  configureGlobalPrefix,
} from './utils/helpers/e2e-setup.helper';
import { DatabaseHelper } from './utils/helpers/database.helper';
import { AssertionHelper } from './utils/helpers/assertion.helper';
import { createMockAuthGuard } from './utils/helpers/mock-auth.helper';
import {
  API_ENDPOINTS,
  HTTP_STATUS,
  TEST_FILES,
  FILE_SIZE,
  MOCK_NUTRITION,
  ERROR_MESSAGES,
  TIMEOUTS,
} from './utils/constants';

const isMockMode = process.env.USE_MOCK_OPENAI === 'true';

describe('FoodController (e2e)', () => {
  let app: any;
  let moduleFixture: TestingModule;
  let dbHelper: DatabaseHelper;
  let jwtService: JwtService;
  let testUserId: string;
  let authToken: string;

  beforeEach(async () => {
    // Create test module with mock auth guard
    moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(createMockAuthGuard(() => testUserId))
      .compile();

    app = moduleFixture.createNestApplication();

    // Configure app
    configureGlobalPipesAndFilters(app);
    configureGlobalPrefix(app);

    await app.init();

    // Setup services and helpers
    const prismaService = app.get(PrismaService);
    dbHelper = new DatabaseHelper(prismaService);
    jwtService = app.get(JwtService);

    // Setup test data
    await dbHelper.cleanDatabase();
    const user = await dbHelper.createTestUser({
      email: 'test@example.com',
      password: 'hashedpassword',
    });
    testUserId = user.id;
    authToken = jwtService.sign({ sub: user.id, email: user.email });
  });

  afterEach(async () => {
    await dbHelper.disconnect();
    await app.close();
  });

  describe('POST /food/analyze', () => {
    describe('with mock OpenAI', () => {
      if (!isMockMode) {
        it.skip('skipped when not in mock mode', () => {});
        return;
      }

      it('should analyze healthy meal', async () => {
        const response = await uploadFoodImage(
          MOCK_NUTRITION.HEALTHY_MEAL.description,
        );

        expect(response.status).toBe(HTTP_STATUS.CREATED);
        AssertionHelper.assertSuccessResponse(response, HTTP_STATUS.CREATED);
        AssertionHelper.assertFoodAnalysisStructure(response.body.data);

        const { data } = response.body;
        expect(data.ingredients).toEqual(
          MOCK_NUTRITION.HEALTHY_MEAL.ingredients,
        );
        expect(data.totalCalories).toBe(
          MOCK_NUTRITION.HEALTHY_MEAL.totalCalories,
        );
        expect(data.breakdown).toHaveProperty(
          MOCK_NUTRITION.HEALTHY_MEAL.ingredients[0],
        );
      });

      it('should analyze pizza meal', async () => {
        const response = await uploadFoodImage(
          MOCK_NUTRITION.PIZZA_MEAL.description,
        );

        expect(response.status).toBe(HTTP_STATUS.CREATED);
        AssertionHelper.assertSuccessResponse(response, HTTP_STATUS.CREATED);

        const { data } = response.body;
        expect(data.ingredients).toEqual(MOCK_NUTRITION.PIZZA_MEAL.ingredients);
        expect(data.totalCalories).toBe(
          MOCK_NUTRITION.PIZZA_MEAL.totalCalories,
        );
      });

      it('should handle analysis errors', async () => {
        const response = await uploadFoodImage('에러 테스트');

        expect(response.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
        AssertionHelper.assertErrorResponse(
          response,
          HTTP_STATUS.INTERNAL_SERVER_ERROR,
        );
        expect(response.body.error.message).toContain(
          'Mock API error for testing purposes',
        );
      });
    });

    describe('with real OpenAI API', () => {
      if (isMockMode) {
        it.skip('skipped when in mock mode', () => {});
        return;
      }

      it(
        'should analyze food image',
        async () => {
          const response = await uploadFoodImage('음식 사진 분석');

          expect(response.status).toBe(HTTP_STATUS.CREATED);
          AssertionHelper.assertSuccessResponse(response, HTTP_STATUS.CREATED);
          AssertionHelper.assertFoodAnalysisStructure(response.body.data);
        },
        TIMEOUTS.LONG_RUNNING,
      );
    });

    describe('file validation', () => {
      it('should reject files exceeding size limit', async () => {
        const largeFakeFile = Buffer.alloc(FILE_SIZE.OVERSIZED);

        try {
          const response = await request(app.getHttpServer())
            .post(API_ENDPOINTS.FOOD.ANALYZE)
            .set('Authorization', `Bearer ${authToken}`)
            .attach('image', largeFakeFile, 'large_image.jpg')
            .field('description', 'Large file test')
            .expect(HTTP_STATUS.BAD_REQUEST);

          AssertionHelper.assertErrorResponse(
            response,
            HTTP_STATUS.BAD_REQUEST,
          );
          expect(response.body.error.message).toContain(
            ERROR_MESSAGES.FILE_TOO_LARGE,
          );
        } catch (error: any) {
          // ECONNRESET is expected for large files
          if (error.code !== 'ECONNRESET') {
            throw error;
          }
        }
      });

      it.skip('should reject invalid file types', async () => {
        const testFilePath = path.join(__dirname, TEST_FILES.INVALID_FILE);

        if (!fs.existsSync(testFilePath)) {
          console.warn(`Test file not found: ${testFilePath}`);
          return;
        }

        const response = await request(app.getHttpServer())
          .post(API_ENDPOINTS.FOOD.ANALYZE)
          .set('Authorization', `Bearer ${authToken}`)
          .attach('image', testFilePath)
          .field('description', 'Invalid file type test')
          .expect(HTTP_STATUS.BAD_REQUEST);

        AssertionHelper.assertErrorResponse(response, HTTP_STATUS.BAD_REQUEST);
        expect(response.body.error.message).toContain(
          ERROR_MESSAGES.INVALID_FILE_TYPE,
        );
      });
    });
  });

  // Helper function to upload food image
  async function uploadFoodImage(description: string) {
    const imagePath = path.join(__dirname, TEST_FILES.VALID_IMAGE);

    return request(app.getHttpServer())
      .post(API_ENDPOINTS.FOOD.ANALYZE)
      .set('Authorization', `Bearer ${authToken}`)
      .attach('image', imagePath)
      .field('description', description);
  }
});
