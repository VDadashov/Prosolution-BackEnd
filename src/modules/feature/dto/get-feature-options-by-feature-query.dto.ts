import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsBoolean, IsString, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { PaginationQueryDto } from '../../../_common/dto/pagination-query.dto';
import { ValidationLengths } from '../../../_common/validations';

function toBoolean(value: unknown): boolean | undefined {
  if (value === undefined || value === '') return undefined;
  if (typeof value === 'boolean') return value;
  const s = String(value).toLowerCase().trim();
  if (['true', '1', 'yes'].includes(s)) return true;
  if (['false', '0', 'no'].includes(s)) return false;
  return undefined;
}

/** GET /features/options/by-feature/:featureId – pagination, search (title/slug), isActive. */
export class GetFeatureOptionsByFeatureQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Axtarış title və slug-da (ILIKE)' })
  @IsOptional()
  @IsString()
  @MaxLength(ValidationLengths.TITLE_LONG)
  search?: string;

  @ApiPropertyOptional({ description: 'true = yalnız aktiv, false = yalnız qeyri-aktiv; göndərilməzsə hamısı' })
  @IsOptional()
  @Transform(({ value }) => toBoolean(value))
  @IsBoolean()
  isActive?: boolean;
}
