import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsPositiveId, IsTitleLongField, IsSortOrder } from '../../../_common/validations';

export class CreateFeatureOptionDto {
  @ApiProperty({ example: 1, description: 'Feature id' })
  @IsPositiveId()
  featureId: number;

  @ApiProperty({ example: 'Intel® Core™ i5-13400' })
  @IsTitleLongField()
  title: string;

  @ApiPropertyOptional({ example: 0 })
  @IsSortOrder()
  order?: number;
}
