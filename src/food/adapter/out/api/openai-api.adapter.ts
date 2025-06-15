import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { OpenAIApiPort } from '@food/application/port/out/openai-api.port';
import { FoodAnalysis } from '@food/domain/food-analysis';

@Injectable()
export class OpenAIApiAdapter implements OpenAIApiPort {
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('openai.apiKey');
    const orgId = this.configService.get<string>('openai.orgId');
    const projectId = this.configService.get<string>('openai.projectId');

    if (!apiKey) {
      throw new Error('OpenAI API key is required when not using mock mode');
    }

    this.openai = new OpenAI({
      apiKey,
      organization: orgId,
      project: projectId,
    });
  }

  async analyzeFood(
    image: Express.Multer.File,
    description: string,
  ): Promise<FoodAnalysis> {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `당신은 음식 분석 AI입니다. 음식 이미지와 설명을 분석하고, 다음 구조의 JSON 응답을 한글로 제공하세요:
          {
            "ingredients": string[],
            "totalCalories": number,
            "breakdown": {
              [ingredient: string]: {
                protein: { amount: number, unit: "g", calories: number },
                fat: { amount: number, unit: "g", calories: number },
                carbohydrate: { amount: number, unit: "g", calories: number }
              }
            }
          }
          Always use grams (g) as the unit for amount.`,
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Analyze this food image and the given description: ${description}. Provide ingredients, total calories, and detailed nutritional breakdown.`,
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:${image.mimetype};base64,${image.buffer.toString(
                  'base64',
                )}`,
              },
            },
          ],
        },
      ],
      max_tokens: 1000,
      response_format: { type: 'json_object' },
    });
    console.log(response);

    const analysisResult = JSON.parse(response.choices[0].message.content);
    return new FoodAnalysis(
      analysisResult.ingredients,
      analysisResult.totalCalories,
      analysisResult.breakdown,
    );
  }
}
