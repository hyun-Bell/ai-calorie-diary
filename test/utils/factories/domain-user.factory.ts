import { v4 as uuidv4 } from 'uuid';
import { User } from '../../../src/user/domain/user';

export interface CreateDomainUserParams {
  id?: string;
  email?: string;
  password?: string;
  targetCalories?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Factory for creating test user domain entities
 * Provides consistent user objects matching the domain model
 */
export class DomainUserFactory {
  private static userCounter = 0;

  /**
   * Creates a domain user entity
   */
  static create(params: CreateDomainUserParams = {}): User {
    this.userCounter++;

    return new User(
      params.id ?? uuidv4(),
      params.email ?? `test${this.userCounter}@example.com`,
      params.password ?? 'hashedPassword123',
      params.targetCalories ?? 2000,
      params.createdAt ?? new Date(),
      params.updatedAt ?? new Date(),
    );
  }

  /**
   * Creates multiple user entities
   */
  static createMany(
    count: number,
    params: CreateDomainUserParams = {},
  ): User[] {
    return Array.from({ length: count }, () => this.create(params));
  }

  /**
   * Resets the counter
   */
  static reset(): void {
    this.userCounter = 0;
  }
}
