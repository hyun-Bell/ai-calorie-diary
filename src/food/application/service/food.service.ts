import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FoodUseCase } from '@food/application/port/in/food.use-case';
import {
  OpenAIApiPortSymbol,
  OpenAIApiPort,
} from '../port/out/openai-api.port';
import { FoodAnalysis } from '@food/domain/food-analysis';
import {
  FileStorageService,
  FILE_STORAGE_SERVICE_TOKEN,
} from '@common/storage/file-storage.interface';
import { FoodAnalyzedEvent } from '@food/domain/events/food-analyzed.event';
import * as sharp from 'sharp';

@Injectable()
export class FoodService implements FoodUseCase {
  constructor(
    @Inject(OpenAIApiPortSymbol)
    private readonly openAIApiPort: OpenAIApiPort,
    @Inject(FILE_STORAGE_SERVICE_TOKEN)
    private readonly fileStorageService: FileStorageService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async analyzeFoodImage(
    image: Express.Multer.File,
    description: string,
    userId: string,
  ): Promise<FoodAnalysis> {
    // 이미지 압축
    const compressedImage = await this.compressImage(image);

    // 압축된 이미지 업로드
    const imageUrl = await this.fileStorageService.uploadFile(compressedImage);

    // OpenAI API를 사용하여 음식 분석
    const foodAnalysis = await this.openAIApiPort.analyzeFood(
      compressedImage,
      description,
    );

    // 이벤트 발행
    this.eventEmitter.emit(
      'food.analyzed',
      new FoodAnalyzedEvent({
        userId,
        imageUrl,
        description,
        analysis: foodAnalysis,
      }),
    );

    return foodAnalysis;
  }

  private async compressImage(
    file: Express.Multer.File,
  ): Promise<Express.Multer.File> {
    const compressedImageBuffer = await sharp(file.buffer)
      .resize(800) // 최대 너비 800px로 조정
      .jpeg({ quality: 80 }) // JPEG 형식으로 변환, 품질 80%
      .toBuffer();

    return {
      ...file,
      buffer: compressedImageBuffer,
      size: compressedImageBuffer.length,
    };
  }
}
