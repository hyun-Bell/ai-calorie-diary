/**
 * Creates a mock object for any service with jest.fn() for all methods
 * Useful for creating consistent mock services in unit tests
 */
export function createMockService<T>(methods: string[]): jest.Mocked<T> {
  const mock: any = {};
  
  methods.forEach((method) => {
    mock[method] = jest.fn();
  });
  
  return mock as jest.Mocked<T>;
}

/**
 * Common mock service factories
 */
export const MockServices = {
  diaryRepository: () =>
    createMockService<any>([
      'createDiary',
      'findDiaryById',
      'findDiariesByUserId',
      'findDiariesByPeriod',
      'updateDiary',
      'deleteDiary',
    ]),

  userRepository: () =>
    createMockService([
      'createUser',
      'findByEmail',
      'findById',
      'updateTargetCalories',
    ]),

  fileStorage: () =>
    createMockService<any>(['uploadFile', 'deleteFile', 'getFileUrl']),

  openAiApi: () =>
    createMockService<any>(['analyzeFood', 'analyzeFoodImage']),

  jwtService: () =>
    createMockService(['sign', 'verify', 'signAsync', 'verifyAsync']),

  prismaService: () => {
    const mock = {
      $transaction: jest.fn(),
      $disconnect: jest.fn(),
      $connect: jest.fn(),
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    diary: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
      count: jest.fn(),
    },
    refreshToken: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
    };
    
    // Setup $transaction to pass the mock itself to the callback
    mock.$transaction.mockImplementation(async (cb) => cb(mock));
    
    return mock;
  },
};