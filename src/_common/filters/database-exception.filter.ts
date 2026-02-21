import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { Response } from 'express';
import { QueryFailedError } from 'typeorm';
import { DatabaseException } from '../exceptions/database.exception';
import { DatabaseConnectionException } from '../exceptions/database-connection.exception';

const CONNECTION_ERROR_CODES = [
  'ECONNREFUSED',
  'ECONNRESET',
  'ETIMEDOUT',
  'ENOTFOUND',
  'ENETUNREACH',
];

@Catch(QueryFailedError, Error)
export class DatabaseExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof DatabaseException) {
      response.status(exception.getStatus()).json(exception.getErrorResponse());
      return;
    }

    if (exception instanceof DatabaseConnectionException) {
      response.status(exception.getStatus()).json(exception.getErrorResponse());
      return;
    }

    if (exception instanceof QueryFailedError) {
      const dbException = DatabaseException.fromDatabaseError(exception);
      response
        .status(dbException.getStatus())
        .json(dbException.getErrorResponse());
      return;
    }

    const err = exception as Error & { code?: string };
    if (err?.code && CONNECTION_ERROR_CODES.includes(err.code)) {
      const connException = DatabaseConnectionException.fromConnectionError(err);
      response
        .status(connException.getStatus())
        .json(connException.getErrorResponse());
      return;
    }

    throw exception;
  }
}
