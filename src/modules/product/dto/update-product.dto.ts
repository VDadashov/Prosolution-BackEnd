import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsArray,
  ValidateNested,
  Min,
  MaxLength,
  ArrayMinSize,
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ProductImageDto } from './product-image.dto';
import { IsTitleLongField, IsSortOrder, IsOptionalPositiveId } from '../../../_common/validations';
import { ValidationLengths } from '../../../_common/validations';

export class UpdateProductDto {
  @ApiPropertyOptional({ example: 'MacBook Pro 14"' })
  @IsOptional()
  @IsTitleLongField()
  title?: string;

  @ApiPropertyOptional({ example: 2999.99 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(ValidationLengths.DESCRIPTION)
  description?: string;

  @ApiPropertyOptional({ example: 0 })
  @IsSortOrder()
  soldCount?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  inStock?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Date)
  discountStartDate?: Date | null;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Date)
  discountEndDate?: Date | null;

  @ApiPropertyOptional({ example: 2499.99 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  discountPrice?: number | null;

  @ApiPropertyOptional({ example: 1, description: 'Brend id' })
  @IsOptionalPositiveId()
  brandId?: number | null;

  @ApiPropertyOptional({
    example: [1, 3],
    description: 'Kateqoriya id-ləri (minimum 1 element; göndərilərsə əvvəlki siyahı əvəz olunur)',
    type: [Number],
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  @Min(1, { each: true })
  @Type(() => Number)
  categoryIds?: number[];

  @ApiPropertyOptional({ type: [ProductImageDto], description: 'null göndərilsə şəkillər silinir, undefined göndərilsə (sahə atılarsa) dəyişmir' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductImageDto)
  images?: ProductImageDto[] | null;
}
