import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean, IsIn, MaxLength } from 'class-validator';
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

/** GET /sliders/filtered – pagination, isDeleted, search, sort (a-z | z-a | order | createdAt). */
export class GetSlidersFilteredQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Search in title, slug' })
  @IsOptional()
  @IsString()
  @MaxLength(ValidationLengths.TITLE)
  search?: string;

  @ApiPropertyOptional({ description: 'true = silinmiş slayderləri də göstər' })
  @IsOptional()
  @Transform(({ value }) => toBoolean(value))
  @IsBoolean()
  isDeleted?: boolean;

  @ApiPropertyOptional({
    description: 'Sıralama: a-z (title artan), z-a (title azalan), order (sort_order), createdAt',
    enum: ['a-z', 'z-a', 'order', 'createdAt'],
  })
  @IsOptional()
  @IsIn(['a-z', 'z-a', 'order', 'createdAt'])
  sort?: 'a-z' | 'z-a' | 'order' | 'createdAt';
}
