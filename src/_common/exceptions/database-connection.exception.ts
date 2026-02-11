import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';
import { ErrorCode } from '../constants/error-codes';

/**
 * Veritabanı əlaqə xətaları (ECONNREFUSED, timeout və s.)
 */
export class DatabaseConnectionException extends BaseException {
  constructor(
    errorCode: ErrorCode = ErrorCode.DB_CONNECTION_FAILED,
    message?: string,
    details?: Record<string, unknown>,
  ) {
    super(errorCode, HttpStatus.SERVICE_UNAVAILABLE, message, details);
    this.name = 'DatabaseConnectionException';
  }

  static fromConnectionError(
    error: Error & { code?: string; address?: string; port?: number },
  ): DatabaseConnectionException {
    const errorCode =
      error.code === 'ECONNREFUSED'
        ? ErrorCode.DB_CONNECTION_FAILED
        : ErrorCode.SYSTEM_SERVICE_UNAVAILABLE;
    return new DatabaseConnectionException(
      errorCode,
      undefined,
      {
        originalError: process.env.NODE_ENV === 'production' ? undefined : error.message,
        code: error.code,
        address: error.address,
        port: error.port,
      },
    );
  }
}
