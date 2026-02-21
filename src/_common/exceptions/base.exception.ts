import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode, ErrorMessages } from '../constants/error-codes';

export interface ErrorResponseBody {
  success: false;
  errorCode: ErrorCode;
  statusCode: number;
  message: string | string[];
  timestamp: string;
  path?: string;
  requestId?: string;
  details?: Record<string, unknown>;
}

/**
 * Bütün custom exception-lar üçün əsas class.
 * Tətbiqdə eyni xəta strukturunu təmin edir.
 */
export abstract class BaseException extends HttpException {
  public readonly errorCode: ErrorCode;
  public readonly timestamp: string;
  /** İstifadəçiyə göstərilən mesaj (ErrorMessages və ya custom) */
  public readonly responseMessage: string;
  public readonly path?: string;
  public readonly details?: Record<string, unknown>;

  constructor(
    errorCode: ErrorCode,
    statusCode: HttpStatus,
    message?: string,
    details?: Record<string, unknown>,
  ) {
    const errorMessage = message ?? ErrorMessages[errorCode];
    super(
      {
        success: false,
        errorCode,
        message: errorMessage,
        timestamp: new Date().toISOString(),
        details,
      },
      statusCode,
    );
    this.errorCode = errorCode;
    this.timestamp = new Date().toISOString();
    this.responseMessage = errorMessage;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }

  getErrorResponse(): ErrorResponseBody {
    return {
      success: false,
      errorCode: this.errorCode,
      statusCode: this.getStatus(),
      message: this.responseMessage,
      timestamp: this.timestamp,
      ...(this.details && { details: this.details }),
      ...(this.path && { path: this.path }),
    };
  }

  setPath(path: string): this {
    (this as { path?: string }).path = path;
    return this;
  }
}
