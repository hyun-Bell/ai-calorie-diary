import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { OpenAIApiPort } from '@food/application/port/out/openai-api.port';
import { FoodAnalysis } from '@food/domain/food-analysis';
import {
  mockFoodScenarios,
  defaultMockScenario,
} from './mock-data/food-analysis-scenarios';

@Injectable()
export class OpenAIApiMockAdapter implements OpenAIApiPort {
  private readonly logger = new Logger(OpenAIApiMockAdapter.name);

  async analyzeFood(
    image: Express.Multer.File,
    description: string,
  ): Promise<FoodAnalysis> {
    this.logger.debug(`Mock analysis for: ${description}`);

    // 에러 시나리오 테스트
    if (description.includes('에러') || description.includes('error')) {
      this.logger.debug('Triggering mock error scenario');
      throw new HttpException(
        'Mock API error for testing purposes',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    // 시나리오 매칭
    const scenario =
      mockFoodScenarios.find((scenario) =>
        scenario.keywords.some((keyword) =>
          description.toLowerCase().includes(keyword.toLowerCase()),
        ),
      ) || defaultMockScenario;

    // 빈 이미지 검증 (실제 상황 시뮬레이션)
    if (!image || !image.buffer || image.buffer.length === 0) {
      throw new HttpException(
        'Invalid image data provided',
        HttpStatus.BAD_REQUEST,
      );
    }

    // 실제 API 응답 시간 시뮬레이션 (선택적)
    await this.simulateApiDelay();

    return new FoodAnalysis(
      scenario.ingredients,
      scenario.totalCalories,
      scenario.breakdown,
    );
  }

  private async simulateApiDelay(): Promise<void> {
    const delay = Math.random() * 500 + 100; // 100-600ms 랜덤 지연
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
}
