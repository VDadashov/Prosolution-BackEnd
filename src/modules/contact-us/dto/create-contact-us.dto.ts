import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, MaxLength, MinLength } from 'class-validator';
import { ValidationLengths, ValidationMessages } from '../../../_common/validations';

export class CreateContactUsDto {
  @ApiProperty({ example: 'string', maxLength: 100 })
  @IsString()
  @MinLength(1, { message: ValidationMessages.REQUIRED })
  @MaxLength(100, { message: ValidationMessages.MAX_LENGTH(100) })
  firstName: string;

  @ApiProperty({ example: 'string', maxLength: 100 })
  @IsString()
  @MinLength(1, { message: ValidationMessages.REQUIRED })
  @MaxLength(100, { message: ValidationMessages.MAX_LENGTH(100) })
  lastName: string;

  @ApiProperty({ example: 'user@example.com' })
  @IsEmail({}, { message: 'Etibarsız email formatı' })
  @MaxLength(255, { message: ValidationMessages.MAX_LENGTH(255) })
  email: string;

  @ApiProperty({ example: 'string', maxLength: 50 })
  @IsString()
  @MaxLength(50, { message: ValidationMessages.MAX_LENGTH(50) })
  phoneNumber: string;

  @ApiProperty({ example: 'string', maxLength: ValidationLengths.DESCRIPTION })
  @IsString()
  @MinLength(1, { message: ValidationMessages.REQUIRED })
  @MaxLength(ValidationLengths.DESCRIPTION, { message: ValidationMessages.MAX_LENGTH(ValidationLengths.DESCRIPTION) })
  message: string;
}
