import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { ValidationLengths } from '../../../_common/validations';

function toBoolean(value: unknown): boolean | undefined {
  if (value === undefined || value === '') return undefined;
  if (typeof value === 'boolean') return value;
  const s = String(value).toLowerCase().trim();
  if (['true', '1', 'yes'].includes(s)) return true;
  if (['false', '0', 'no'].includes(s)) return false;
  return undefined;
}

/** GET /features – yalnız search və isDeleted (pagination yox). */
export class GetFeaturesQueryDto {
  @ApiPropertyOptional({ description: 'Search in title, slug' })
  @IsOptional()
  @IsString()
  @MaxLength(ValidationLengths.TITLE)
  search?: string;

  @ApiPropertyOptional({ description: 'true = silinmiş xüsusiyyətləri də göstər' })
  @IsOptional()
  @Transform(({ value }) => toBoolean(value))
  @IsBoolean()
  isDeleted?: boolean;
}
