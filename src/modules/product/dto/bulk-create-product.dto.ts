import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateProductDto } from './create-product.dto';

export class BulkCreateProductDto {
  @ApiProperty({
    type: [CreateProductDto],
    description: 'Yaradılacaq məhsulların siyahısı (minimum 1 element)',
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateProductDto)
  items: CreateProductDto[];
}
