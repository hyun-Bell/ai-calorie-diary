import { ApiProperty } from '@nestjs/swagger';

export class ApiResponseDto<T = any> {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty()
  data?: T;

  @ApiProperty({ example: 'Operation completed successfully' })
  message?: string;

  @ApiProperty({ example: '2023-05-20T12:34:56.789Z' })
  timestamp: string;

  @ApiProperty({ example: '/api/endpoint' })
  path?: string;

  constructor(data?: T, message?: string, path?: string) {
    this.success = true;
    this.data = data;
    this.message = message;
    this.timestamp = new Date().toISOString();
    this.path = path;
  }
}

export class PaginatedResponseDto<T = any> extends ApiResponseDto<T[]> {
  @ApiProperty({
    example: {
      page: 1,
      limit: 10,
      total: 100,
      totalPages: 10,
    },
  })
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };

  constructor(
    data: T[],
    page: number,
    limit: number,
    total: number,
    message?: string,
    path?: string,
  ) {
    super(data, message, path);
    this.meta = {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }
}
