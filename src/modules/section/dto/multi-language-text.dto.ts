import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class MultiLanguageTextDto {
  @ApiProperty({ example: 'Başlıq' })
  @IsString()
  @IsNotEmpty()
  az: string;

  @ApiPropertyOptional({ example: 'Title' })
  @IsOptional()
  @IsString()
  en?: string;

  @ApiPropertyOptional({ example: 'Заголовок' })
  @IsOptional()
  @IsString()
  ru?: string;
}
