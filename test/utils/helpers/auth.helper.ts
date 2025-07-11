import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { API_ENDPOINTS, TEST_USERS } from '../constants';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  tokens: AuthTokens;
}

/**
 * Authentication helper for E2E tests
 * Provides utilities for user registration, login, and token management
 */
export class AuthHelper {
  constructor(
    private readonly app: INestApplication,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Hashes a password using bcrypt
   */
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  /**
   * Creates a JWT token for testing
   */
  createTestToken(userId: string, email: string): string {
    return this.jwtService.sign({ sub: userId, email });
  }

  /**
   * Registers a new user via API
   */
  async registerUser(
    email: string = TEST_USERS.DEFAULT.email,
    password: string = TEST_USERS.DEFAULT.password,
  ): Promise<AuthenticatedUser> {
    const response = await request(this.app.getHttpServer())
      .post(API_ENDPOINTS.AUTH.REGISTER)
      .send({ email, password })
      .expect(201);

    return {
      id: response.body.id,
      email: response.body.email,
      tokens: {
        accessToken: response.body.accessToken,
        refreshToken: response.body.refreshToken,
      },
    };
  }

  /**
   * Logs in a user via API
   */
  async loginUser(email: string, password: string): Promise<AuthenticatedUser> {
    const response = await request(this.app.getHttpServer())
      .post(API_ENDPOINTS.AUTH.LOGIN)
      .send({ email, password })
      .expect(200);

    return {
      id: response.body.user.id,
      email: response.body.user.email,
      tokens: {
        accessToken: response.body.accessToken,
        refreshToken: response.body.refreshToken,
      },
    };
  }

  /**
   * Creates an authorization header
   */
  static createAuthHeader(token: string): { Authorization: string } {
    return { Authorization: `Bearer ${token}` };
  }

  /**
   * Makes an authenticated request
   */
  static authenticatedRequest(
    app: INestApplication,
    method: 'get' | 'post' | 'put' | 'delete',
    endpoint: string,
    token: string,
  ): request.Test {
    return request(app.getHttpServer())
      [method](endpoint)
      .set('Authorization', `Bearer ${token}`);
  }
}
