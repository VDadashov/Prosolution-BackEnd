import { applyDecorators } from '@nestjs/common';
import { IsString, MinLength, MaxLength } from 'class-validator';
import { ValidationLengths, ValidationMessages } from '../constants';

/**
 * Kateqoriya, Feature və s. üçün title sahəsi (qısa ad).
 * Max 100 simvol.
 */
export function IsTitleField() {
  return applyDecorators(
    IsString(),
    MinLength(1, { message: ValidationMessages.NOT_EMPTY_STRING }),
    MaxLength(ValidationLengths.TITLE, { message: ValidationMessages.MAX_LENGTH(ValidationLengths.TITLE) }),
  );
}

/**
 * Məhsul və s. üçün uzun title (255 simvol).
 */
export function IsTitleLongField() {
  return applyDecorators(
    IsString(),
    MinLength(1, { message: ValidationMessages.NOT_EMPTY_STRING }),
    MaxLength(ValidationLengths.TITLE_LONG, { message: ValidationMessages.MAX_LENGTH(ValidationLengths.TITLE_LONG) }),
  );
}
