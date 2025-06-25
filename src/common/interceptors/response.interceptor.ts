import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { ApiResponseDto } from '../dto/api-response.dto';

// Decorator to exclude endpoints from auto-wrapping
export const SKIP_RESPONSE_WRAPPER = 'skipResponseWrapper';
export const SkipResponseWrapper = () =>
  Reflect.defineMetadata(SKIP_RESPONSE_WRAPPER, true, {});

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, ApiResponseDto<T>>
{
  constructor(private reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponseDto<T>> {
    const skipWrapper = this.reflector.get<boolean>(
      SKIP_RESPONSE_WRAPPER,
      context.getHandler(),
    );

    if (skipWrapper) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const path = request.url;

    return next.handle().pipe(
      map((data) => {
        // If data is already wrapped (has success property), return as-is
        if (data && typeof data === 'object' && 'success' in data) {
          return data;
        }

        // Handle different response types
        if (
          data &&
          typeof data === 'object' &&
          'message' in data &&
          Object.keys(data).length === 1
        ) {
          // Simple message responses like { message: "..." }
          return new ApiResponseDto(null, data.message, path);
        }

        // Wrap regular data responses
        return new ApiResponseDto(data, undefined, path);
      }),
    );
  }
}
