import { applyDecorators } from '@nestjs/common';
import { IsString, MinLength, MaxLength } from 'class-validator';
import { ValidationLengths, ValidationMessages } from '../constants';

/** Media path (URL və ya fayl yolu) — 1–1000 simvol */
export function IsPathField() {
  return applyDecorators(
    IsString(),
    MinLength(1, { message: ValidationMessages.NOT_EMPTY_STRING }),
    MaxLength(ValidationLengths.PATH, { message: ValidationMessages.MAX_LENGTH(ValidationLengths.PATH) }),
  );
}

/** Fayl adı və ya qısa mətn (filename, altText) — 1–255 simvol */
export function IsShortTextField() {
  return applyDecorators(
    IsString(),
    MinLength(1, { message: ValidationMessages.NOT_EMPTY_STRING }),
    MaxLength(ValidationLengths.SHORT_TEXT, { message: ValidationMessages.MAX_LENGTH(ValidationLengths.SHORT_TEXT) }),
  );
}
