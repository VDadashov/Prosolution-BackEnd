import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';
import { ErrorCode } from '../constants/error-codes';

/**
 * Biznes qaydaları pozulduqda
 */
export class BusinessException extends BaseException {
  constructor(
    errorCode: ErrorCode,
    message?: string,
    details?: Record<string, unknown>,
  ) {
    super(errorCode, HttpStatus.UNPROCESSABLE_ENTITY, message, details);
    this.name = 'BusinessException';
  }
}

/**
 * Konflikt (məs. email/username artıq mövcud) (409)
 */
export class ConflictException extends BaseException {
  constructor(
    errorCode: ErrorCode,
    message?: string,
    details?: Record<string, unknown>,
  ) {
    super(errorCode, HttpStatus.CONFLICT, message, details);
    this.name = 'ConflictException';
  }
}

/**
 * Giriş tələb olunur (401)
 */
export class UnauthorizedException extends BaseException {
  constructor(
    errorCode: ErrorCode = ErrorCode.AUTH_UNAUTHORIZED,
    message?: string,
    details?: Record<string, unknown>,
  ) {
    super(errorCode, HttpStatus.UNAUTHORIZED, message, details);
    this.name = 'UnauthorizedException';
  }
}
