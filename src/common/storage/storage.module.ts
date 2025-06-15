import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Service } from '../s3/s3.service';
import { LocalFileStorageService } from './local-file-storage.service';
import { FILE_STORAGE_SERVICE_TOKEN } from './file-storage.interface';

@Module({
  providers: [
    {
      provide: FILE_STORAGE_SERVICE_TOKEN,
      useFactory: (configService: ConfigService) => {
        const isTestEnvironment = configService.get('NODE_ENV') === 'test';
        return isTestEnvironment
          ? new LocalFileStorageService()
          : new S3Service(configService);
      },
      inject: [ConfigService],
    },
    S3Service,
    LocalFileStorageService,
  ],
  exports: [FILE_STORAGE_SERVICE_TOKEN, S3Service, LocalFileStorageService],
})
export class StorageModule {}
