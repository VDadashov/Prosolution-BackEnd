import { HttpStatus } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { BaseException } from './base.exception';
import { ErrorCode } from '../constants/error-codes';

/**
 * Veritabanı xətaları üçün.
 * PostgreSQL xəta kodlarını ErrorCode-a map edir.
 */
export class DatabaseException extends BaseException {
  constructor(
    errorCode: ErrorCode = ErrorCode.DB_QUERY_FAILED,
    message?: string,
    details?: Record<string, unknown>,
  ) {
    super(errorCode, HttpStatus.INTERNAL_SERVER_ERROR, message, details);
    this.name = 'DatabaseException';
  }

  static fromDatabaseError(error: QueryFailedError & { code?: string }): DatabaseException {
    const pgErrorCodes: Record<string, ErrorCode> = {
      '23505': ErrorCode.DB_DUPLICATE_ENTRY,
      '23503': ErrorCode.DB_FOREIGN_KEY_VIOLATION,
      '23502': ErrorCode.VALIDATION_REQUIRED_FIELD,
      '22001': ErrorCode.VALIDATION_INVALID_RANGE,
      '08000': ErrorCode.DB_CONNECTION_FAILED,
      '08003': ErrorCode.DB_CONNECTION_FAILED,
      '08006': ErrorCode.DB_CONNECTION_FAILED,
      '40001': ErrorCode.DB_TRANSACTION_FAILED,
      '40P01': ErrorCode.DB_TRANSACTION_FAILED,
    };

    const errorCode = error.code ? pgErrorCodes[error.code] : undefined;
    const driverError = (error as { driverError?: { message?: string; code?: string } })
      .driverError ?? error;

    if (errorCode) {
      return new DatabaseException(errorCode, undefined, {
        originalError:
          process.env.NODE_ENV === 'production'
            ? undefined
            : (driverError?.message ?? error.message),
        code: error.code,
      });
    }

    return new DatabaseException(
      ErrorCode.DB_QUERY_FAILED,
      process.env.NODE_ENV === 'production'
        ? undefined
        : error.message,
      {
        originalError:
          process.env.NODE_ENV === 'production' ? undefined : error.message,
      },
    );
  }
}
