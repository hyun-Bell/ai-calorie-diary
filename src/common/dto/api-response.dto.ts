import { ApiProperty } from '@nestjs/swagger';

export class ApiResponseDto<T = any> {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty()
  data: T;

  @ApiProperty({
    example: {
      timestamp: '2023-05-20T12:34:56.789Z',
      path: '/api/endpoint',
    },
    required: false,
  })
  meta?: {
    timestamp: string;
    path?: string;
    [key: string]: any;
  };

  constructor(data: T, path?: string, additionalMeta?: Record<string, any>) {
    this.success = true;
    this.data = data;
    this.meta = {
      timestamp: new Date().toISOString(),
      ...(path && { path }),
      ...additionalMeta,
    };
  }
}

export class PaginatedResponseDto<T = any> extends ApiResponseDto<T[]> {
  @ApiProperty({
    example: {
      timestamp: '2023-05-20T12:34:56.789Z',
      path: '/api/endpoint',
      page: 1,
      limit: 10,
      total: 100,
      totalPages: 10,
    },
  })
  meta: {
    timestamp: string;
    path?: string;
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    [key: string]: any;
  };

  constructor(
    data: T[],
    page: number,
    limit: number,
    total: number,
    path?: string,
  ) {
    super(data, path, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  }
}
