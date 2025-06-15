import { Module } from '@nestjs/common';
import { FoodController } from './adapter/in/rest/food.controller';
import { FoodService } from './application/service/food.service';
import { OpenAIApiAdapter } from './adapter/out/api/openai-api.adapter';
import { StorageModule } from '@common/storage/storage.module';
import { FOOD_USE_CASE } from './application/port/in/food.use-case';
import { OpenAIApiPortSymbol } from '@food/application/port/out/openai-api.port';

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
      useClass: OpenAIApiAdapter,
    },
  ],
})
export class FoodModule {}
