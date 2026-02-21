import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateFeatureOptionItemDto } from './create-feature.dto';

export class AddFeatureOptionsDto {
  @ApiProperty({
    description: 'Feature-a əlavə ediləcək option-lar (title, order). Eyni title artıq varsa atlanır.',
    type: [CreateFeatureOptionItemDto],
    example: [
      { title: 'Qırmızı', order: 0 },
      { title: 'Mavi', order: 1 },
      { title: 'Yaşıl', order: 2 },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateFeatureOptionItemDto)
  options: CreateFeatureOptionItemDto[];
}
