import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { BaseException } from '../../_common/exceptions/base.exception';
import { DatabaseException } from '../../_common/exceptions/database.exception';
import { DatabaseConnectionException } from '../../_common/exceptions/database-connection.exception';
import { ErrorCode } from '../../_common/constants/error-codes';
import { QueryFailedError } from 'typeorm';

const CONNECTION_ERROR_CODES = [
  'ECONNREFUSED',
  'ECONNRESET',
  'ETIMEDOUT',
  'ENOTFOUND',
  'ENETUNREACH',
];

/**
 * Global exception filter.
 * Bütün xətaları tutur və eyni formatda cavab qaytarır.
 */
@Catch()
export class HttpAllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpAllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: HttpStatus;
    let errorResponse: Record<string, unknown>;

    if (exception instanceof BaseException) {
      status = exception.getStatus();
      errorResponse = { ...exception.getErrorResponse(), path: request.url };
    } else if (exception instanceof DatabaseConnectionException) {
      status = exception.getStatus();
      errorResponse = { ...exception.getErrorResponse(), path: request.url };
      this.logger.error(
        `Database connection error: ${exception.message}`,
        exception.stack,
      );
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      errorResponse = {
        success: false,
        statusCode: status,
        message:
          typeof exceptionResponse === 'string'
            ? exceptionResponse
            : (exceptionResponse as { message?: string }).message ??
              exception.message,
        timestamp: new Date().toISOString(),
        path: request.url,
        ...(typeof exceptionResponse === 'object' &&
          exceptionResponse !== null && { ...(exceptionResponse as object) }),
      };
    } else if (exception instanceof QueryFailedError) {
      const dbException = DatabaseException.fromDatabaseError(exception);
      status = dbException.getStatus();
      errorResponse = { ...dbException.getErrorResponse(), path: request.url };
      this.logger.error(
        `Database error: ${exception.message}`,
        (exception as Error).stack,
      );
    } else {
      const err = exception as Error & { code?: string };
      if (err?.code && CONNECTION_ERROR_CODES.includes(err.code)) {
        const connException =
          DatabaseConnectionException.fromConnectionError(err);
        status = connException.getStatus();
        errorResponse = { ...connException.getErrorResponse(), path: request.url };
        this.logger.error(
          `Database connection error: ${err.message}`,
          err.stack,
        );
      } else {
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        errorResponse = {
          success: false,
          statusCode: status,
          errorCode: ErrorCode.SYSTEM_INTERNAL_ERROR,
          message: 'Daxili server xətası baş verdi',
          timestamp: new Date().toISOString(),
          path: request.url,
        };
        this.logger.error(
          `Unexpected error: ${exception}`,
          exception instanceof Error ? exception.stack : undefined,
        );
      }
    }

    const requestId = request.headers['x-request-id'] as string | undefined;
    if (requestId) {
      errorResponse.requestId = requestId;
    }

    if (process.env.NODE_ENV === 'production') {
      const details = errorResponse.details as Record<string, unknown> | undefined;
      if (details?.originalError) {
        delete details.originalError;
      }
    }

    response.status(status).json(errorResponse);
  }
}
