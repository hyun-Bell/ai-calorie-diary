import * as request from 'supertest';
import { PrismaService } from '@common/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import {
  createE2ETestApp,
  closeE2ETestApp,
  E2ETestContext,
} from './utils/helpers/e2e-setup.helper';
import { DatabaseHelper } from './utils/helpers/database.helper';
import { AuthHelper } from './utils/helpers/auth.helper';
import { AssertionHelper } from './utils/helpers/assertion.helper';
import { UserFactory } from './utils/factories/user.factory';
import {
  API_ENDPOINTS,
  HTTP_STATUS,
  TEST_USERS,
  TIMEOUTS,
} from './utils/constants';

jest.setTimeout(TIMEOUTS.LONG_RUNNING);

describe('AuthController (e2e)', () => {
  let context: E2ETestContext;
  let dbHelper: DatabaseHelper;
  let authHelper: AuthHelper;

  beforeAll(async () => {
    context = await createE2ETestApp();
    const prismaService = context.app.get(PrismaService);
    dbHelper = new DatabaseHelper(prismaService);
    authHelper = new AuthHelper(context.app, context.app.get(JwtService));
  });

  beforeEach(async () => {
    await dbHelper.cleanDatabase();
    UserFactory.reset();
  });

  afterAll(async () => {
    await dbHelper.disconnect();
    await closeE2ETestApp(context);
  });

  describe('POST /auth/register', () => {
    it('should register a new user successfully', async () => {
      const newUser = UserFactory.create();

      const response = await request(context.app.getHttpServer())
        .post(API_ENDPOINTS.AUTH.REGISTER)
        .send({
          email: newUser.email,
          password: TEST_USERS.DEFAULT.password,
        })
        .expect(HTTP_STATUS.CREATED);

      AssertionHelper.assertUserStructure(response.body);
      AssertionHelper.assertAuthTokensStructure(response.body);
      expect(response.body.email).toBe(newUser.email);
    });

    it('should return error when email already exists', async () => {
      await dbHelper.createTestUser({
        email: TEST_USERS.DEFAULT.email,
        password: await AuthHelper.hashPassword(TEST_USERS.DEFAULT.password),
      });

      const response = await request(context.app.getHttpServer())
        .post(API_ENDPOINTS.AUTH.REGISTER)
        .send(TEST_USERS.DEFAULT)
        .expect(HTTP_STATUS.CONFLICT);

      AssertionHelper.assertErrorResponse(
        response,
        HTTP_STATUS.CONFLICT,
        'CONFLICT',
      );
    });

    it('should validate email format', async () => {
      const response = await request(context.app.getHttpServer())
        .post(API_ENDPOINTS.AUTH.REGISTER)
        .send({
          email: 'invalid-email',
          password: TEST_USERS.DEFAULT.password,
        })
        .expect(HTTP_STATUS.BAD_REQUEST);

      AssertionHelper.assertErrorResponse(
        response,
        HTTP_STATUS.BAD_REQUEST,
        'BAD_REQUEST',
      );
    });
  });

  describe('POST /auth/login', () => {
    it('should login with valid credentials', async () => {
      const hashedPassword = await AuthHelper.hashPassword(
        TEST_USERS.DEFAULT.password,
      );
      await dbHelper.createTestUser({
        ...TEST_USERS.DEFAULT,
        password: hashedPassword,
      });

      const response = await request(context.app.getHttpServer())
        .post(API_ENDPOINTS.AUTH.LOGIN)
        .send(TEST_USERS.DEFAULT)
        .expect(HTTP_STATUS.OK);

      AssertionHelper.assertAuthTokensStructure(response.body);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(TEST_USERS.DEFAULT.email);
    });

    it('should return error with invalid credentials', async () => {
      const response = await request(context.app.getHttpServer())
        .post(API_ENDPOINTS.AUTH.LOGIN)
        .send({
          email: 'nonexistent@example.com',
          password: 'wrongpassword',
        })
        .expect(HTTP_STATUS.UNAUTHORIZED);

      AssertionHelper.assertErrorResponse(
        response,
        HTTP_STATUS.UNAUTHORIZED,
        'UNAUTHORIZED',
      );
    });
  });

  describe('POST /auth/refresh', () => {
    it('should refresh tokens successfully', async () => {
      const authenticatedUser = await createAndLoginUser();

      const response = await request(context.app.getHttpServer())
        .post(API_ENDPOINTS.AUTH.REFRESH)
        .send({ refreshToken: authenticatedUser.tokens.refreshToken })
        .expect(HTTP_STATUS.OK);

      AssertionHelper.assertAuthTokensStructure(response.body);
    });

    it('should return error with invalid refresh token', async () => {
      const response = await request(context.app.getHttpServer())
        .post(API_ENDPOINTS.AUTH.REFRESH)
        .send({ refreshToken: 'invalid_token' })
        .expect(HTTP_STATUS.UNAUTHORIZED);

      AssertionHelper.assertErrorResponse(
        response,
        HTTP_STATUS.UNAUTHORIZED,
        'UNAUTHORIZED',
      );
    });
  });

  describe('POST /auth/logout', () => {
    it('should logout successfully', async () => {
      const authenticatedUser = await createAndLoginUser();

      const response = await request(context.app.getHttpServer())
        .post(API_ENDPOINTS.AUTH.LOGOUT)
        .set('Authorization', `Bearer ${authenticatedUser.tokens.accessToken}`)
        .expect(HTTP_STATUS.OK);

      AssertionHelper.assertSuccessResponse(response, HTTP_STATUS.OK);
      expect(response.body.data.message).toBe('Logout successful');
    });

    it('should return error when not authenticated', async () => {
      const response = await request(context.app.getHttpServer())
        .post(API_ENDPOINTS.AUTH.LOGOUT)
        .expect(HTTP_STATUS.UNAUTHORIZED);

      AssertionHelper.assertErrorResponse(response, HTTP_STATUS.UNAUTHORIZED);
    });
  });

  // Helper function to create and login a user
  async function createAndLoginUser() {
    const hashedPassword = await AuthHelper.hashPassword(
      TEST_USERS.SECONDARY.password,
    );
    await dbHelper.createTestUser({
      ...TEST_USERS.SECONDARY,
      password: hashedPassword,
    });

    return authHelper.loginUser(
      TEST_USERS.SECONDARY.email,
      TEST_USERS.SECONDARY.password,
    );
  }
});
