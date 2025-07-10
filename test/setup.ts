import { config } from 'dotenv';
import { join } from 'path';

config({ path: join(__dirname, '..', '.env.test') });

// Test environment setup
process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'fatal'; // 테스트 환경에서 에러 로그 최소화
