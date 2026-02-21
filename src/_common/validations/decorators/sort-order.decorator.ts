import { applyDecorators } from '@nestjs/common';
import { IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

/** Sıralama (sort_order) — optional, 0 və yuxarı. */
export function IsSortOrder() {
  return applyDecorators(
    IsOptional(),
    Type(() => Number),
    IsInt(),
    Min(0, { message: 'Sıra mənfi ola bilməz' }),
  );
}
