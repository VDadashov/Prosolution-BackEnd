import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Headers,
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
import { SectionService } from './section.service';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';

@ApiTags('Section')
@Controller('sections')
export class SectionController {
  constructor(private readonly sectionService: SectionService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Section yarat' })
  @ApiBody({ type: CreateSectionDto })
  @ApiResponse(ApiResponses.created('Section'))
  @ApiResponse(ApiResponses.validationFailed())
  @ApiResponse(ApiResponses.notFound('Page'))
  async create(@Body() dto: CreateSectionDto, @Req() req: RequestWithUser) {
    return this.sectionService.create(
      {
        name: dto.name,
        type: dto.type,
        title: dto.title,
        description: dto.description,
        pageId: dto.pageId,
        order: dto.order,
        visibility: dto.visibility,
        isActive: dto.isActive,
        media: dto.media as never,
        additionalData: dto.additionalData ?? null,
      },
      req.user?.username,
    );
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Section-lar (pageId/type filter, accept-language ilə dil)' })
  @ApiQuery({ name: 'pageId', required: false, type: Number })
  @ApiQuery({ name: 'type', required: false, description: 'hero, content, about, ...' })
  @ApiQuery({ name: 'allLanguages', required: false, type: Boolean, description: 'Admin: hamısı raw' })
  @ApiResponse(ApiResponses.list('Section'))
  async findAll(
    @Query('pageId') pageId?: string,
    @Query('type') type?: string,
    @Query('allLanguages') allLanguages?: string,
    @Headers('accept-language') acceptLanguage?: string,
  ) {
    if (allLanguages === 'true') {
      return this.sectionService.findAllForAdmin();
    }
    const lang = acceptLanguage?.slice(0, 2) || 'az';
    return this.sectionService.findAllWithSelectedLanguage(
      pageId ? Number(pageId) : undefined,
      type,
      lang,
    );
  }

  @Get('by-id/:id')
  @Public()
  @ApiOperation({ summary: 'Section ID ilə' })
  @ApiResponse(ApiResponses.one('Section'))
  @ApiResponse(ApiResponses.notFound('Section'))
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.sectionService.findOne(id);
  }

  @Put('by-id/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Section yenilə' })
  @ApiBody({ type: UpdateSectionDto })
  @ApiResponse(ApiResponses.updated('Section'))
  @ApiResponse(ApiResponses.notFound('Section'))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSectionDto,
    @Req() req: RequestWithUser,
  ) {
    return this.sectionService.update(id, dto as never, req.user?.username);
  }

  @Delete('by-id/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Section soft sil' })
  @ApiResponse(ApiResponses.deleted('Section'))
  @ApiResponse(ApiResponses.notFound('Section'))
  async remove(@Param('id', ParseIntPipe) id: number, @Req() req: RequestWithUser) {
    return this.sectionService.remove(id, req.user?.username);
  }
}
