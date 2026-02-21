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

/** GET /features/filtered – pagination, isDeleted, isActive, search, sort. Göndərilməzsə default: sort_order (order) üzrə. */
export class GetFeaturesFilteredQueryDto extends PaginationQueryDto {
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

  @ApiPropertyOptional({ description: 'true = yalnız aktiv, false = yalnız qeyri-aktiv; göndərilməzsə hamısı' })
  @IsOptional()
  @Transform(({ value }) => toBoolean(value))
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Sıralama: a-z (title artan), z-a (title azalan), createdAt. Göndərilməzsə sort_order üzrə sıralanır.',
    enum: ['a-z', 'z-a', 'createdAt'],
  })
  @IsOptional()
  @IsIn(['a-z', 'z-a', 'createdAt'])
  sort?: 'a-z' | 'z-a' | 'createdAt';
}
