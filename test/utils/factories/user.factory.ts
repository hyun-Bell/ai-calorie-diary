import { User } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

export interface CreateUserParams {
  email?: string;
  password?: string;
  targetCalories?: number;
}

/**
 * Factory for creating test user data
 * Provides consistent and customizable user objects for testing
 */
export class UserFactory {
  private static userCounter = 0;

  /**
   * Creates a user with default or custom values
   */
  static create(params: CreateUserParams = {}): Omit<User, 'id' | 'createdAt' | 'updatedAt'> {
    this.userCounter++;
    
    return {
      email: params.email ?? `test${this.userCounter}@example.com`,
      password: params.password ?? 'hashedPassword123',
      targetCalories: params.targetCalories ?? 2000,
    };
  }

  /**
   * Creates a complete user object (including id and timestamps)
   */
  static createComplete(params: CreateUserParams = {}): User {
    return {
      id: uuidv4(),
      ...this.create(params),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Creates multiple users
   */
  static createMany(count: number, params: CreateUserParams = {}): User[] {
    return Array.from({ length: count }, () => this.createComplete(params));
  }

  /**
   * Creates a user with invalid data for testing validation
   */
  static createInvalid(): Record<string, any> {
    return {
      email: 'invalid-email-format',
      password: '123', // Too short
      targetCalories: -100, // Negative value
    };
  }

  /**
   * Resets the counter (useful between test suites)
   */
  static reset(): void {
    this.userCounter = 0;
  }
}