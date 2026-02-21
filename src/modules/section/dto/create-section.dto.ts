import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsIn,
  IsNumber,
  IsOptional,
  IsBoolean,
  Min,
  ValidateNested,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import { MultiLanguageTextDto } from './multi-language-text.dto';

const SECTION_TYPES = [
  'hero', 'content', 'about', 'services', 'gallery', 'contact',
  'footer', 'navbar', 'testimonial', 'blog', 'custom',
] as const;

export class CreateSectionDto {
  @ApiProperty({ example: 'Hero block' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ enum: SECTION_TYPES })
  @IsString()
  @IsIn([...SECTION_TYPES])
  type: (typeof SECTION_TYPES)[number];

  @ApiProperty({ type: MultiLanguageTextDto })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => MultiLanguageTextDto)
  title: MultiLanguageTextDto;

  @ApiProperty({ type: MultiLanguageTextDto })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => MultiLanguageTextDto)
  description: MultiLanguageTextDto;

  @ApiProperty({ example: 1 })
  @IsNumber()
  pageId: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  order?: number;

  @ApiPropertyOptional({ enum: ['desktop', 'mobile', 'both'], default: 'both' })
  @IsOptional()
  @IsString()
  @IsIn(['desktop', 'mobile', 'both'])
  visibility?: 'desktop' | 'mobile' | 'both';

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsObject()
  media?: Record<string, unknown> | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsObject()
  additionalData?: Record<string, unknown> | null;
}
