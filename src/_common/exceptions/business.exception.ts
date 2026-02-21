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

/**
 * Resurs tapılmadı (404)
 */
export class NotFoundException extends BaseException {
  constructor(
    errorCode: ErrorCode,
    message?: string,
    details?: Record<string, unknown>,
  ) {
    super(errorCode, HttpStatus.NOT_FOUND, message, details);
    this.name = 'NotFoundException';
  }
}

/**
 * İcazə yoxdur (403)
 */
export class ForbiddenException extends BaseException {
  constructor(
    errorCode: ErrorCode = ErrorCode.AUTH_FORBIDDEN,
    message?: string,
    details?: Record<string, unknown>,
  ) {
    super(errorCode, HttpStatus.FORBIDDEN, message, details);
    this.name = 'ForbiddenException';
  }
}

