import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { ExecutionContext } from '@nestjs/common';

/**
 * Creates a mock authentication guard for E2E tests
 * Allows bypassing authentication while still providing user context
 */
export function createMockAuthGuard(getUserId: () => string) {
  return {
    canActivate: (context: ExecutionContext) => {
      const request = context.switchToHttp().getRequest();
      request.user = {
        id: getUserId(),
        email: 'test@example.com',
      };
      return true;
    },
  };
}

/**
 * Override configuration for JWT Auth Guard in tests
 */
export function overrideAuthGuard(testingModule: any, mockGuard: any) {
  return testingModule.overrideGuard(JwtAuthGuard).useValue(mockGuard);
}
