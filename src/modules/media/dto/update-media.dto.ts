import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsInt, Min, MaxLength } from 'class-validator';
import { MediaType } from '../../../_common/enums/media-type.enum';
import { IsPathField, IsShortTextField } from '../../../_common/validations';
import { ValidationLengths } from '../../../_common/validations';

export class UpdateMediaDto {
  @ApiPropertyOptional({ enum: MediaType })
  @IsOptional()
  @IsEnum(MediaType)
  type?: MediaType;

  @ApiPropertyOptional({ example: '/uploads/2024/01/photo.jpg' })
  @IsOptional()
  @IsPathField()
  path?: string;

  @ApiPropertyOptional({ example: 'photo.jpg' })
  @IsOptional()
  @IsShortTextField()
  filename?: string;

  @ApiPropertyOptional({ description: 'Cloudinary public_id' })
  @IsOptional()
  @IsString()
  @MaxLength(ValidationLengths.SLUG_OR_ID)
  publicId?: string | null;

  @ApiPropertyOptional({ example: 'image/jpeg' })
  @IsOptional()
  @IsString()
  @MaxLength(ValidationLengths.MIME_TYPE)
  mimeType?: string | null;

  @ApiPropertyOptional({ example: 'Məhsul şəklі' })
  @IsOptional()
  @IsString()
  @MaxLength(ValidationLengths.SHORT_TEXT)
  altText?: string | null;

  @ApiPropertyOptional({ example: 102400 })
  @IsOptional()
  @IsInt()
  @Min(0)
  size?: number | null;
}
