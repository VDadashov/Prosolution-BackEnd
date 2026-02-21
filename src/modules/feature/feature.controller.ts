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
import { FeatureService } from './feature.service';
import { CreateFeatureDto } from './dto/create-feature.dto';
import { UpdateFeatureDto } from './dto/update-feature.dto';
import { CreateFeatureOptionDto } from './dto/create-feature-option.dto';
import { UpdateFeatureOptionDto } from './dto/update-feature-option.dto';
import { AssignFeaturesToCategoryDto } from './dto/assign-features-to-category.dto';
import { AddFeatureOptionsDto } from './dto/add-feature-options.dto';
import { GetFeaturesQueryDto } from './dto/get-features-query.dto';
import { GetFeaturesFilteredQueryDto } from './dto/get-features-filtered-query.dto';
import { GetFeatureOptionsByFeatureQueryDto } from './dto/get-feature-options-by-feature-query.dto';
import { JwtAuthGuard } from '../auth/jwt';

@ApiTags('Feature')
@Controller('features')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT')
export class FeatureController {
  constructor(private readonly featureService: FeatureService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create feature' })
  @ApiBody({ type: CreateFeatureDto })
  @ApiResponse(ApiResponses.created('Feature'))
  @ApiResponse(ApiResponses.validationFailed())
  @ApiResponse(ApiResponses.conflictTitleSlug())
  async createFeature(@Body() body: CreateFeatureDto, @Req() req: RequestWithUser) {
    return this.featureService.createFeature(body, req.user?.username);
  }

  @Get()
  @ApiOperation({ summary: 'Get all features – yalnız search, isDeleted (pagination yox)' })
  @ApiResponse(ApiResponses.list('Feature'))
  @ApiResponse(ApiResponses.validationFailed())
  async getAllFeatures(@Query() query: GetFeaturesQueryDto) {
    return this.featureService.getAllFeatures({
      search: query.search,
      isDeleted: query.isDeleted,
    });
  }

  @Get('filtered')
  @ApiOperation({ summary: 'Get features filtered – pagination, isDeleted, isActive, search, sort (a-z | z-a | createdAt). Default: sort_order üzrə.' })
  @ApiResponse(ApiResponses.paginated('Feature'))
  @ApiResponse(ApiResponses.validationFailed())
  async getFilteredFeatures(@Query() query: GetFeaturesFilteredQueryDto) {
    return this.featureService.getFilteredFeatures({
      page: query.page,
      limit: query.limit,
      search: query.search,
      isDeleted: query.isDeleted,
      isActive: query.isActive,
      sort: query.sort,
    });
  }

  @Get('by-id/:id')
  @ApiOperation({ summary: 'Get feature by id' })
  @ApiResponse(ApiResponses.one('Feature'))
  @ApiResponse(ApiResponses.notFound('Feature'))
  async getFeatureById(@Param('id', ParseIntPipe) id: number) {
    return this.featureService.getFeatureById(id);
  }

  @Put('by-id/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update feature' })
  @ApiBody({ type: UpdateFeatureDto })
  @ApiResponse(ApiResponses.updated('Feature'))
  @ApiResponse(ApiResponses.validationFailed())
  @ApiResponse(ApiResponses.notFound('Feature'))
  @ApiResponse(ApiResponses.conflictTitleSlug())
  async updateFeature(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateFeatureDto,
    @Req() req: RequestWithUser,
  ) {
    return this.featureService.updateFeature(id, body, req.user?.username);
  }

