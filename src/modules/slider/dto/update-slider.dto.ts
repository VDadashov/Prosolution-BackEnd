import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { IsTitleField, IsOptionalPositiveId, IsSortOrder } from '../../../_common/validations';
import { ValidationLengths } from '../../../_common/validations';

export class UpdateSliderDto {
  @ApiPropertyOptional({ example: 'Slayder başlığı' })
  @IsOptional()
  @IsTitleField()
  title?: string;

  @ApiPropertyOptional({ example: 'Slayder təsviri' })
  @IsOptional()
  @IsString()
  @MaxLength(ValidationLengths.DESCRIPTION)
  description?: string;

  @ApiPropertyOptional({ example: 0 })
  @IsSortOrder()
  order?: number;

  @ApiPropertyOptional({
    example: 1,
    description: 'Media id – şəkil /media/upload/image ilə yüklənir',
  })
  @IsOptionalPositiveId()
  mediaId?: number | null;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;
}
