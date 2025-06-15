import { Injectable, Logger } from '@nestjs/common';
import { promises as fs } from 'fs';
import { join } from 'path';
import { FileStorageService } from './file-storage.interface';

@Injectable()
export class LocalFileStorageService implements FileStorageService {
  private readonly logger = new Logger(LocalFileStorageService.name);
  private readonly uploadDir = join(process.cwd(), 'uploads');

  constructor() {
    this.ensureUploadDir();
  }

  async uploadFile(file: Express.Multer.File, key?: string): Promise<string> {
    const fileName = key || this.generateFileName(file.originalname);
    const filePath = join(this.uploadDir, fileName);

    try {
      await fs.writeFile(filePath, file.buffer);
      this.logger.log(`File uploaded locally: ${fileName}`);
      return `file://${filePath}`;
    } catch (error) {
      this.logger.error(`Failed to upload file locally: ${error.message}`);
      throw new Error(`File upload failed: ${error.message}`);
    }
  }

  async deleteFile(key: string): Promise<void> {
    try {
      // Extract filename from URL or use key directly
      const fileName = key.startsWith('file://') ? key.split('/').pop() : key;
      const filePath = join(this.uploadDir, fileName);

      await fs.unlink(filePath);
      this.logger.log(`File deleted locally: ${fileName}`);
    } catch (error) {
      this.logger.warn(`Failed to delete file locally: ${error.message}`);
      // Don't throw error for delete operations in tests
    }
  }

  private async ensureUploadDir(): Promise<void> {
    try {
      await fs.access(this.uploadDir);
    } catch {
      await fs.mkdir(this.uploadDir, { recursive: true });
      this.logger.log(`Created upload directory: ${this.uploadDir}`);
    }
  }

  private generateFileName(originalName: string): string {
    const timestamp = Date.now();
    const extension = originalName.split('.').pop();
    return `${timestamp}-${Math.random()
      .toString(36)
      .substring(2)}.${extension}`;
  }
}
