import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean, IsEnum, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { ValidationLengths } from '../../../_common/validations';
import { MediaType } from '../../../_common/enums/media-type.enum';

function toBoolean(value: unknown): boolean | undefined {
  if (value === undefined || value === '') return undefined;
  if (typeof value === 'boolean') return value;
  const s = String(value).toLowerCase().trim();
  if (['true', '1', 'yes'].includes(s)) return true;
  if (['false', '0', 'no'].includes(s)) return false;
  return undefined;
}

/** GET /media – yalnız search, isDeleted, type (pagination yox). */
export class GetMediaQueryDto {
  @ApiPropertyOptional({ description: 'Search in filename, path, altText' })
  @IsOptional()
  @IsString()
  @MaxLength(ValidationLengths.SHORT_TEXT)
  search?: string;

  @ApiPropertyOptional({ description: 'true = silinmiş media da göstər' })
  @IsOptional()
  @Transform(({ value }) => toBoolean(value))
  @IsBoolean()
  isDeleted?: boolean;

  @ApiPropertyOptional({ description: 'Media tipi: image | video | document | pdf | other', enum: MediaType })
  @IsOptional()
  @IsEnum(MediaType)
  type?: MediaType;
}
