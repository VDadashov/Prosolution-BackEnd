import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { IsPositiveId, IsSortOrder } from '../../../_common/validations';

/** Məhsul şəklі — Media id ilə (şəkil əvvəlcə Media-da yaradılır) */
export class ProductImageDto {
  @ApiProperty({ example: 1, description: 'Media id (type: image olan media)' })
  @IsPositiveId()
  mediaId: number;

  @ApiPropertyOptional({ example: true, description: 'Əsas şəkil' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isMain?: boolean;

  @ApiPropertyOptional({ example: 0, description: 'Sıralama' })
  @IsSortOrder()
  order?: number;
}
