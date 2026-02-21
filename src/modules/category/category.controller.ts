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
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { GetCategoriesQueryDto } from './dto/get-categories-query.dto';
import { GetCategoriesFilteredQueryDto } from './dto/get-categories-filtered-query.dto';
import { GetCategoriesByParentQueryDto } from './dto/get-categories-by-parent-query.dto';
import { JwtAuthGuard } from '../auth/jwt';

@ApiTags('Category')
@Controller('categories')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create category' })
  @ApiBody({ type: CreateCategoryDto })
  @ApiResponse(ApiResponses.created('Category'))
  @ApiResponse(ApiResponses.validationFailed())
  @ApiResponse(ApiResponses.conflictTitleSlug())
  async create(@Body() body: CreateCategoryDto, @Req() req: RequestWithUser) {
    const username = req.user?.username;
    return this.categoryService.create(body, username);
  }

  @Get()
  @ApiOperation({ summary: 'Get all categories – yalnız search, isDeleted (pagination yox)' })
  @ApiResponse(ApiResponses.list('Category'))
  @ApiResponse(ApiResponses.validationFailed())
  async getAll(@Query() query: GetCategoriesQueryDto) {
    return this.categoryService.getAll({
      search: query.search,
      isDeleted: query.isDeleted,
    });
  }

  @Get('filtered')
  @ApiOperation({ summary: 'Get categories filtered – pagination, isDeleted, level, parentId, search, sort (default: level)' })
  @ApiResponse(ApiResponses.paginated('Category'))
  @ApiResponse(ApiResponses.validationFailed())
  async getFiltered(@Query() query: GetCategoriesFilteredQueryDto) {
    return this.categoryService.getFiltered({
      page: query.page,
      limit: query.limit,
      search: query.search,
      isDeleted: query.isDeleted,
      level: query.level,
      parentId: query.parentId,
      sort: query.sort,
    });
  }

  @Get('children/by-parent/:parentId')
  @ApiOperation({ summary: 'Verilən kateqoriyanın uşaq kateqoriyaları – pagination, search, isActive, sort' })
  @ApiResponse(ApiResponses.paginated('Category'))
  @ApiResponse(ApiResponses.notFound('Category'))
  async getChildrenByParentId(
    @Param('parentId', ParseIntPipe) parentId: number,
    @Query() query: GetCategoriesByParentQueryDto,
  ) {
    return this.categoryService.getChildrenByParentId(parentId, {
      page: query.page,
      limit: query.limit,
      search: query.search,
      isActive: query.isActive,
      sort: query.sort,
    });
  }

  @Get('by-slug/:slug')
  @ApiOperation({ summary: 'Get category by slug' })
  @ApiResponse(ApiResponses.one('Category'))
  @ApiResponse(ApiResponses.notFound('Category'))
  async getBySlug(@Param('slug') slug: string) {
    return this.categoryService.getBySlug(slug);
  }

  @Get('by-id/:id')
  @ApiOperation({ summary: 'Get category by id (childrenCount; uşaqlar üçün GET /categories/children/by-parent/:parentId)' })
  @ApiResponse(ApiResponses.one('Category'))
  @ApiResponse(ApiResponses.notFound('Category'))
  async getById(@Param('id', ParseIntPipe) id: number) {
    return this.categoryService.getById(id);
  }

  @Put('by-id/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update category (full replace)' })
  @ApiBody({ type: UpdateCategoryDto })
  @ApiResponse(ApiResponses.updated('Category'))
  @ApiResponse(ApiResponses.validationFailed())
  @ApiResponse(ApiResponses.notFound('Category'))
  @ApiResponse(ApiResponses.conflictTitleSlug())
  @ApiResponse(ApiResponses.unprocessable('Öz alt kateqoriyanı parent seçə bilməzsiniz'))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateCategoryDto,
    @Req() req: RequestWithUser,
  ) {
    const username = req.user?.username;
    return this.categoryService.update(id, body, username);
  }

  @Delete('by-id/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Soft delete category (isDeleted = true, DB-də qalır). Alt kateqoriyası varsa 422.' })
  @ApiResponse(ApiResponses.deleted('Category'))
  @ApiResponse(ApiResponses.notFound('Category'))
  @ApiResponse(ApiResponses.unprocessable('Alt kateqoriyası olan kateqoriya silinə bilməz'))
  async remove(@Param('id', ParseIntPipe) id: number, @Req() req: RequestWithUser) {
    const username = req.user?.username;
    return this.categoryService.remove(id, username);
  }
}
