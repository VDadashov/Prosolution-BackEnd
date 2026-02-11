import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ApiTags, ApiOperation, ApiBody, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UnauthorizedException } from '../../_common/exceptions';
import { ErrorCode } from '../../_common/constants/error-codes';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register new user' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: 201, description: 'User registered, credentials sent to email' })
  async register(@Body() body: RegisterDto) {
    return this.authService.register(body.email);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'User logged in' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @Post('change-password')
  @ApiOperation({ summary: 'Change user password' })
  @ApiBody({ type: ChangePasswordDto })
  @ApiResponse({
    status: 200,
    description: 'Password changed successfully',
    schema: { type: 'object', properties: { message: { type: 'string' }, success: { type: 'boolean' } } },
  })
  async changePassword(
    @Body() body: ChangePasswordDto,
    @Request() req: { user: { userId: number } },
  ) {
    const userId = req.user?.userId;
    if (!userId) throw new UnauthorizedException(ErrorCode.AUTH_TOKEN_INVALID);
    return this.authService.changePassword(userId, body);
  }
}
