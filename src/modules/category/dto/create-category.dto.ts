import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { IsTitleField, IsSortOrder, IsOptionalPositiveId } from '../../../_common/validations';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Proqramlaşdırma' })
  @IsTitleField()
  title: string;

  @ApiPropertyOptional({ example: 0, description: 'Sıralama üçün' })
  @IsSortOrder()
  order?: number;

  @ApiPropertyOptional({ example: null, description: 'Root üçün null, alt kateqoriya üçün parent id' })
  @IsOptionalPositiveId()
  parentId?: number | null;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: true, description: 'true = bu kateqoriyada məhsul yaradıla bilər' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  allowProducts?: boolean;
}
