import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength } from 'class-validator';
import { ValidationLengths } from '../../../_common/validations';

/** Multipart: file + optional altText (form-data) */
export class UploadImageDto {
  @ApiProperty({ type: 'string', format: 'binary', description: 'Yüklənəcək şəkil (jpeg, png, jpg, webp — max 5MB)' })
  file: unknown;

  @ApiPropertyOptional({ example: 'Məhsul şəklі' })
  @IsOptional()
  @IsString()
  @MaxLength(ValidationLengths.SHORT_TEXT)
  altText?: string;
}

export class UploadVideoDto {
  @ApiProperty({ type: 'string', format: 'binary', description: 'Yüklənəcək video (mp4, webm, avi, mkv — max 50MB)' })
  file: unknown;

  @ApiPropertyOptional({ example: 'Təqdimat videosu' })
  @IsOptional()
  @IsString()
  @MaxLength(ValidationLengths.SHORT_TEXT)
  altText?: string;
}

export class UploadPdfDto {
  @ApiProperty({ type: 'string', format: 'binary', description: 'Yüklənəcək PDF (max 10MB)' })
  file: unknown;

  @ApiPropertyOptional({ example: 'Təlimat' })
  @IsOptional()
  @IsString()
  @MaxLength(ValidationLengths.SHORT_TEXT)
  altText?: string;
}
