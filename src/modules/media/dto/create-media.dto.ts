import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsInt, Min, MaxLength } from 'class-validator';
import { MediaType } from '../../../_common/enums/media-type.enum';
import { IsPathField, IsShortTextField } from '../../../_common/validations';
import { ValidationLengths } from '../../../_common/validations';

export class CreateMediaDto {
  @ApiProperty({ enum: MediaType, example: MediaType.IMAGE })
  @IsEnum(MediaType)
  type: MediaType;

  @ApiProperty({ example: '/uploads/2024/01/photo.jpg', description: 'Saxlama yolu və ya URL' })
  @IsPathField()
  path: string;

  @ApiProperty({ example: 'photo.jpg', description: 'Orijinal fayl adı' })
  @IsShortTextField()
  filename: string;

  @ApiPropertyOptional({ description: 'Cloudinary public_id (upload zamanı avtomatik set olunur)' })
  @IsOptional()
  @IsString()
  @MaxLength(ValidationLengths.SLUG_OR_ID)
  publicId?: string;

  @ApiPropertyOptional({ example: 'image/jpeg' })
  @IsOptional()
  @IsString()
  @MaxLength(ValidationLengths.MIME_TYPE)
  mimeType?: string;

  @ApiPropertyOptional({ example: 'Məhsul şəklі' })
  @IsOptional()
  @IsString()
  @MaxLength(ValidationLengths.SHORT_TEXT)
  altText?: string;

  @ApiPropertyOptional({ example: 102400, description: 'Ölçü (bayt)' })
  @IsOptional()
  @IsInt()
  @Min(0)
  size?: number;
}