  @Delete('by-id/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Soft delete feature' })
  @ApiResponse(ApiResponses.deleted('Feature'))
  @ApiResponse(ApiResponses.notFound('Feature'))
  async removeFeature(@Param('id', ParseIntPipe) id: number, @Req() req: RequestWithUser) {
    return this.featureService.removeFeature(id, req.user?.username);
  }

  @Post('options')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create feature option' })
  @ApiBody({ type: CreateFeatureOptionDto })
  @ApiResponse(ApiResponses.created('FeatureOption'))
  @ApiResponse(ApiResponses.validationFailed())
  @ApiResponse(ApiResponses.notFound('Feature'))
  async createFeatureOption(
    @Body() body: CreateFeatureOptionDto,
    @Req() req: RequestWithUser,
  ) {
    return this.featureService.createFeatureOption(body, req.user?.username);
  }

  @Post('by-id/:featureId/options')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Feature-a çoxlu option əlavə et (eyni title varsa atlanır)' })
  @ApiBody({ type: AddFeatureOptionsDto })
  @ApiResponse({ status: 201, description: 'Yaradılan option-lar array', schema: { type: 'array', items: { $ref: '#/components/schemas/FeatureOption' } } })
  @ApiResponse(ApiResponses.validationFailed())
  @ApiResponse(ApiResponses.notFound('Feature'))
  async addOptionsToFeature(
    @Param('featureId', ParseIntPipe) featureId: number,
    @Body() body: AddFeatureOptionsDto,
    @Req() req: RequestWithUser,
  ) {
    return this.featureService.addOptionsToFeature(featureId, body.options, req.user?.username);
  }

  @Get('options/by-feature/:featureId')
  @ApiOperation({ summary: 'Get options by feature id (pagination: page, limit; filter: search, isActive)' })
  @ApiResponse(ApiResponses.paginated('FeatureOption'))
  @ApiResponse(ApiResponses.notFound('Feature'))
  async getOptionsByFeatureId(
    @Param('featureId', ParseIntPipe) featureId: number,
    @Query() query: GetFeatureOptionsByFeatureQueryDto,
  ) {
    return this.featureService.getOptionsByFeatureId(featureId, {
      page: query.page,
      limit: query.limit,
      search: query.search,
      isActive: query.isActive,
    });
  }

  @Get('options/by-id/:id')
  @ApiOperation({ summary: 'Get feature option by id' })
  @ApiResponse(ApiResponses.one('FeatureOption'))
  @ApiResponse(ApiResponses.notFound('FeatureOption'))
  async getFeatureOptionById(@Param('id', ParseIntPipe) id: number) {
    return this.featureService.getFeatureOptionById(id);
  }

  @Put('options/by-id/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update feature option' })
  @ApiBody({ type: UpdateFeatureOptionDto })
  @ApiResponse(ApiResponses.updated('FeatureOption'))
  @ApiResponse(ApiResponses.validationFailed())
  @ApiResponse(ApiResponses.notFound('FeatureOption'))
  async updateFeatureOption(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateFeatureOptionDto,
    @Req() req: RequestWithUser,
  ) {
    return this.featureService.updateFeatureOption(id, body, req.user?.username);
  }

  @Delete('options/by-id/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Soft delete feature option' })
  @ApiResponse(ApiResponses.deleted('FeatureOption'))
  @ApiResponse(ApiResponses.notFound('FeatureOption'))
  async removeFeatureOption(@Param('id', ParseIntPipe) id: number, @Req() req: RequestWithUser) {
    return this.featureService.removeFeatureOption(id, req.user?.username);
  }

  @Get('by-category/:categoryId')
  @ApiOperation({
    summary: 'Kateqoriya üçün feature + option siyahısı (filter paneli üçün). Hər option-da productCount – bu kateqoriyada həmin option-u olan məhsul sayı. Bu option id-lərini GET /products/filtered-də featureOptionIds kimi göndərin.',
  })
  @ApiResponse({
    status: 200,
    description: 'Feature[] – hər birində id, title, slug, order, options: [{ id, featureId, title, slug, order, productCount }]',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number' },
          title: { type: 'string' },
          slug: { type: 'string', nullable: true },
          order: { type: 'number' },
          options: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'number', description: 'GET /products/filtered?featureOptionIds= bu id-ləri göndərin' },
                featureId: { type: 'number' },
                title: { type: 'string' },
                slug: { type: 'string', nullable: true },
                order: { type: 'number' },
                productCount: { type: 'number', description: 'Bu kateqoriyada bu option-u olan məhsul sayı' },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse(ApiResponses.notFound('Category'))
  async getFeaturesByCategoryId(@Param('categoryId', ParseIntPipe) categoryId: number) {
    return this.featureService.getFeaturesByCategoryId(categoryId);
  }

  @Put('by-category/:categoryId/assign')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Assign features to category (əvvəlki siyahı əvəz olunur)' })
  @ApiBody({ type: AssignFeaturesToCategoryDto })
  @ApiResponse(ApiResponses.list('Feature'))
  @ApiResponse(ApiResponses.validationFailed())
  @ApiResponse(ApiResponses.notFound('Category'))
  async assignFeaturesToCategory(
    @Param('categoryId', ParseIntPipe) categoryId: number,
    @Body() body: AssignFeaturesToCategoryDto,
  ) {
    return this.featureService.assignFeaturesToCategory(categoryId, body.featureIds);
  }
}
