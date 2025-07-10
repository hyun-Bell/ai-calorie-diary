/**
 * Test Constants
 * Centralized location for all test-related constants to avoid magic numbers/strings
 */

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// Test Timeouts
export const TIMEOUTS = {
  DEFAULT: 5000,
  LONG_RUNNING: 30000,
  DATABASE_OPERATION: 10000,
} as const;

// Test User Data
export const TEST_USERS = {
  DEFAULT: {
    email: 'test@example.com',
    password: 'password123',
  },
  SECONDARY: {
    email: 'test2@example.com',
    password: 'password456',
  },
  INVALID: {
    email: 'invalid-email',
    password: '123', // Too short
  },
} as const;

// Test File Paths
export const TEST_FILES = {
  VALID_IMAGE: 'assets/mac.png',
  INVALID_FILE: 'assets/test.txt',
  LARGE_IMAGE: 'assets/large_image.jpg',
} as const;

// File Size Limits
export const FILE_SIZE = {
  MAX_ALLOWED: 3 * 1024 * 1024, // 3MB
  OVERSIZED: 4 * 1024 * 1024, // 4MB
} as const;

// Test Nutrition Data
export const MOCK_NUTRITION = {
  HEALTHY_MEAL: {
    description: '건강한 식단',
    ingredients: ['닭가슴살', '브로콜리', '현미밥'],
    totalCalories: 448,
    breakdown: {
      닭가슴살: {
        protein: { amount: 30, unit: 'g', calories: 120 },
        fat: { amount: 5, unit: 'g', calories: 45 },
        carbohydrate: { amount: 0, unit: 'g', calories: 0 },
      },
      브로콜리: {
        protein: { amount: 3, unit: 'g', calories: 12 },
        fat: { amount: 0.5, unit: 'g', calories: 4.5 },
        carbohydrate: { amount: 7, unit: 'g', calories: 28 },
      },
      현미밥: {
        protein: { amount: 6, unit: 'g', calories: 24 },
        fat: { amount: 2, unit: 'g', calories: 18 },
        carbohydrate: { amount: 55, unit: 'g', calories: 220 },
      },
    },
  },
  PIZZA_MEAL: {
    description: '맛있는 피자',
    ingredients: ['피자 도우', '토마토 소스', '모짜렐라 치즈', '페퍼로니'],
    totalCalories: 854,
  },
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/api/auth/register',
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
  },
  USER: {
    INFO: '/api/user/info',
    TARGET_CALORIES: '/api/user/target-calories',
  },
  DIARY: {
    BASE: '/api/diary',
    BY_ID: (id: string) => `/api/diary/${id}`,
    BY_PERIOD: '/api/diary/period',
  },
  FOOD: {
    ANALYZE: '/api/food/analyze',
  },
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Unauthorized',
  INVALID_CREDENTIALS: 'Invalid credentials',
  USER_NOT_FOUND: 'User not found',
  DIARY_NOT_FOUND: 'Diary not found',
  INVALID_FILE_TYPE: 'Validation failed',
  FILE_TOO_LARGE: '파일 크기는 3MB를 초과할 수 없습니다.',
} as const;

// Test Database Names
export const TEST_DB = {
  E2E: 'ai-cal-diary-e2e',
  UNIT: 'ai-cal-diary-unit',
} as const;