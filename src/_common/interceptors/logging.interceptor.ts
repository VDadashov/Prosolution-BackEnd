import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse();
    const { method, url, ip } = request;
    const requestId =
      (request.headers['x-request-id'] as string) || this.generateRequestId();
    (request as Request & { requestId?: string }).requestId = requestId;

    const startTime = Date.now();

    this.logger.log(`→ ${method} ${url} | IP: ${ip} | ID: ${requestId}`);

    return next.handle().pipe(
      tap({
        next: () => {
          const statusCode = response.statusCode;
          const duration = Date.now() - startTime;
          this.logger.log(
            `← ${method} ${url} | Status: ${statusCode} | ${duration}ms | ID: ${requestId}`,
          );
        },
        error: (err: Error & { status?: number }) => {
          const statusCode = err?.status ?? 500;
          const duration = Date.now() - startTime;
          this.logger.warn(
            `← ${method} ${url} | Status: ${statusCode} | ${duration}ms | ID: ${requestId} | Error: ${err?.message ?? err}`,
          );
        },
      }),
    );
  }

  private generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }
}
