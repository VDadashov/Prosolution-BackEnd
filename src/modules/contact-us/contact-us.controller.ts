import { Controller, Post, Get, Patch, Delete, Body, Query, Param, ParseIntPipe, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ApiResponses } from '../../_common/swagger';
import { Roles } from '../../_common/decorators/roles.decorator';
import { RolesGuard } from '../../_common/guards/roles.guard';
import { UserRole } from '../../_common/enums/role.enum';
import { JwtAuthGuard } from '../auth/jwt';
import { ContactUsService } from './contact-us.service';
import { CreateContactUsDto } from './dto/create-contact-us.dto';
import { GetContactUsQueryDto } from './dto/get-contact-us-query.dto';
import { GetContactUsFilteredQueryDto } from './dto/get-contact-us-filtered-query.dto';
import { RequestWithUser } from '../../_common/interfaces';

@ApiTags('ContactUs')
@Controller('contact-us')
export class ContactUsController {
  constructor(private readonly contactUsService: ContactUsService) {}

  @Post()
  @ApiOperation({ summary: 'Əlaqə formu göndər (public, auth tələb olunmur)' })
  @ApiBody({ type: CreateContactUsDto })
  @ApiResponse(ApiResponses.created('ContactUs'))
  @ApiResponse(ApiResponses.validationFailed())
  async create(@Body() body: CreateContactUsDto) {
    return this.contactUsService.create(body);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Bütün əlaqə mesajları – yalnız search, isDeleted (pagination yox)' })
  @ApiResponse(ApiResponses.list('ContactUs'))
  @ApiResponse(ApiResponses.validationFailed())
  async getAll(@Query() query: GetContactUsQueryDto) {
    return this.contactUsService.getAll({
      search: query.search,
      isDeleted: query.isDeleted,
    });
  }

  @Get('filtered')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Əlaqə mesajları səhifələnmiş – pagination, search, isDeleted, sort' })
  @ApiResponse(ApiResponses.paginated('ContactUs'))
  @ApiResponse(ApiResponses.validationFailed())
  async getFiltered(@Query() query: GetContactUsFilteredQueryDto) {
    return this.contactUsService.getFiltered({
      page: query.page,
      limit: query.limit,
      search: query.search,
      isDeleted: query.isDeleted,
      sort: query.sort,
    });
  }

  @Get('unread-count')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Oxunmamış əlaqə mesajlarının sayı' })
  @ApiResponse({
    status: 200,
    description: 'Oxunmamış sayı',
    schema: { type: 'object', properties: { count: { type: 'number' } } },
  })
  async getUnreadCount() {
    const count = await this.contactUsService.getUnreadCount();
    return { count };
  }

  @Get('by-id/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Əlaqə mesajı id ilə' })
  @ApiResponse(ApiResponses.one('ContactUs'))
  @ApiResponse(ApiResponses.notFound('ContactUs'))
  async getById(@Param('id', ParseIntPipe) id: number) {
    return this.contactUsService.getById(id);
  }

  @Patch('by-id/:id/read')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Əlaqə mesajını oxunmuş kimi işarələ (contact id göndərin)' })
  @ApiResponse(ApiResponses.one('ContactUs'))
  @ApiResponse(ApiResponses.notFound('ContactUs'))
  async markAsRead(@Param('id', ParseIntPipe) id: number) {
    return this.contactUsService.markAsRead(id);
  }

  @Delete('by-id/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Soft delete – isDeleted = true (DB-də qalır)' })
  @ApiResponse(ApiResponses.deleted('ContactUs'))
  @ApiResponse(ApiResponses.notFound('ContactUs'))
  async remove(@Param('id', ParseIntPipe) id: number, @Req() req: RequestWithUser) {
    return this.contactUsService.remove(id, req.user?.username);
  }
}
