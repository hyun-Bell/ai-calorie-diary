export interface MockFoodScenario {
  keywords: string[];
  ingredients: string[];
  totalCalories: number;
  breakdown: Record<
    string,
    {
      protein: { amount: number; unit: string; calories: number };
      fat: { amount: number; unit: string; calories: number };
      carbohydrate: { amount: number; unit: string; calories: number };
    }
  >;
}

export const mockFoodScenarios: MockFoodScenario[] = [
  {
    keywords: ['피자'],
    ingredients: ['피자 도우', '토마토 소스', '모짜렐라 치즈', '페퍼로니'],
    totalCalories: 854,
    breakdown: {
      '피자 도우': {
        protein: { amount: 12, unit: 'g', calories: 48 },
        fat: { amount: 4, unit: 'g', calories: 36 },
        carbohydrate: { amount: 80, unit: 'g', calories: 320 },
      },
      '토마토 소스': {
        protein: { amount: 2, unit: 'g', calories: 8 },
        fat: { amount: 0.2, unit: 'g', calories: 1.8 },
        carbohydrate: { amount: 8, unit: 'g', calories: 32 },
      },
      '모짜렐라 치즈': {
        protein: { amount: 25, unit: 'g', calories: 100 },
        fat: { amount: 22, unit: 'g', calories: 198 },
        carbohydrate: { amount: 2, unit: 'g', calories: 8 },
      },
      페퍼로니: {
        protein: { amount: 20, unit: 'g', calories: 80 },
        fat: { amount: 40, unit: 'g', calories: 360 },
        carbohydrate: { amount: 1, unit: 'g', calories: 4 },
      },
    },
  },
  {
    keywords: ['샐러드'],
    ingredients: ['양상추', '토마토', '오이', '올리브 오일'],
    totalCalories: 183,
    breakdown: {
      양상추: {
        protein: { amount: 2, unit: 'g', calories: 8 },
        fat: { amount: 0.2, unit: 'g', calories: 1.8 },
        carbohydrate: { amount: 4, unit: 'g', calories: 16 },
      },
      토마토: {
        protein: { amount: 1, unit: 'g', calories: 4 },
        fat: { amount: 0.2, unit: 'g', calories: 1.8 },
        carbohydrate: { amount: 4, unit: 'g', calories: 16 },
      },
      오이: {
        protein: { amount: 1, unit: 'g', calories: 4 },
        fat: { amount: 0.1, unit: 'g', calories: 0.9 },
        carbohydrate: { amount: 4, unit: 'g', calories: 16 },
      },
      '올리브 오일': {
        protein: { amount: 0, unit: 'g', calories: 0 },
        fat: { amount: 15, unit: 'g', calories: 135 },
        carbohydrate: { amount: 0, unit: 'g', calories: 0 },
      },
    },
  },
  {
    keywords: ['에러', 'error'],
    ingredients: [],
    totalCalories: 0,
    breakdown: {},
  },
];

export const defaultMockScenario: MockFoodScenario = {
  keywords: ['기본'],
  ingredients: ['닭가슴살', '브로콜리', '현미밥'],
  totalCalories: 448,
  breakdown: {
    닭가슴살: {
      protein: { amount: 25, unit: 'g', calories: 100 },
      fat: { amount: 2, unit: 'g', calories: 18 },
      carbohydrate: { amount: 0, unit: 'g', calories: 0 },
    },
    브로콜리: {
      protein: { amount: 3, unit: 'g', calories: 12 },
      fat: { amount: 0.5, unit: 'g', calories: 4.5 },
      carbohydrate: { amount: 7, unit: 'g', calories: 28 },
    },
    현미밥: {
      protein: { amount: 5, unit: 'g', calories: 20 },
      fat: { amount: 2, unit: 'g', calories: 18 },
      carbohydrate: { amount: 70, unit: 'g', calories: 280 },
    },
  },
};
