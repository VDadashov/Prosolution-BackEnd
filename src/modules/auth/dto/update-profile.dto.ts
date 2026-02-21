import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength, MaxLength } from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'Vusal' })
  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'First name cannot be empty' })
  @MaxLength(50)
  firstName?: string;

  @ApiPropertyOptional({ example: 'Dadasov' })
  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'Last name cannot be empty' })
  @MaxLength(50)
  lastName?: string;

  @ApiPropertyOptional({ example: 'vusal.d' })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Username must be at least 2 characters' })
  @MaxLength(50)
  username?: string;
}
