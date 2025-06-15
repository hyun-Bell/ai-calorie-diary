import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import {
  FileStorageService,
  FILE_STORAGE_SERVICE_TOKEN,
} from '@common/storage/file-storage.interface';
import { Diary } from '@diary/domain/diary';
import { DiaryUseCase } from '@diary/application/port/in/diary.use-case';
import {
  DIARY_REPOSITORY_PORT,
  DiaryRepositoryPort,
} from '@diary/application/port/out/diary-repository.port';
import { FoodBreakdown } from '@common/dto/Ingredient.dto';

@Injectable()
export class DiaryService implements DiaryUseCase {
  constructor(
    @Inject(DIARY_REPOSITORY_PORT)
    private readonly diaryRepository: DiaryRepositoryPort,
    @Inject(FILE_STORAGE_SERVICE_TOKEN)
    private readonly fileStorageService: FileStorageService,
  ) {}

  async createDiary(
    content: string,
    imageFile: Express.Multer.File | undefined,
    userId: string,
    totalCalories: number | null,
    calorieBreakdown: FoodBreakdown | null,
  ): Promise<Diary> {
    let imageUrl: string | null = null;
    if (imageFile) {
      imageUrl = await this.fileStorageService.uploadFile(imageFile);
    }
    const diary = new Diary(
      '0',
      content,
      imageUrl,
      userId,
      new Date(),
      new Date(),
      totalCalories,
      calorieBreakdown,
    );
    return this.diaryRepository.createDiary(diary);
  }

  async getDiaryById(id: string, userId?: string): Promise<Diary | null> {
    const existingDiary = await this.diaryRepository.findDiaryById(id);
    if (!existingDiary) {
      throw new NotFoundException('Diary not found');
    }
    if (existingDiary.userId !== userId) {
      throw new ForbiddenException(
        'You are not authorized to access this diary',
      );
    }
    return existingDiary;
  }

  async getDiariesByUserId(userId: string): Promise<Diary[]> {
    const existingDiary = await this.diaryRepository.findDiariesByUserId(
      userId,
    );
    if (!existingDiary) {
      throw new NotFoundException('Diary not found');
    }
    return existingDiary;
  }

  async getDiariesByPeriod(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Diary[]> {
    return this.diaryRepository.findDiariesByPeriod(userId, startDate, endDate);
  }

  async updateDiary(
    id: string,
    content: string,
    imageFile: Express.Multer.File | undefined,
    userId: string,
    totalCalories?: number | null,
    calorieBreakdown?: FoodBreakdown | null,
  ): Promise<Diary> {
    const existingDiary = await this.diaryRepository.findDiaryById(id);
    if (!existingDiary) {
      throw new NotFoundException('Diary not found');
    }
    if (existingDiary.userId !== userId) {
      throw new UnauthorizedException(
        'You are not authorized to update this diary',
      );
    }

    let imageUrl = existingDiary.imageUrl;
    if (imageFile) {
      imageUrl = await this.fileStorageService.uploadFile(imageFile);
    }

    return this.diaryRepository.updateDiary(id, {
      content,
      imageUrl,
      totalCalories,
      calorieBreakdown,
    });
  }

  async deleteDiary(id: string, userId: string): Promise<void> {
    const existingDiary = await this.diaryRepository.findDiaryById(id);
    if (!existingDiary) {
      throw new NotFoundException('Diary not found');
    }
    if (existingDiary.userId !== userId) {
      throw new UnauthorizedException(
        'You are not authorized to delete this diary',
      );
    }

    if (existingDiary.imageUrl) {
      await this.fileStorageService.deleteFile(existingDiary.imageUrl);
    }
    await this.diaryRepository.deleteDiary(id);
  }
}
