import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { IsTitleField, IsSortOrder, IsOptionalPositiveId } from '../../../_common/validations';

export class UpdateCategoryDto {
  @ApiPropertyOptional({ example: 'Proqramlaşdırma' })
  @IsOptional()
  @IsTitleField()
  title?: string;

  @ApiPropertyOptional({ example: 0 })
  @IsSortOrder()
  order?: number;

  @ApiPropertyOptional({ description: 'Root etmək üçün null göndərin' })
  @IsOptionalPositiveId()
  parentId?: number | null;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  allowProducts?: boolean;
}
