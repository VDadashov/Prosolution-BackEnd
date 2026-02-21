import { applyDecorators } from '@nestjs/common';
import { IsOptional, ValidateIf, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ValidationMessages } from '../constants';

/** Müsbət tam id (categoryId, productId və s.) */
export function IsPositiveId() {
  return applyDecorators(
    Type(() => Number),
    IsInt(),
    Min(1, { message: ValidationMessages.POSITIVE_ID }),
  );
}

/** Optional müsbət tam id (məs. parentId — göndərilsə 1+ olmalıdır). Query-dan '' gələndə atlanır. */
export function IsOptionalPositiveId() {
  return applyDecorators(
    IsOptional(),
    ValidateIf((_, v) => v != null && v !== ''),
    Type(() => Number),
    IsInt(),
    Min(1, { message: ValidationMessages.POSITIVE_ID }),
  );
}
