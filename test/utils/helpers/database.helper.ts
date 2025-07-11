import { PrismaService } from '@common/prisma/prisma.service';
import { User } from '@prisma/client';

/**
 * Database cleanup helper for E2E tests
 * Ensures clean state between tests
 */
export class DatabaseHelper {
  constructor(private readonly prismaService: PrismaService) {}

  /**
   * Cleans all test data from the database
   * Order matters due to foreign key constraints
   */
  async cleanDatabase(): Promise<void> {
    await this.prismaService.$transaction(async (prisma) => {
      await prisma.diary.deleteMany();
      await prisma.refreshToken.deleteMany();
      await prisma.user.deleteMany();
    });
  }

  /**
   * Creates a test user in the database
   */
  async createTestUser(data: {
    email: string;
    password: string;
    targetCalories?: number;
  }): Promise<User> {
    return this.prismaService.user.create({
      data: {
        email: data.email,
        password: data.password,
        targetCalories: data.targetCalories,
      },
    });
  }

  /**
   * Finds a user by email
   */
  async findUserByEmail(email: string): Promise<User | null> {
    return this.prismaService.user.findUnique({
      where: { email },
    });
  }

  /**
   * Ensures database connection is properly closed
   */
  async disconnect(): Promise<void> {
    await this.prismaService.$disconnect();
  }
}
