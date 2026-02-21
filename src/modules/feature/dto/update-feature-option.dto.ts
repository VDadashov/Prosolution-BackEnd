import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { IsTitleLongField, IsSortOrder } from '../../../_common/validations';

export class UpdateFeatureOptionDto {
  @ApiPropertyOptional({ example: 'Intel® Core™ i5-13400' })
  @IsOptional()
  @IsTitleLongField()
  title?: string;

  @ApiPropertyOptional({ example: 0 })
  @IsSortOrder()
  order?: number;
}
