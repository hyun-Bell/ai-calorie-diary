import { ApiProperty } from '@nestjs/swagger';

export class DiaryResponseDto {
  @ApiProperty({ example: 'uuid-string' })
  id: string;

  @ApiProperty({ example: '오늘 점심에 맛있는 파스타를 먹었다.' })
  content: string;

  @ApiProperty({ example: 'https://example.com/image.jpg' })
  imageUrl: string;

  @ApiProperty({ example: 'uuid-string' })
  userId: string;

  @ApiProperty({ example: 850, required: false })
  totalCalories?: number;

  @ApiProperty({ example: {}, required: false })
  calorieBreakdown?: any;

  @ApiProperty({ example: '2023-05-20T12:34:56.789Z' })
  createdAt: string;

  @ApiProperty({ example: '2023-05-20T12:34:56.789Z' })
  updatedAt: string;
}

export class DiaryListResponseDto {
  @ApiProperty({ type: [DiaryResponseDto] })
  diaries: DiaryResponseDto[];

  @ApiProperty({ example: 10 })
  total: number;
}

export class DiaryCreatedResponseDto {
  @ApiProperty({ example: 'uuid-string' })
  id: string;

  @ApiProperty({ example: 'Diary created successfully' })
  message: string;
}

export class DiaryUpdatedResponseDto {
  @ApiProperty({ example: 'uuid-string' })
  id: string;

  @ApiProperty({ example: 'Diary updated successfully' })
  message: string;
}

export class DiaryDeletedResponseDto {
  @ApiProperty({ example: 'Diary successfully deleted' })
  message: string;
}
