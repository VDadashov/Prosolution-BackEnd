import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean, IsIn, IsEnum, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { PaginationQueryDto } from '../../../_common/dto/pagination-query.dto';
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

/** GET /media/filtered – pagination, isDeleted, search, type, sort (a-z | z-a | createdAt). */
export class GetMediaFilteredQueryDto extends PaginationQueryDto {
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

  @ApiPropertyOptional({
    description: 'Sıralama: a-z (filename artan), z-a (filename azalan), createdAt',
    enum: ['a-z', 'z-a', 'createdAt'],
  })
  @IsOptional()
  @IsIn(['a-z', 'z-a', 'createdAt'])
  sort?: 'a-z' | 'z-a' | 'createdAt';
}
