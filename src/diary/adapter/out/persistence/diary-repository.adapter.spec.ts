import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '@common/prisma/prisma.service';
import { Diary } from '@diary/domain/diary';
import { DiaryRepositoryAdapter } from './diary-repository.adapter';
import { MockServices } from '../../../../../test/utils/mocks/service.mock';
import { DomainDiaryFactory } from '../../../../../test/utils/factories/domain-diary.factory';

describe('DiaryRepositoryAdapter', () => {
  let adapter: DiaryRepositoryAdapter;
  let prismaService: PrismaService;

  const MOCK_USER_ID = 'user-123';
  const MOCK_DIARY_ID = 'diary-123';

  beforeEach(async () => {
    // Create mock using test utilities
    prismaService = MockServices.prismaService() as unknown as PrismaService;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DiaryRepositoryAdapter,
        { provide: PrismaService, useValue: prismaService },
      ],
    }).compile();

    adapter = module.get<DiaryRepositoryAdapter>(DiaryRepositoryAdapter);
  });

  afterEach(() => {
    jest.clearAllMocks();
    DomainDiaryFactory.reset();
  });

  describe('createDiary', () => {
    const setupCreateDiaryMock = (returnValue: any) => {
      (prismaService.diary.create as jest.Mock).mockResolvedValue(returnValue);
    };

    it('should create a diary successfully', async () => {
      // Arrange
      const diaryData = DomainDiaryFactory.create({
        content: 'Test diary content',
        userId: MOCK_USER_ID,
        totalCalories: 500,
      });
      
      const expectedPrismaReturn = {
        id: MOCK_DIARY_ID,
        content: diaryData.content,
        imageUrl: diaryData.imageUrl,
        userId: diaryData.userId,
        totalCalories: diaryData.totalCalories,
        calorieBreakdown: diaryData.calorieBreakdown,
        createdAt: new Date(),
        updatedAt: new Date(),
        mealTime: 'LUNCH',
      };
      
      // Mock user exists check
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue({
        id: MOCK_USER_ID,
        email: 'test@example.com',
      });
      
      setupCreateDiaryMock(expectedPrismaReturn);

      // Act
      const result = await adapter.createDiary(diaryData);

      // Assert
      expect(prismaService.diary.create).toHaveBeenCalledWith({
        data: {
          content: diaryData.content,
          imageUrl: diaryData.imageUrl,
          userId: diaryData.userId,
          totalCalories: diaryData.totalCalories,
          calorieBreakdown: diaryData.calorieBreakdown,
        },
      });
      expect(result).toBeInstanceOf(Diary);
      expect(result.id).toBe(expectedPrismaReturn.id);
      expect(result.content).toBe(expectedPrismaReturn.content);
    });

    it('should create a diary without image', async () => {
      // Arrange
      const diaryData = DomainDiaryFactory.createWithoutImage({
        content: 'Diary without image',
        userId: MOCK_USER_ID,
      });
      
      const expectedPrismaReturn = {
        id: MOCK_DIARY_ID,
        content: diaryData.content,
        imageUrl: null,
        userId: diaryData.userId,
        totalCalories: diaryData.totalCalories,
        calorieBreakdown: diaryData.calorieBreakdown,
        createdAt: new Date(),
        updatedAt: new Date(),
        mealTime: 'LUNCH',
      };
      
      // Mock user exists check
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue({
        id: MOCK_USER_ID,
        email: 'test@example.com',
      });
      
      setupCreateDiaryMock(expectedPrismaReturn);

      // Act
      const result = await adapter.createDiary(diaryData);

      // Assert
      expect(prismaService.diary.create).toHaveBeenCalledWith({
        data: {
          content: diaryData.content,
          imageUrl: null,
          userId: diaryData.userId,
          totalCalories: diaryData.totalCalories,
          calorieBreakdown: diaryData.calorieBreakdown,
        },
      });
      expect(result.imageUrl).toBeNull();
    });

    it('should handle database errors', async () => {
      // Arrange
      const diaryData = DomainDiaryFactory.create();
      const dbError = new Error('Database connection error');
      
      // Mock user exists check
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue({
        id: diaryData.userId,
        email: 'test@example.com',
      });
      
      (prismaService.diary.create as jest.Mock).mockRejectedValue(dbError);

      // Act & Assert
      await expect(adapter.createDiary(diaryData)).rejects.toThrow(dbError);
    });
  });

  describe('findDiaryById', () => {
    const setupFindByIdMock = (returnValue: any) => {
      (prismaService.diary.findUnique as jest.Mock).mockResolvedValue(returnValue);
    };

    it('should find a diary by id', async () => {
      // Arrange
      const expectedDiary = {
        id: MOCK_DIARY_ID,
        content: 'Found diary',
        imageUrl: 'http://image.jpg',
        userId: MOCK_USER_ID,
        totalCalories: 600,
        calorieBreakdown: DomainDiaryFactory.createHealthyMealBreakdown(),
        createdAt: new Date(),
        updatedAt: new Date(),
        mealTime: 'DINNER',
      };
      
      setupFindByIdMock(expectedDiary);

      // Act
      const result = await adapter.findDiaryById(MOCK_DIARY_ID);

      // Assert
      expect(prismaService.diary.findUnique).toHaveBeenCalledWith({
        where: { id: MOCK_DIARY_ID },
      });
      expect(result).toBeInstanceOf(Diary);
      expect(result?.id).toBe(expectedDiary.id);
    });

    it('should return null when diary not found', async () => {
      // Arrange
      setupFindByIdMock(null);

      // Act
      const result = await adapter.findDiaryById('non-existent-id');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('findDiariesByUserId', () => {
    const setupFindManyMock = (returnValue: any[]) => {
      (prismaService.diary.findMany as jest.Mock).mockResolvedValue(returnValue);
    };

    it('should find all diaries for a user', async () => {
      // Arrange
      const expectedDiaries = [
        {
          id: 'diary-1',
          content: 'First diary',
          imageUrl: 'http://image1.jpg',
          userId: MOCK_USER_ID,
          totalCalories: 400,
          calorieBreakdown: {},
          createdAt: new Date(),
          updatedAt: new Date(),
          mealTime: 'BREAKFAST',
        },
        {
          id: 'diary-2',
          content: 'Second diary',
          imageUrl: 'http://image2.jpg',
          userId: MOCK_USER_ID,
          totalCalories: 500,
          calorieBreakdown: {},
          createdAt: new Date(),
          updatedAt: new Date(),
          mealTime: 'LUNCH',
        },
      ];
      
      setupFindManyMock(expectedDiaries);

      // Act
      const result = await adapter.findDiariesByUserId(MOCK_USER_ID);

      // Assert
      expect(prismaService.diary.findMany).toHaveBeenCalledWith({
        where: { userId: MOCK_USER_ID },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(Diary);
      expect(result[1]).toBeInstanceOf(Diary);
    });

    it('should return empty array when no diaries found', async () => {
      // Arrange
      setupFindManyMock([]);

      // Act
      const result = await adapter.findDiariesByUserId(MOCK_USER_ID);

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('findDiariesByPeriod', () => {
    it('should find diaries within date range', async () => {
      // Arrange
      const startDate = new Date('2023-01-01');
      const endDate = new Date('2023-12-31');
      const expectedDiaries = [
        {
          id: 'diary-1',
          content: 'January diary',
          imageUrl: null,
          userId: MOCK_USER_ID,
          totalCalories: 450,
          calorieBreakdown: {},
          createdAt: new Date('2023-01-15'),
          updatedAt: new Date('2023-01-15'),
          mealTime: 'LUNCH',
        },
      ];
      
      (prismaService.diary.findMany as jest.Mock).mockResolvedValue(expectedDiaries);

      // Act
      const result = await adapter.findDiariesByPeriod(MOCK_USER_ID, startDate, endDate);

      // Assert
      expect(prismaService.diary.findMany).toHaveBeenCalledWith({
        where: {
          userId: MOCK_USER_ID,
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toHaveLength(1);
      expect(result[0].content).toBe('January diary');
    });
  });

  describe('updateDiary', () => {
    it('should update a diary', async () => {
      // Arrange
      const updateData = {
        content: 'Updated content',
        totalCalories: 700,
      };
      const expectedUpdatedDiary = {
        id: MOCK_DIARY_ID,
        content: updateData.content,
        imageUrl: 'http://image.jpg',
        userId: MOCK_USER_ID,
        totalCalories: updateData.totalCalories,
        calorieBreakdown: {},
        createdAt: new Date(),
        updatedAt: new Date(),
        mealTime: 'DINNER',
      };
      
      (prismaService.diary.update as jest.Mock).mockResolvedValue(expectedUpdatedDiary);

      // Act
      const result = await adapter.updateDiary(MOCK_DIARY_ID, updateData);

      // Assert
      expect(prismaService.diary.update).toHaveBeenCalledWith({
        where: { id: MOCK_DIARY_ID },
        data: {
          ...updateData,
          imageUrl: undefined,
          calorieBreakdown: undefined,
          updatedAt: expect.any(Date),
        },
      });
      expect(result).toBeInstanceOf(Diary);
      expect(result.content).toBe(updateData.content);
      expect(result.totalCalories).toBe(updateData.totalCalories);
    });
  });

  describe('deleteDiary', () => {
    it('should delete a diary', async () => {
      // Arrange
      (prismaService.diary.delete as jest.Mock).mockResolvedValue({});

      // Act
      await adapter.deleteDiary(MOCK_DIARY_ID);

      // Assert
      expect(prismaService.diary.delete).toHaveBeenCalledWith({
        where: { id: MOCK_DIARY_ID },
      });
    });
  });
});