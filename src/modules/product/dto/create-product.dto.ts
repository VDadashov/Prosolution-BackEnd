import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsNumber,
  IsBoolean,
  IsArray,
  ValidateNested,
  Min,
  MaxLength,
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ProductImageDto } from './product-image.dto';
import { IsOptionalPositiveId, IsTitleLongField, IsSortOrder } from '../../../_common/validations';
import { ValidationLengths } from '../../../_common/validations';

export class CreateProductDto {
  @ApiPropertyOptional({
    example: [1, 3],
    description: 'Kateqoriya id-ləri (hər biri allowProducts=true olmalıdır); null və ya göndərilməzsə boş saxlanılır',
    type: [Number],
  })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Min(1, { each: true })
  @Type(() => Number)
  categoryIds?: number[] | null;

  @ApiProperty({ example: 'MacBook Pro 14"' })
  @IsTitleLongField()
  title: string;

  @ApiProperty({ example: 2999.99 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(ValidationLengths.DESCRIPTION)
  description?: string;

  @ApiPropertyOptional({ example: 0 })
  @IsSortOrder()
  stockCount?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  inStock?: boolean;

  @ApiPropertyOptional({ example: '2026-02-12T03:30:48.377Z' })
  @IsOptional()
  @Type(() => Date)
  discountStartDate?: Date;

  @ApiPropertyOptional({ example: '2026-02-12T03:30:48.377Z' })
  @IsOptional()
  @Type(() => Date)
  discountEndDate?: Date;

  @ApiPropertyOptional({ example: 2499.99 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  discountPrice?: number;

  @ApiPropertyOptional({ example: 1, description: 'Brend id (brands cədvəli), null göndərilsə brand silinir' })
  @IsOptionalPositiveId()
  brandId?: number | null;

  @ApiPropertyOptional({ type: [ProductImageDto], description: 'null göndərilsə şəkillər saxlanılır, [] göndərilsə silinir' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductImageDto)
  images?: ProductImageDto[] | null;
}
