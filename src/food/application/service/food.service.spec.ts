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

// sharp 모듈을 모킹합니다.
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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FoodService,
        {
          provide: OpenAIApiPortSymbol,
          useValue: {
            analyzeFood: jest.fn(),
          },
        },
        {
          provide: FILE_STORAGE_SERVICE_TOKEN,
          useValue: {
            uploadFile: jest.fn(),
          },
        },
        {
          provide: EventEmitter2,
          useValue: {
            emit: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<FoodService>(FoodService);
    openAIApiPort = module.get(OpenAIApiPortSymbol);
    fileStorageService = module.get(FILE_STORAGE_SERVICE_TOKEN);
    eventEmitter = module.get(EventEmitter2);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('analyzeFoodImage', () => {
    it('should analyze food image, upload to S3, and emit event', async () => {
      // Arrange
      const mockFile: Express.Multer.File = {
        buffer: Buffer.from('test image'),
        originalname: 'test.jpg',
        mimetype: 'image/jpeg',
        size: 1024,
        fieldname: 'image',
      } as Express.Multer.File;

      const mockDescription = 'Test food description';
      const mockUserId = 'user123';
      const mockImageUrl = 'https://example.com/image.jpg';
      const mockFoodAnalysis: FoodAnalysis = {
        ingredients: ['chicken', 'rice'],
        totalCalories: 500,
        breakdown: {
          chicken: {
            protein: { amount: 25, unit: 'g', calories: 100 },
            fat: { amount: 3, unit: 'g', calories: 27 },
            carbohydrate: { amount: 0, unit: 'g', calories: 0 },
          },
          rice: {
            protein: { amount: 4, unit: 'g', calories: 16 },
            fat: { amount: 0.5, unit: 'g', calories: 4.5 },
            carbohydrate: { amount: 45, unit: 'g', calories: 180 },
          },
        },
      };

      fileStorageService.uploadFile.mockResolvedValue(mockImageUrl);
      openAIApiPort.analyzeFood.mockResolvedValue(mockFoodAnalysis);

      // Act
      const result = await service.analyzeFoodImage(
        mockFile,
        mockDescription,
        mockUserId,
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
        mockDescription,
      );
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'food.analyzed',
        expect.any(FoodAnalyzedEvent),
      );
      expect(result).toEqual(mockFoodAnalysis);
    });

    it('should throw an error if image compression fails', async () => {
      // Arrange
      const mockFile: Express.Multer.File = {
        buffer: Buffer.from('test image'),
        originalname: 'test.jpg',
        mimetype: 'image/jpeg',
        size: 1024,
        fieldname: 'image',
      } as Express.Multer.File;

      const sharp = jest.requireMock('sharp');
      sharp.mockImplementationOnce(() => {
        throw new Error('Compression failed');
      });

      await expect(
        service.analyzeFoodImage(mockFile, 'description', 'user123'),
      ).rejects.toThrow('Compression failed');
    });
  });
});
