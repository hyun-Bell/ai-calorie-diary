import { Diary } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { FoodBreakdown } from '@common/dto/Ingredient.dto';

export interface CreateDiaryParams {
  id?: string;
  content?: string;
  imageUrl?: string | null;
  userId?: string;
  totalCalories?: number;
  calorieBreakdown?: FoodBreakdown;
  mealTime?: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';
}

/**
 * Factory for creating test diary data
 * Provides consistent and customizable diary objects for testing
 */
export class DiaryFactory {
  private static diaryCounter = 0;

  /**
   * Creates a diary entry with default or custom values
   */
  static create(
    params: CreateDiaryParams = {},
  ): Omit<Diary, 'id' | 'createdAt' | 'updatedAt'> {
    this.diaryCounter++;

    return {
      content: params.content ?? `Test diary entry ${this.diaryCounter}`,
      imageUrl:
        params.imageUrl !== undefined
          ? params.imageUrl
          : `http://test-image-${this.diaryCounter}.jpg`,
      userId: params.userId ?? uuidv4(),
      totalCalories: params.totalCalories ?? 500,
      calorieBreakdown:
        params.calorieBreakdown ?? this.createDefaultBreakdown(),
      mealTime: params.mealTime ?? 'LUNCH',
    };
  }

  /**
   * Creates a complete diary object (including id and timestamps)
   */
  static createComplete(params: CreateDiaryParams = {}): Diary {
    return {
      id: params.id ?? uuidv4(),
      ...this.create(params),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Creates multiple diary entries
   */
  static createMany(
    count: number,
    userId: string,
    params: CreateDiaryParams = {},
  ): Diary[] {
    return Array.from({ length: count }, () =>
      this.createComplete({ ...params, userId }),
    );
  }

  /**
   * Creates a diary entry with specific date
   */
  static createWithDate(date: Date, params: CreateDiaryParams = {}): Diary {
    const diary = this.createComplete(params);
    diary.createdAt = date;
    diary.updatedAt = date;
    return diary;
  }

  /**
   * Creates a default calorie breakdown
   */
  private static createDefaultBreakdown(): FoodBreakdown {
    return {
      'Test Food': {
        protein: { amount: 20, unit: 'g', calories: 80 },
        fat: { amount: 10, unit: 'g', calories: 90 },
        carbohydrate: { amount: 50, unit: 'g', calories: 200 },
      },
    };
  }

  /**
   * Creates a healthy meal breakdown
   */
  static createHealthyMealBreakdown(): FoodBreakdown {
    return {
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
    };
  }

  /**
   * Creates diary data for testing validation errors
   */
  static createInvalid(): Record<string, any> {
    return {
      content: '', // Empty content
      imageUrl: 'invalid-url',
      userId: 'invalid-uuid',
      totalCalories: -100, // Negative calories
      calorieBreakdown: 'invalid', // Wrong type
    };
  }

  /**
   * Resets the counter
   */
  static reset(): void {
    this.diaryCounter = 0;
  }
}
