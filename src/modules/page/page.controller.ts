import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ApiResponses } from '../../_common/swagger';
import { Public } from '../../_common/decorators/public.decorator';
import { RequestWithUser } from '../../_common/interfaces';
import { Roles } from '../../_common/decorators/roles.decorator';
import { RolesGuard } from '../../_common/guards/roles.guard';
import { UserRole } from '../../_common/enums/role.enum';
import { JwtAuthGuard } from '../auth/jwt';
import { PageService } from './page.service';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';

@ApiTags('Page')
@Controller('pages')
export class PageController {
  constructor(private readonly pageService: PageService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Səhifə yarat' })
  @ApiBody({ type: CreatePageDto })
  @ApiResponse(ApiResponses.created('Page'))
  @ApiResponse(ApiResponses.validationFailed())
  @ApiResponse(ApiResponses.conflictTitleSlug())
  async create(@Body() dto: CreatePageDto, @Req() req: RequestWithUser) {
    return this.pageService.create(dto, req.user?.username);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Aktiv səhifələr' })
  @ApiQuery({ name: 'allLanguages', required: false, type: Boolean, description: 'Admin: bütün səhifələr (siyahı)' })
  @ApiResponse(ApiResponses.list('Page'))
  async findAll(@Query('allLanguages') allLanguages?: string) {
    if (allLanguages === 'true') {
      return this.pageService.findAllForAdmin();
    }
    return this.pageService.findAll();
  }

  @Get('by-id/:id')
  @Public()
  @ApiOperation({ summary: 'Səhifə ID ilə' })
  @ApiQuery({ name: 'allLanguages', required: false, type: Boolean })
  @ApiResponse(ApiResponses.one('Page'))
  @ApiResponse(ApiResponses.notFound('Page'))
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Query('allLanguages') allLanguages?: string,
  ) {
    if (allLanguages === 'true') {
      return this.pageService.findOneForAdmin(id);
    }
    return this.pageService.findOne(id);
  }

  @Put('by-id/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Səhifə yenilə' })
  @ApiBody({ type: UpdatePageDto })
  @ApiResponse(ApiResponses.updated('Page'))
  @ApiResponse(ApiResponses.notFound('Page'))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePageDto,
    @Req() req: RequestWithUser,
  ) {
    return this.pageService.update(id, dto, req.user?.username);
  }

  @Delete('by-id/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Səhifəni soft sil' })
  @ApiResponse(ApiResponses.deleted('Page'))
  @ApiResponse(ApiResponses.notFound('Page'))
  async remove(@Param('id', ParseIntPipe) id: number, @Req() req: RequestWithUser) {
    return this.pageService.remove(id, req.user?.username);
  }
}
