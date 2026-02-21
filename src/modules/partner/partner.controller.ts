import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Query,
  Param,
  ParseIntPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ApiResponses } from '../../_common/swagger';
import { RequestWithUser } from '../../_common/interfaces';
import { Roles } from '../../_common/decorators/roles.decorator';
import { RolesGuard } from '../../_common/guards/roles.guard';
import { UserRole } from '../../_common/enums/role.enum';
import { PartnerService } from './partner.service';
import { CreatePartnerDto } from './dto/create-partner.dto';
import { UpdatePartnerDto } from './dto/update-partner.dto';
import { GetPartnersQueryDto } from './dto/get-partners-query.dto';
import { GetPartnersFilteredQueryDto } from './dto/get-partners-filtered-query.dto';
import { JwtAuthGuard } from '../auth/jwt';

@ApiTags('Partner')
@Controller('partners')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT')
export class PartnerController {
  constructor(private readonly partnerService: PartnerService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Tərəfdaş yarat (title, description, mediaId – şəkil Media id ilə)' })
  @ApiBody({ type: CreatePartnerDto })
  @ApiResponse(ApiResponses.created('Partner'))
  @ApiResponse(ApiResponses.validationFailed())
  @ApiResponse(ApiResponses.conflictTitleSlug())
  @ApiResponse(ApiResponses.mediaNotFound())
  async create(@Body() body: CreatePartnerDto, @Req() req: RequestWithUser) {
    const username = req.user?.username;
    return this.partnerService.create(body, username);
  }

  @Get()
  @ApiOperation({ summary: 'Get all partners – yalnız search, isDeleted (pagination yox)' })
  @ApiResponse(ApiResponses.list('Partner'))
  @ApiResponse(ApiResponses.validationFailed())
  async getAll(@Query() query: GetPartnersQueryDto) {
    return this.partnerService.getAll({
      search: query.search,
      isDeleted: query.isDeleted,
    });
  }

  @Get('filtered')
  @ApiOperation({ summary: 'Get partners filtered – pagination, isDeleted, search, sort (a-z | z-a | createdAt)' })
  @ApiResponse(ApiResponses.paginated('Partner'))
  @ApiResponse(ApiResponses.validationFailed())
  async getFiltered(@Query() query: GetPartnersFilteredQueryDto) {
    return this.partnerService.getFiltered({
      page: query.page,
      limit: query.limit,
      search: query.search,
      isDeleted: query.isDeleted,
      sort: query.sort,
    });
  }

  @Get('by-id/:id')
  @ApiOperation({ summary: 'Get partner by id' })
  @ApiResponse(ApiResponses.one('Partner'))
  @ApiResponse(ApiResponses.notFound('Partner'))
  async getById(@Param('id', ParseIntPipe) id: number) {
    return this.partnerService.getById(id);
  }

  @Put('by-id/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update partner' })
  @ApiBody({ type: UpdatePartnerDto })
  @ApiResponse(ApiResponses.updated('Partner'))
  @ApiResponse(ApiResponses.validationFailed())
  @ApiResponse(ApiResponses.notFoundOrMediaNotFound('Partner'))
  @ApiResponse(ApiResponses.conflictTitleSlug())
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdatePartnerDto,
    @Req() req: RequestWithUser,
  ) {
    const username = req.user?.username;
    return this.partnerService.update(id, body, username);
  }

  @Delete('by-id/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Soft delete partner' })
  @ApiResponse(ApiResponses.deleted('Partner'))
  @ApiResponse(ApiResponses.notFound('Partner'))
  async remove(@Param('id', ParseIntPipe) id: number, @Req() req: RequestWithUser) {
    const username = req.user?.username;
    return this.partnerService.remove(id, username);
  }
}
