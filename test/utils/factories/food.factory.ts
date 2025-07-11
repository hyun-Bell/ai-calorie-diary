import { FoodBreakdown } from '@common/dto/Ingredient.dto';

export interface FoodAnalysisResult {
  ingredients: string[];
  totalCalories: number;
  breakdown: FoodBreakdown;
}

/**
 * Factory for creating test food analysis data
 * Provides consistent food analysis results for testing
 */
export class FoodFactory {
  private static analysisCounter = 0;
  /**
   * Creates a healthy meal analysis result
   */
  static createHealthyMeal(): FoodAnalysisResult {
    return {
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
    };
  }

  /**
   * Creates a pizza analysis result
   */
  static createPizzaMeal(): FoodAnalysisResult {
    return {
      ingredients: ['피자 도우', '토마토 소스', '모짜렐라 치즈', '페퍼로니'],
      totalCalories: 854,
      breakdown: {
        '피자 도우': {
          protein: { amount: 12, unit: 'g', calories: 48 },
          fat: { amount: 3, unit: 'g', calories: 27 },
          carbohydrate: { amount: 60, unit: 'g', calories: 240 },
        },
        '토마토 소스': {
          protein: { amount: 2, unit: 'g', calories: 8 },
          fat: { amount: 0.5, unit: 'g', calories: 4.5 },
          carbohydrate: { amount: 8, unit: 'g', calories: 32 },
        },
        '모짜렐라 치즈': {
          protein: { amount: 22, unit: 'g', calories: 88 },
          fat: { amount: 18, unit: 'g', calories: 162 },
          carbohydrate: { amount: 3, unit: 'g', calories: 12 },
        },
        페퍼로니: {
          protein: { amount: 20, unit: 'g', calories: 80 },
          fat: { amount: 35, unit: 'g', calories: 315 },
          carbohydrate: { amount: 2, unit: 'g', calories: 8 },
        },
      },
    };
  }

  /**
   * Creates a simple snack analysis result
   */
  static createSnack(): FoodAnalysisResult {
    return {
      ingredients: ['사과', '땅콩버터'],
      totalCalories: 267,
      breakdown: {
        사과: {
          protein: { amount: 0.5, unit: 'g', calories: 2 },
          fat: { amount: 0.3, unit: 'g', calories: 2.7 },
          carbohydrate: { amount: 25, unit: 'g', calories: 100 },
        },
        땅콩버터: {
          protein: { amount: 8, unit: 'g', calories: 32 },
          fat: { amount: 16, unit: 'g', calories: 144 },
          carbohydrate: { amount: 8, unit: 'g', calories: 32 },
        },
      },
    };
  }

  /**
   * Creates a custom food analysis result
   */
  static createCustom(
    ingredients: string[],
    totalCalories: number,
    breakdown: FoodBreakdown,
  ): FoodAnalysisResult {
    return {
      ingredients,
      totalCalories,
      breakdown,
    };
  }

  /**
   * Creates food analysis request data
   */
  static createAnalysisRequest(description: string = '음식 분석') {
    return {
      description,
    };
  }

  /**
   * Alias for createHealthyMeal for backwards compatibility
   */
  static createHealthyMealAnalysis(): FoodAnalysisResult {
    return this.createHealthyMeal();
  }

  /**
   * Resets the counter
   */
  static reset(): void {
    this.analysisCounter = 0;
  }
}
