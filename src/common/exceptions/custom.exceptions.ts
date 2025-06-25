import { HttpException, HttpStatus } from '@nestjs/common';

export class AuthenticationException extends HttpException {
  constructor(message: string = 'Authentication failed') {
    super(
      {
        message,
        errorCode: 'AUTHENTICATION_FAILED',
      },
      HttpStatus.UNAUTHORIZED,
    );
  }
}

export class AuthorizationException extends HttpException {
  constructor(message: string = 'Access denied') {
    super(
      {
        message,
        errorCode: 'AUTHORIZATION_FAILED',
      },
      HttpStatus.FORBIDDEN,
    );
  }
}

export class ValidationException extends HttpException {
  constructor(message: string = 'Validation failed') {
    super(
      {
        message,
        errorCode: 'VALIDATION_FAILED',
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class DiaryNotFoundException extends HttpException {
  constructor(message: string = 'Diary not found') {
    super(
      {
        message,
        errorCode: 'DIARY_NOT_FOUND',
      },
      HttpStatus.NOT_FOUND,
    );
  }
}

export class UserNotFoundException extends HttpException {
  constructor(message: string = 'User not found') {
    super(
      {
        message,
        errorCode: 'USER_NOT_FOUND',
      },
      HttpStatus.NOT_FOUND,
    );
  }
}

export class InvalidRefreshTokenException extends HttpException {
  constructor(message: string = 'Invalid refresh token') {
    super(
      {
        message,
        errorCode: 'INVALID_REFRESH_TOKEN',
      },
      HttpStatus.UNAUTHORIZED,
    );
  }
}

export class DuplicateEmailException extends HttpException {
  constructor(message: string = 'Email already exists') {
    super(
      {
        message,
        errorCode: 'DUPLICATE_EMAIL',
      },
      HttpStatus.CONFLICT,
    );
  }
}
