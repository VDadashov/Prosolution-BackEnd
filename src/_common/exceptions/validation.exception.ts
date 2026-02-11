import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';
import { ErrorCode } from '../constants/error-codes';

export interface ValidationErrorItem {
  field: string;
  message: string;
  value?: unknown;
  constraints?: Record<string, string>;
}

/**
 * Validasiya xətaları üçün
 */
export class ValidationException extends BaseException {
  constructor(
    message?: string,
    validationErrors?: ValidationErrorItem[],
  ) {
    super(
      ErrorCode.VALIDATION_FAILED,
      HttpStatus.BAD_REQUEST,
      message ?? 'Məlumatların yoxlanılması uğursuz oldu',
      validationErrors ? { validationErrors } : undefined,
    );
    this.name = 'ValidationException';
  }
}
