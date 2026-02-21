import { Controller, Post, Patch, Get, Body, Query, Param, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ApiTags, ApiOperation, ApiBody, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ApiResponses } from '../../_common/swagger';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { GetUsersQueryDto } from './dto/get-users-query.dto';
import { JwtAuthGuard } from './jwt';
import { UnauthorizedException } from '../../_common/exceptions';
import { ErrorCode } from '../../_common/constants/error-codes';
import { Public } from '../../_common/decorators/public.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register new user' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse(ApiResponses.created('User'))
  @ApiResponse(ApiResponses.validationFailed())
  async register(@Body() body: RegisterDto) {
    return this.authService.register(body.email);
  }

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  @ApiBody({ type: LoginDto })
  @ApiResponse(ApiResponses.one('Token'))
  @ApiResponse(ApiResponses.validationFailed())
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Public()
  @Post('forgot-password')
  @ApiOperation({ summary: 'Request password reset link by email' })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiResponse(ApiResponses.one('Message'))
  @ApiResponse(ApiResponses.validationFailed())
  async forgotPassword(@Body() body: ForgotPasswordDto) {
    return this.authService.forgotPassword(body.email);
  }

  @Public()
  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password with token from email' })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse(ApiResponses.one('Message'))
  @ApiResponse(ApiResponses.validationFailed())
  @ApiResponse({ status: 401, description: 'Invalid or expired token' })
  async resetPassword(@Body() body: ResetPasswordDto) {
    return this.authService.resetPassword(body.token, body.newPassword);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @Get('profile')
  @ApiOperation({ summary: 'Cari istifadəçi profili – header-dakı JWT token əsasında' })
  @ApiResponse({
    status: 200,
    description: 'Profile',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number' },
        username: { type: 'string' },
        email: { type: 'string' },
        role: { type: 'string', example: 'admin' },
        lastLogin: { type: 'string', format: 'date-time', nullable: true },
      },
    },
  })
  @ApiResponse(ApiResponses.unauthorized())
  async getProfile(@Request() req: { user: { userId: number } }) {
    const userId = req.user?.userId;
    if (!userId) throw new UnauthorizedException(ErrorCode.AUTH_TOKEN_INVALID);
    return this.authService.getProfile(userId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @Get('users')
  @ApiOperation({ summary: 'Get all users (paginated, filter by role and search)' })
  @ApiResponse(ApiResponses.paginated('User'))
  @ApiResponse(ApiResponses.validationFailed())
  async getAllUsers(@Query() query: GetUsersQueryDto) {
    return this.authService.getAll({
      page: query.page,
      limit: query.limit,
      role: query.role,
      search: query.search,
    });
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @Get('users/by-username/:username')
  @ApiOperation({ summary: 'Get user by username' })
  @ApiResponse(ApiResponses.one('User'))
  @ApiResponse({ status: 404, description: 'User not found' })
  async getByUsername(@Param('username') username: string) {
    return this.authService.getByUsername(username);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @Get('users/by-id/:id')
  @ApiOperation({ summary: 'Get user by id' })
  @ApiResponse(ApiResponses.one('User'))
  @ApiResponse(ApiResponses.notFound('User'))
  async getById(@Param('id', ParseIntPipe) id: number) {
    return this.authService.getById(id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @Patch('profile')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiBody({ type: UpdateProfileDto })
  @ApiResponse(ApiResponses.updated('User'))
  @ApiResponse(ApiResponses.validationFailed())
  @ApiResponse({ status: 409, description: 'Username already taken' })
  async updateProfile(
    @Body() body: UpdateProfileDto,
    @Request() req: { user: { userId: number } },
  ) {
    const userId = req.user?.userId;
    if (!userId) throw new UnauthorizedException(ErrorCode.AUTH_TOKEN_INVALID);
    return this.authService.updateProfile(userId, body);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @Patch('change-password')
  @ApiOperation({ summary: 'Change user password' })
  @ApiBody({ type: ChangePasswordDto })
  @ApiResponse(ApiResponses.updated('Password'))
  @ApiResponse(ApiResponses.validationFailed())
  async changePassword(
    @Body() body: ChangePasswordDto,
    @Request() req: { user: { userId: number } },
  ) {
    const userId = req.user?.userId;
    if (!userId) throw new UnauthorizedException(ErrorCode.AUTH_TOKEN_INVALID);
    return this.authService.changePassword(userId, body);
  }
}
