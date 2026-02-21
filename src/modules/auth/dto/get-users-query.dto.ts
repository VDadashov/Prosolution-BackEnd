import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, IsEnum } from 'class-validator';
import { UserRole } from '../../../_common/enums/role.enum';
import { PaginationQueryDto } from '../../../_common/dto/pagination-query.dto';

export class GetUsersQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: UserRole, description: 'Filter by role' })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({ description: 'Search in firstName, lastName, username, email' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;
}
