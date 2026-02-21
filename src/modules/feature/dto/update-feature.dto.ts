import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { IsTitleField, IsSortOrder } from '../../../_common/validations';

export class UpdateFeatureDto {
  @ApiPropertyOptional({ example: 'CPU' })
  @IsOptional()
  @IsTitleField()
  title?: string;

  @ApiPropertyOptional({ example: 0 })
  @IsSortOrder()
  order?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;
}
