import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { IsTitleField, IsOptionalPositiveId, IsSortOrder } from '../../../_common/validations';
import { ValidationLengths } from '../../../_common/validations';

export class CreateSliderDto {
  @ApiProperty({ example: 'Slayder başlığı' })
  @IsTitleField()
  title: string;

  @ApiPropertyOptional({ example: 'Slayder təsviri' })
  @IsOptional()
  @IsString()
  @MaxLength(ValidationLengths.DESCRIPTION)
  description?: string;

  @ApiPropertyOptional({ example: 0, description: 'Sıralama üçün' })
  @IsSortOrder()
  order?: number;

  @ApiPropertyOptional({
    example: 1,
    description: 'Media id – şəkil əvvəlcə /media/upload/image ilə yüklənir',
  })
  @IsOptionalPositiveId()
  mediaId?: number | null;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;
}
