import { v4 as uuidv4 } from 'uuid';
import { Diary } from '../../../src/diary/domain/diary';
import { FoodBreakdown } from '@common/dto/Ingredient.dto';

export interface CreateDomainDiaryParams {
  id?: string;
  content?: string;
  imageUrl?: string;
  userId?: string;
  totalCalories?: number;
  calorieBreakdown?: FoodBreakdown;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Factory for creating test diary domain entities
 * Provides consistent diary objects matching the domain model
 */
export class DomainDiaryFactory {
  private static diaryCounter = 0;

  /**
   * Creates a domain diary entity
   */
  static create(params: CreateDomainDiaryParams = {}): Diary {
    this.diaryCounter++;

    return new Diary(
      params.id ?? uuidv4(),
      params.content ?? `Test diary entry ${this.diaryCounter}`,
      params.imageUrl ?? `http://test-image-${this.diaryCounter}.jpg`,
      params.userId ?? uuidv4(),
      params.createdAt ?? new Date(),
      params.updatedAt ?? new Date(),
      params.totalCalories ?? 500,
      params.calorieBreakdown ?? this.createDefaultBreakdown(),
    );
  }

  /**
   * Creates a diary without image
   */
  static createWithoutImage(params: CreateDomainDiaryParams = {}): Diary {
    const diaryParams = {
      ...params,
      imageUrl: null,
    };
    
    this.diaryCounter++;
    
    return new Diary(
      diaryParams.id ?? uuidv4(),
      diaryParams.content ?? `Test diary entry ${this.diaryCounter}`,
      null, // Explicitly set imageUrl to null
      diaryParams.userId ?? uuidv4(),
      diaryParams.createdAt ?? new Date(),
      diaryParams.updatedAt ?? new Date(),
      diaryParams.totalCalories ?? 500,
      diaryParams.calorieBreakdown ?? this.createDefaultBreakdown(),
    );
  }

  /**
   * Creates multiple diary entries
   */
  static createMany(count: number, userId: string, params: CreateDomainDiaryParams = {}): Diary[] {
    return Array.from({ length: count }, () => 
      this.create({ ...params, userId })
    );
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
      '닭가슴살': {
        protein: { amount: 30, unit: 'g', calories: 120 },
        fat: { amount: 5, unit: 'g', calories: 45 },
        carbohydrate: { amount: 0, unit: 'g', calories: 0 },
      },
      '브로콜리': {
        protein: { amount: 3, unit: 'g', calories: 12 },
        fat: { amount: 0.5, unit: 'g', calories: 4.5 },
        carbohydrate: { amount: 7, unit: 'g', calories: 28 },
      },
      '현미밥': {
        protein: { amount: 6, unit: 'g', calories: 24 },
        fat: { amount: 2, unit: 'g', calories: 18 },
        carbohydrate: { amount: 55, unit: 'g', calories: 220 },
      },
    };
  }

  /**
   * Resets the counter
   */
  static reset(): void {
    this.diaryCounter = 0;
  }
}