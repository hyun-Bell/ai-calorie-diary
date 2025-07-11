import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { DiaryService } from './diary.service';
import {
  DIARY_REPOSITORY_PORT,
  DiaryRepositoryPort,
} from '../port/out/diary-repository.port';
import {
  FileStorageService,
  FILE_STORAGE_SERVICE_TOKEN,
} from '@common/storage/file-storage.interface';
import { Diary } from '../../domain/diary';
import { DomainDiaryFactory } from '../../../../test/utils/factories/domain-diary.factory';
import { MockServices } from '../../../../test/utils/mocks/service.mock';

describe('DiaryService', () => {
  let service: DiaryService;
  let diaryRepository: jest.Mocked<DiaryRepositoryPort>;
  let fileStorageService: jest.Mocked<FileStorageService>;

  beforeEach(async () => {
    // Create mocks using our utilities
    diaryRepository = MockServices.diaryRepository();
    fileStorageService = MockServices.fileStorage();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DiaryService,
        {
          provide: DIARY_REPOSITORY_PORT,
          useValue: diaryRepository,
        },
        {
          provide: FILE_STORAGE_SERVICE_TOKEN,
          useValue: fileStorageService,
        },
      ],
    }).compile();

    service = module.get<DiaryService>(DiaryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    DomainDiaryFactory.reset();
  });

  describe('createDiary', () => {
    const mockUserId = 'user-123';
    const mockImageUrl = 'http://test-image.jpg';
    const mockImageFile = {
      buffer: Buffer.from('test'),
    } as Express.Multer.File;

    it('should create diary with image and nutrition info', async () => {
      // Arrange
      const mockDiary = DomainDiaryFactory.create({ userId: mockUserId });
      fileStorageService.uploadFile.mockResolvedValue(mockImageUrl);
      diaryRepository.createDiary.mockResolvedValue(mockDiary);

      // Act
      const result = await service.createDiary(
        mockDiary.content,
        mockImageFile,
        mockUserId,
        mockDiary.totalCalories,
        mockDiary.calorieBreakdown,
      );

      // Assert
      expect(fileStorageService.uploadFile).toHaveBeenCalledWith(mockImageFile);
      expect(diaryRepository.createDiary).toHaveBeenCalledWith(
        expect.objectContaining({
          content: mockDiary.content,
          imageUrl: mockImageUrl,
          userId: mockUserId,
          totalCalories: mockDiary.totalCalories,
          calorieBreakdown: mockDiary.calorieBreakdown,
        }),
      );
      expect(result).toEqual(mockDiary);
    });

    it('should create diary without image', async () => {
      // Arrange
      const mockDiary = DomainDiaryFactory.createWithoutImage({
        userId: mockUserId,
      });
      diaryRepository.createDiary.mockResolvedValue(mockDiary);

      // Act
      const result = await service.createDiary(
        mockDiary.content,
        undefined,
        mockUserId,
        mockDiary.totalCalories,
        mockDiary.calorieBreakdown,
      );

      // Assert
      expect(fileStorageService.uploadFile).not.toHaveBeenCalled();
      expect(diaryRepository.createDiary).toHaveBeenCalledWith(
        expect.objectContaining({
          imageUrl: null,
        }),
      );
      expect(result).toEqual(mockDiary);
    });
  });

  describe('getDiaryById', () => {
    const diaryId = 'diary-123';
    const userId = 'user-123';

    it('should return diary when found and user owns it', async () => {
      // Arrange
      const mockDiary = DomainDiaryFactory.create({ userId });
      diaryRepository.findDiaryById.mockResolvedValue(mockDiary);

      // Act
      const result = await service.getDiaryById(diaryId, userId);

      // Assert
      expect(diaryRepository.findDiaryById).toHaveBeenCalledWith(diaryId);
      expect(result).toEqual(mockDiary);
    });

    it('should throw NotFoundException when diary not found', async () => {
      // Arrange
      diaryRepository.findDiaryById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.getDiaryById(diaryId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw UnauthorizedException when user does not own diary', async () => {
      // Arrange
      const mockDiary = DomainDiaryFactory.create({ userId: 'other-user' });
      diaryRepository.findDiaryById.mockResolvedValue(mockDiary);

      // Act & Assert
      await expect(service.getDiaryById(diaryId, userId)).rejects.toThrow(
        'You are not authorized to access this diary',
      );
    });
  });

  describe('getDiariesByUserId', () => {
    const userId = 'user-123';

    it('should return user diaries', async () => {
      // Arrange
      const mockDiaries = DomainDiaryFactory.createMany(3, userId);
      diaryRepository.findDiariesByUserId.mockResolvedValue(mockDiaries);

      // Act
      const result = await service.getDiariesByUserId(userId);

      // Assert
      expect(diaryRepository.findDiariesByUserId).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockDiaries);
    });

    it('should throw NotFoundException when no diaries found', async () => {
      // Arrange
      diaryRepository.findDiariesByUserId.mockResolvedValue(null);

      // Act & Assert
      await expect(service.getDiariesByUserId(userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getDiariesByPeriod', () => {
    const userId = 'user-123';
    const startDate = new Date('2023-01-01');
    const endDate = new Date('2023-12-31');

    it('should return diaries within period', async () => {
      // Arrange
      const mockDiaries = DomainDiaryFactory.createMany(2, userId);
      diaryRepository.findDiariesByPeriod.mockResolvedValue(mockDiaries);

      // Act
      const result = await service.getDiariesByPeriod(
        userId,
        startDate,
        endDate,
      );

      // Assert
      expect(diaryRepository.findDiariesByPeriod).toHaveBeenCalledWith(
        userId,
        startDate,
        endDate,
      );
      expect(result).toEqual(mockDiaries);
    });

    it('should return empty array when no diaries in period', async () => {
      // Arrange
      diaryRepository.findDiariesByPeriod.mockResolvedValue([]);

      // Act
      const result = await service.getDiariesByPeriod(
        userId,
        startDate,
        endDate,
      );

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('updateDiary', () => {
    const diaryId = 'diary-123';
    const userId = 'user-123';
    const updateContent = 'Updated content';
    const newImageFile = { buffer: Buffer.from('new') } as Express.Multer.File;
    const newImageUrl = 'http://new-image.jpg';

    it('should update diary with new image', async () => {
      // Arrange
      const existingDiary = DomainDiaryFactory.create({
        id: diaryId,
        userId,
        imageUrl: 'http://old-image.jpg',
      });
      const updatedDiary = new Diary(
        existingDiary.id,
        updateContent,
        newImageUrl,
        existingDiary.userId,
        existingDiary.createdAt,
        new Date(),
        existingDiary.totalCalories,
        existingDiary.calorieBreakdown,
      );

      diaryRepository.findDiaryById.mockResolvedValue(existingDiary);
      fileStorageService.uploadFile.mockResolvedValue(newImageUrl);
      diaryRepository.updateDiary.mockResolvedValue(updatedDiary);

      // Act
      const result = await service.updateDiary(
        diaryId,
        updateContent,
        newImageFile,
        userId,
        updatedDiary.totalCalories,
        updatedDiary.calorieBreakdown,
      );

      // Assert
      expect(fileStorageService.uploadFile).toHaveBeenCalledWith(newImageFile);
      expect(diaryRepository.updateDiary).toHaveBeenCalledWith(
        diaryId,
        expect.objectContaining({
          content: updateContent,
          imageUrl: newImageUrl,
        }),
      );
      expect(result).toEqual(updatedDiary);
    });

    it('should update diary without changing image', async () => {
      // Arrange
      const existingDiary = DomainDiaryFactory.create({ id: diaryId, userId });
      const updatedDiary = new Diary(
        existingDiary.id,
        updateContent,
        existingDiary.imageUrl,
        existingDiary.userId,
        existingDiary.createdAt,
        new Date(),
        existingDiary.totalCalories,
        existingDiary.calorieBreakdown,
      );

      diaryRepository.findDiaryById.mockResolvedValue(existingDiary);
      diaryRepository.updateDiary.mockResolvedValue(updatedDiary);

      // Act
      const result = await service.updateDiary(
        diaryId,
        updateContent,
        undefined,
        userId,
      );

      // Assert
      expect(fileStorageService.uploadFile).not.toHaveBeenCalled();
      expect(result).toEqual(updatedDiary);
    });

    it('should throw UnauthorizedException when user does not own diary', async () => {
      // Arrange
      const existingDiary = DomainDiaryFactory.create({
        id: diaryId,
        userId: 'other-user',
      });
      diaryRepository.findDiaryById.mockResolvedValue(existingDiary);

      // Act & Assert
      await expect(
        service.updateDiary(diaryId, updateContent, undefined, userId),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('deleteDiary', () => {
    const diaryId = 'diary-123';
    const userId = 'user-123';

    it('should delete diary with image', async () => {
      // Arrange
      const mockDiary = DomainDiaryFactory.create({
        id: diaryId,
        userId,
        imageUrl: 'http://image-to-delete.jpg',
      });
      diaryRepository.findDiaryById.mockResolvedValue(mockDiary);

      // Act
      await service.deleteDiary(diaryId, userId);

      // Assert
      expect(diaryRepository.deleteDiary).toHaveBeenCalledWith(diaryId);
      expect(fileStorageService.deleteFile).toHaveBeenCalledWith(
        mockDiary.imageUrl,
      );
    });

    it('should delete diary without image', async () => {
      // Arrange
      const mockDiary = DomainDiaryFactory.createWithoutImage({
        id: diaryId,
        userId,
      });
      diaryRepository.findDiaryById.mockResolvedValue(mockDiary);

      // Act
      await service.deleteDiary(diaryId, userId);

      // Assert
      expect(diaryRepository.deleteDiary).toHaveBeenCalledWith(diaryId);
      expect(fileStorageService.deleteFile).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when user does not own diary', async () => {
      // Arrange
      const mockDiary = DomainDiaryFactory.create({
        id: diaryId,
        userId: 'other-user',
      });
      diaryRepository.findDiaryById.mockResolvedValue(mockDiary);

      // Act & Assert
      await expect(service.deleteDiary(diaryId, userId)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw NotFoundException when diary not found', async () => {
      // Arrange
      diaryRepository.findDiaryById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.deleteDiary(diaryId, userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
