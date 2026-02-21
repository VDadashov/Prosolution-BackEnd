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
} from 'class-validator';
import { Type } from 'class-transformer';
import { ProductImageDto } from './product-image.dto';
import { IsPositiveId, IsOptionalPositiveId, IsTitleLongField, IsSortOrder } from '../../../_common/validations';
import { ValidationLengths } from '../../../_common/validations';

export class CreateProductDto {
  @ApiProperty({ example: 1, description: 'Kateqoriya id (allowProducts=true olmalıdır)' })
  @IsPositiveId()
  categoryId: number;

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
  soldCount?: number;

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

  @ApiPropertyOptional({ example: 1, description: 'Brend id (brands cədvəli)' })
  @IsOptionalPositiveId()
  brandId?: number;

  @ApiPropertyOptional({ type: [ProductImageDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductImageDto)
  images?: ProductImageDto[];
}
