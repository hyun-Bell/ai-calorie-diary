export interface FileStorageService {
  uploadFile(file: Express.Multer.File, key?: string): Promise<string>;
  deleteFile(key: string): Promise<void>;
}

export interface FileUploadResult {
  url: string;
  key: string;
}

export const FILE_STORAGE_SERVICE_TOKEN = 'FILE_STORAGE_SERVICE';
