import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FoodService } from './food.service';
import {
  OpenAIApiPort,
  OpenAIApiPortSymbol,
} from '../port/out/openai-api.port';
import {
  FileStorageService,
  FILE_STORAGE_SERVICE_TOKEN,
} from '@common/storage/file-storage.interface';
import { FoodAnalysis } from '@food/domain/food-analysis';
import { FoodAnalyzedEvent } from '@food/domain/events/food-analyzed.event';
import { MockServices } from '../../../../test/utils/mocks/service.mock';
import { FoodFactory } from '../../../../test/utils/factories/food.factory';

// Mock sharp module for image compression
jest.mock('sharp', () => {
  return jest.fn().mockImplementation(() => ({
    resize: jest.fn().mockReturnThis(),
    jpeg: jest.fn().mockReturnThis(),
    toBuffer: jest.fn().mockResolvedValue(Buffer.from('compressed image')),
  }));
});

describe('FoodService', () => {
  let service: FoodService;
  let openAIApiPort: jest.Mocked<OpenAIApiPort>;
  let fileStorageService: jest.Mocked<FileStorageService>;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  const MOCK_USER_ID = 'user123';
  const MOCK_IMAGE_URL = 'https://example.com/image.jpg';
  const MOCK_DESCRIPTION = 'Healthy meal with chicken and rice';
  const COMPRESSION_ERROR_MESSAGE = 'Compression failed';

  beforeEach(async () => {
    // Create mocks using test utilities
    openAIApiPort = MockServices.openAiApi() as jest.Mocked<OpenAIApiPort>;
    fileStorageService = MockServices.fileStorage() as jest.Mocked<FileStorageService>;
    eventEmitter = { emit: jest.fn() } as unknown as jest.Mocked<EventEmitter2>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FoodService,
        { provide: OpenAIApiPortSymbol, useValue: openAIApiPort },
        { provide: FILE_STORAGE_SERVICE_TOKEN, useValue: fileStorageService },
        { provide: EventEmitter2, useValue: eventEmitter },
      ],
    }).compile();

    service = module.get<FoodService>(FoodService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    FoodFactory.reset();
  });

  describe('analyzeFoodImage', () => {
    const createMockFile = (buffer = 'test image'): Express.Multer.File => ({
      buffer: Buffer.from(buffer),
      originalname: 'test.jpg',
      mimetype: 'image/jpeg',
      size: 1024,
      fieldname: 'image',
    } as Express.Multer.File);

    const setupSuccessfulAnalysis = () => {
      const mockFoodAnalysis = FoodFactory.createHealthyMealAnalysis();
      fileStorageService.uploadFile.mockResolvedValue(MOCK_IMAGE_URL);
      openAIApiPort.analyzeFood.mockResolvedValue(mockFoodAnalysis);
      return mockFoodAnalysis;
    };

    it('should analyze food image, upload to storage, and emit event', async () => {
      // Arrange
      const mockFile = createMockFile();
      const expectedAnalysis = setupSuccessfulAnalysis();

      // Act
      const result = await service.analyzeFoodImage(
        mockFile,
        MOCK_DESCRIPTION,
        MOCK_USER_ID,
      );

      // Assert
      expect(fileStorageService.uploadFile).toHaveBeenCalledWith(
        expect.objectContaining({
          buffer: expect.any(Buffer),
          size: expect.any(Number),
        }),
      );
      expect(openAIApiPort.analyzeFood).toHaveBeenCalledWith(
        expect.objectContaining({
          buffer: expect.any(Buffer),
          size: expect.any(Number),
        }),
        MOCK_DESCRIPTION,
      );
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'food.analyzed',
        expect.any(FoodAnalyzedEvent),
      );
      expect(result).toEqual(expectedAnalysis);
    });

    it('should emit event with correct data', async () => {
      // Arrange
      const mockFile = createMockFile();
      const expectedAnalysis = setupSuccessfulAnalysis();

      // Act
      await service.analyzeFoodImage(mockFile, MOCK_DESCRIPTION, MOCK_USER_ID);

      // Assert
      const emittedEvent = eventEmitter.emit.mock.calls[0][1] as FoodAnalyzedEvent;
      expect(emittedEvent).toBeInstanceOf(FoodAnalyzedEvent);
      expect(emittedEvent.payload).toMatchObject({
        userId: MOCK_USER_ID,
        imageUrl: MOCK_IMAGE_URL,
        description: MOCK_DESCRIPTION,
        analysis: {
          ingredients: expectedAnalysis.ingredients,
          totalCalories: expectedAnalysis.totalCalories,
          breakdown: expectedAnalysis.breakdown,
        },
      });
    });

    it('should handle image compression failure', async () => {
      // Arrange
      const mockFile = createMockFile();
      const sharp = jest.requireMock('sharp');
      sharp.mockImplementationOnce(() => {
        throw new Error(COMPRESSION_ERROR_MESSAGE);
      });

      // Act & Assert
      await expect(
        service.analyzeFoodImage(mockFile, MOCK_DESCRIPTION, MOCK_USER_ID),
      ).rejects.toThrow(COMPRESSION_ERROR_MESSAGE);
      
      expect(fileStorageService.uploadFile).not.toHaveBeenCalled();
      expect(openAIApiPort.analyzeFood).not.toHaveBeenCalled();
      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });

    it('should propagate errors from OpenAI API', async () => {
      // Arrange
      const mockFile = createMockFile();
      const apiError = new Error('OpenAI API error');
      fileStorageService.uploadFile.mockResolvedValue(MOCK_IMAGE_URL);
      openAIApiPort.analyzeFood.mockRejectedValue(apiError);

      // Act & Assert
      await expect(
        service.analyzeFoodImage(mockFile, MOCK_DESCRIPTION, MOCK_USER_ID),
      ).rejects.toThrow(apiError);
      
      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });

    it('should propagate errors from file storage', async () => {
      // Arrange
      const mockFile = createMockFile();
      const storageError = new Error('Storage upload failed');
      fileStorageService.uploadFile.mockRejectedValue(storageError);

      // Act & Assert
      await expect(
        service.analyzeFoodImage(mockFile, MOCK_DESCRIPTION, MOCK_USER_ID),
      ).rejects.toThrow(storageError);
      
      expect(openAIApiPort.analyzeFood).not.toHaveBeenCalled();
      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });
  });
});