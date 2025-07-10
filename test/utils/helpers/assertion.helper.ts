import { Response } from 'supertest';

/**
 * Common assertion helpers for API responses
 * Provides readable, reusable assertions for tests
 */
export class AssertionHelper {
  /**
   * Asserts a successful API response with standard structure
   */
  static assertSuccessResponse(response: Response, expectedStatus = 200): void {
    expect(response.status).toBe(expectedStatus);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('data');
    expect(response.body).toHaveProperty('meta');
    expect(response.body.meta).toHaveProperty('timestamp');
  }

  /**
   * Asserts an error API response with standard structure
   */
  static assertErrorResponse(
    response: Response,
    expectedStatus: number,
    expectedErrorCode?: string,
  ): void {
    expect(response.status).toBe(expectedStatus);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toHaveProperty('statusCode', expectedStatus);
    
    if (expectedErrorCode) {
      expect(response.body.error).toHaveProperty('code', expectedErrorCode);
    }
  }

  /**
   * Asserts pagination metadata
   */
  static assertPaginationMeta(
    response: Response,
    expectedTotal?: number,
  ): void {
    expect(response.body.meta).toHaveProperty('total');
    expect(response.body.meta).toHaveProperty('page');
    expect(response.body.meta).toHaveProperty('limit');
    
    if (expectedTotal !== undefined) {
      expect(response.body.meta.total).toBe(expectedTotal);
    }
  }

  /**
   * Asserts user object structure
   */
  static assertUserStructure(user: any): void {
    expect(user).toHaveProperty('id');
    expect(user).toHaveProperty('email');
    expect(typeof user.id).toBe('string');
    expect(typeof user.email).toBe('string');
  }

  /**
   * Asserts diary object structure
   */
  static assertDiaryStructure(diary: any): void {
    expect(diary).toHaveProperty('id');
    expect(diary).toHaveProperty('content');
    expect(diary).toHaveProperty('userId');
    expect(diary).toHaveProperty('totalCalories');
    expect(diary).toHaveProperty('calorieBreakdown');
    expect(diary).toHaveProperty('createdAt');
    expect(diary).toHaveProperty('updatedAt');
  }

  /**
   * Asserts food analysis result structure
   */
  static assertFoodAnalysisStructure(analysis: any): void {
    expect(analysis).toHaveProperty('ingredients');
    expect(analysis).toHaveProperty('totalCalories');
    expect(analysis).toHaveProperty('breakdown');
    expect(Array.isArray(analysis.ingredients)).toBe(true);
    expect(typeof analysis.totalCalories).toBe('number');
    expect(typeof analysis.breakdown).toBe('object');
  }

  /**
   * Asserts auth tokens structure
   */
  static assertAuthTokensStructure(tokens: any): void {
    expect(tokens).toHaveProperty('accessToken');
    expect(tokens).toHaveProperty('refreshToken');
    expect(typeof tokens.accessToken).toBe('string');
    expect(typeof tokens.refreshToken).toBe('string');
  }
}