import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FoodController } from './adapter/in/rest/food.controller';
import { FoodService } from './application/service/food.service';
import { OpenAIApiAdapter } from './adapter/out/api/openai-api.adapter';
import { OpenAIApiMockAdapter } from './adapter/out/api/openai-api-mock.adapter';
import { StorageModule } from '@common/storage/storage.module';
import { FOOD_USE_CASE } from './application/port/in/food.use-case';
import { OpenAIApiPortSymbol, OpenAIApiPort } from '@food/application/port/out/openai-api.port';

@Module({
  imports: [StorageModule],
  controllers: [FoodController],
  providers: [
    {
      provide: FOOD_USE_CASE,
      useClass: FoodService,
    },
    {
      provide: OpenAIApiPortSymbol,
      useFactory: (configService: ConfigService): OpenAIApiPort => {
        const useMock = configService.get<boolean>('openai.useMock', false);
        return useMock
          ? new OpenAIApiMockAdapter()
          : new OpenAIApiAdapter(configService);
      },
      inject: [ConfigService],
    },
  ],
})
export class FoodModule {}
