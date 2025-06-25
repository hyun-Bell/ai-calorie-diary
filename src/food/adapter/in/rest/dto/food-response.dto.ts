import { ApiProperty } from '@nestjs/swagger';
import { FoodAnalysis } from '@food/domain/food-analysis';

export class FoodAnalysisResponseDto {
  @ApiProperty({ example: 850, description: '총 칼로리' })
  totalCalories: number;

  @ApiProperty({
    description: '음식 분석 세부 정보',
    type: 'object',
  })
  analysis: FoodAnalysis;

  @ApiProperty({ example: 'Food analysis completed successfully' })
  message: string;

  @ApiProperty({ example: '2023-05-20T12:34:56.789Z' })
  analyzedAt: string;
}
