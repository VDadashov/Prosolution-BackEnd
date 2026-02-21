import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean, IsIn, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { PaginationQueryDto } from '../../../_common/dto/pagination-query.dto';
import { ValidationLengths } from '../../../_common/validations';

function toBoolean(value: unknown): boolean | undefined {
  if (value === undefined || value === '') return undefined;
  if (typeof value === 'boolean') return value;
  const s = String(value).toLowerCase().trim();
  if (['true', '1', 'yes'].includes(s)) return true;
  if (['false', '0', 'no'].includes(s)) return false;
  return undefined;
}

/** GET /contact-us/filtered – pagination, search, isDeleted, sort. */
export class GetContactUsFilteredQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Search in firstName, lastName, email' })
  @IsOptional()
  @IsString()
  @MaxLength(ValidationLengths.TITLE_LONG)
  search?: string;

  @ApiPropertyOptional({ description: 'true = silinmiş mesajları də göstər' })
  @IsOptional()
  @Transform(({ value }) => toBoolean(value))
  @IsBoolean()
  isDeleted?: boolean;

  @ApiPropertyOptional({
    description: 'Sıralama: createdAt (ən yeni əvvəl), createdAtAsc (ən köhnə əvvəl)',
    enum: ['createdAt', 'createdAtAsc'],
  })
  @IsOptional()
  @IsIn(['createdAt', 'createdAtAsc'])
  sort?: 'createdAt' | 'createdAtAsc';
}
