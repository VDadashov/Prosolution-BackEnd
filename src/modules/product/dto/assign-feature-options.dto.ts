import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ValidationMessages } from '../../../_common/validations';

export class AssignFeatureOptionsDto {
  @ApiProperty({
    example: [1, 2, 5],
    description: 'FeatureOption id-lər (məhsulun CPU, RAM və s. variantları)',
  })
  @IsArray()
  @Type(() => Number)
  @IsInt({ each: true })
  @Min(1, { each: true, message: ValidationMessages.POSITIVE_ID })
  featureOptionIds: number[];
}
