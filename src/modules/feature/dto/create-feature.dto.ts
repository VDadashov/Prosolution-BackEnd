import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsBoolean, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { IsTitleField, IsTitleLongField, IsSortOrder } from '../../../_common/validations';

export class CreateFeatureOptionItemDto {
  @ApiProperty({ example: 'Qırmızı' })
  @IsTitleLongField()
  title: string;

  @ApiPropertyOptional({ example: 0 })
  @IsSortOrder()
  order?: number;
}

export class CreateFeatureDto {
  @ApiProperty({ example: 'Rəng' })
  @IsTitleField()
  title: string;

  @ApiPropertyOptional({ example: 0 })
  @IsSortOrder()
  order?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Feature ilə eyni anda əlavə ediləcək option-lar (title, order)',
    type: [CreateFeatureOptionItemDto],
    example: [{ title: 'Qırmızı', order: 0 }, { title: 'Mavi', order: 1 }],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateFeatureOptionItemDto)
  options?: CreateFeatureOptionItemDto[];
}
