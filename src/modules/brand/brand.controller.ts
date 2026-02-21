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
import { BrandService } from './brand.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { GetBrandsQueryDto } from './dto/get-brands-query.dto';
import { GetBrandsFilteredQueryDto } from './dto/get-brands-filtered-query.dto';
import { JwtAuthGuard } from '../auth/jwt';

@ApiTags('Brand')
@Controller('brands')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT')
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create brand (title, description, mediaId – şəkil Media id ilə)' })
  @ApiBody({ type: CreateBrandDto })
  @ApiResponse(ApiResponses.created('Brand'))
  @ApiResponse(ApiResponses.validationFailed())
  @ApiResponse(ApiResponses.conflictTitleSlug())
  @ApiResponse(ApiResponses.mediaNotFound())
  async create(@Body() body: CreateBrandDto, @Req() req: RequestWithUser) {
    const username = req.user?.username;
    return this.brandService.create(body, username);
  }

  @Get()
  @ApiOperation({ summary: 'Get all brands – yalnız search, isDeleted (pagination yox)' })
  @ApiResponse(ApiResponses.list('Brand'))
  @ApiResponse(ApiResponses.validationFailed())
  async getAll(@Query() query: GetBrandsQueryDto) {
    return this.brandService.getAll({
      search: query.search,
      isDeleted: query.isDeleted,
    });
  }

  @Get('filtered')
  @ApiOperation({ summary: 'Get brands filtered – pagination, isDeleted, isActive, search, sort (a-z | z-a | createdAt)' })
  @ApiResponse(ApiResponses.paginated('Brand'))
  @ApiResponse(ApiResponses.validationFailed())
  async getFiltered(@Query() query: GetBrandsFilteredQueryDto) {
    return this.brandService.getFiltered({
      page: query.page,
      limit: query.limit,
      search: query.search,
      isDeleted: query.isDeleted,
      isActive: query.isActive,
      sort: query.sort,
    });
  }

  @Get('by-id/:id')
  @ApiOperation({ summary: 'Get brand by id' })
  @ApiResponse(ApiResponses.one('Brand'))
  @ApiResponse(ApiResponses.notFound('Brand'))
  async getById(@Param('id', ParseIntPipe) id: number) {
    return this.brandService.getById(id);
  }

  @Put('by-id/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update brand' })
  @ApiBody({ type: UpdateBrandDto })
  @ApiResponse(ApiResponses.updated('Brand'))
  @ApiResponse(ApiResponses.validationFailed())
  @ApiResponse(ApiResponses.notFoundOrMediaNotFound('Brand'))
  @ApiResponse(ApiResponses.conflictTitleSlug())
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateBrandDto,
    @Req() req: RequestWithUser,
  ) {
    const username = req.user?.username;
    return this.brandService.update(id, body, username);
  }

  @Delete('by-id/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Soft delete brand' })
  @ApiResponse(ApiResponses.deleted('Brand'))
  @ApiResponse(ApiResponses.notFound('Brand'))
  async remove(@Param('id', ParseIntPipe) id: number, @Req() req: RequestWithUser) {
    const username = req.user?.username;
    return this.brandService.remove(id, username);
  }
}
