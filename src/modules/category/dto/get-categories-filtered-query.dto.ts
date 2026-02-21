import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean, IsIn, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { PaginationQueryDto } from '../../../_common/dto/pagination-query.dto';
import { ValidationLengths } from '../../../_common/validations';
import { IsSortOrder, IsOptionalPositiveId } from '../../../_common/validations';

function toBoolean(value: unknown): boolean | undefined {
  if (value === undefined || value === '') return undefined;
  if (typeof value === 'boolean') return value;
  const s = String(value).toLowerCase().trim();
  if (['true', '1', 'yes'].includes(s)) return true;
  if (['false', '0', 'no'].includes(s)) return false;
  return undefined;
}

/** GET /categories/filtered – pagination, isDeleted, level, parentId, search, sort (default: level). */
export class GetCategoriesFilteredQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Search in title, slug' })
  @IsOptional()
  @IsString()
  @MaxLength(ValidationLengths.TITLE)
  search?: string;

  @ApiPropertyOptional({ description: 'true = silinmiş kateqoriyaları da göstər' })
  @IsOptional()
  @Transform(({ value }) => toBoolean(value))
  @IsBoolean()
  isDeleted?: boolean;

  @ApiPropertyOptional({ description: 'Kateqoriya səviyyəsi (0 = root)' })
  @IsSortOrder()
  level?: number;

  @ApiPropertyOptional({ description: 'Parent kateqoriya id (null üçün root)' })
  @IsOptionalPositiveId()
  parentId?: number;

  @ApiPropertyOptional({
    description: 'Sıralama: level (default – level, order, title), a-z, z-a, order, createdAt',
    enum: ['level', 'a-z', 'z-a', 'order', 'createdAt'],
  })
  @IsOptional()
  @IsIn(['level', 'a-z', 'z-a', 'order', 'createdAt'])
  sort?: 'level' | 'a-z' | 'z-a' | 'order' | 'createdAt';
}
