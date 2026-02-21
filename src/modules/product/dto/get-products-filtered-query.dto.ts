import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean, IsIn, IsArray, IsInt, Min, MaxLength } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { PaginationQueryDto } from '../../../_common/dto/pagination-query.dto';
import { IsOptionalPositiveId } from '../../../_common/validations';
import { ValidationLengths } from '../../../_common/validations';

function toBoolean(value: unknown): boolean | undefined {
  if (value === undefined || value === '') return undefined;
  if (typeof value === 'boolean') return value;
  const s = String(value).toLowerCase().trim();
  if (['true', '1', 'yes'].includes(s)) return true;
  if (['false', '0', 'no'].includes(s)) return false;
  return undefined;
}

function toFeatureOptionIds(value: unknown): number[] | undefined {
  if (value === undefined || value === '') return undefined;
  if (Array.isArray(value)) {
    const nums = value.map((v) => (typeof v === 'string' ? parseInt(v, 10) : Number(v))).filter((n) => !Number.isNaN(n) && n >= 1);
    return nums.length ? nums : undefined;
  }
  const s = String(value).trim();
  if (!s) return undefined;
  const nums = s.split(',').map((x) => parseInt(x.trim(), 10)).filter((n) => !Number.isNaN(n) && n >= 1);
  return nums.length ? [...new Set(nums)] : undefined;
}

/** GET /products/filtered – pagination, search, isDeleted, isActive, categorySlug, featureOptionIds, minPrice, maxPrice, brandId, inStock, sort. */
export class GetProductsFilteredQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Search in title, slug' })
  @IsOptional()
  @IsString()
  @MaxLength(ValidationLengths.TITLE_LONG)
  search?: string;

  @ApiPropertyOptional({ description: 'true = silinmiş məhsulları də göstər' })
  @IsOptional()
  @Transform(({ value }) => toBoolean(value))
  @IsBoolean()
  isDeleted?: boolean;

  @ApiPropertyOptional({ description: 'true = yalnız aktiv, false = yalnız qeyri-aktiv; göndərilməzsə hamısı' })
  @IsOptional()
  @Transform(({ value }) => toBoolean(value))
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Kateqoriya slug – yalnız həmin kateqoriyadakı məhsullar (məs. elektronika)' })
  @IsOptional()
  @IsString()
  @MaxLength(ValidationLengths.SLUG)
  categorySlug?: string;

  @ApiPropertyOptional({
    description:
      'Feature option id-ləri – GET /features/by-category/:categoryId cavabındakı options[].id. Bir sahədə vergüllə yazın: 1,2,5 (eyni feature: OR; fərqli feature-lar: AND).',
    example: '1,2,5',
    type: String,
  })
  @IsOptional()
  @Transform(({ value }) => toFeatureOptionIds(value))
  @IsArray()
  @IsInt({ each: true })
  @Min(1, { each: true })
  featureOptionIds?: number[];

  @ApiPropertyOptional({ description: 'Minimum qiymət', minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({ description: 'Maksimum qiymət', minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({ description: 'Brend id (product.brandId)' })
  @IsOptionalPositiveId()
  brandId?: number;

  @ApiPropertyOptional({ description: 'Yalnız stokda olan (true) və ya yalnız stokda olmayan (false)' })
  @IsOptional()
  @Transform(({ value }) => toBoolean(value))
  @IsBoolean()
  inStock?: boolean;

  @ApiPropertyOptional({
    description: 'Sıralama: a-z (title artan), z-a (title azalan), createdAt',
    enum: ['a-z', 'z-a', 'createdAt'],
  })
  @IsOptional()
  @IsIn(['a-z', 'z-a', 'createdAt'])
  sort?: 'a-z' | 'z-a' | 'createdAt';
}
