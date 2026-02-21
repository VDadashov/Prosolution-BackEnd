import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ArrayMinSize, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ValidationMessages } from '../../../_common/validations';

export class AssignFeaturesToCategoryDto {
  @ApiProperty({
    example: [1, 2, 3, 4],
    description: 'Feature id-lər; sıra = filter göstərilmə sırası',
  })
  @IsArray()
  @ArrayMinSize(0)
  @Type(() => Number)
  @IsInt({ each: true })
  @Min(1, { each: true, message: ValidationMessages.POSITIVE_ID })
  featureIds: number[];
}
