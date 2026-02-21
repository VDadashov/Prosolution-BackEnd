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
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AssignFeatureOptionsDto } from './dto/assign-feature-options.dto';
import { GetProductsQueryDto } from './dto/get-products-query.dto';
import { GetProductsFilteredQueryDto } from './dto/get-products-filtered-query.dto';
import { JwtAuthGuard } from '../auth/jwt';

@ApiTags('Product')
@Controller('products')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create product' })
  @ApiBody({ type: CreateProductDto })
  @ApiResponse(ApiResponses.created('Product'))
  @ApiResponse(ApiResponses.validationFailed())
  @ApiResponse(ApiResponses.unprocessable('Category does not allow products'))
  async create(@Body() body: CreateProductDto, @Req() req: RequestWithUser) {
    return this.productService.create(body, req.user?.username);
  }

  @Get()
  @ApiOperation({ summary: 'Get all products – yalnız search, isDeleted (pagination yox)' })
  @ApiResponse(ApiResponses.list('Product'))
  @ApiResponse(ApiResponses.validationFailed())
  async getAll(@Query() query: GetProductsQueryDto) {
    return this.productService.getAll({
      search: query.search,
      isDeleted: query.isDeleted,
    });
  }

  @Get('filtered')
  @ApiOperation({
    summary: 'Get products filtered – pagination, search, isDeleted, isActive, categorySlug, featureOptionIds, minPrice, maxPrice, brandId, inStock, sort',
  })
  @ApiResponse(ApiResponses.paginated('Product'))
  @ApiResponse(ApiResponses.validationFailed())
  async getFiltered(@Query() query: GetProductsFilteredQueryDto) {
    return this.productService.getFiltered({
      page: query.page,
      limit: query.limit,
      search: query.search,
      isDeleted: query.isDeleted,
      isActive: query.isActive,
      categorySlug: query.categorySlug,
      featureOptionIds: query.featureOptionIds,
      minPrice: query.minPrice,
      maxPrice: query.maxPrice,
      brandId: query.brandId,
      inStock: query.inStock,
      sort: query.sort,
    });
  }

  @Get('by-id/:id')
  @ApiOperation({ summary: 'Get product by id' })
  @ApiResponse(ApiResponses.one('Product'))
  @ApiResponse(ApiResponses.notFound('Product'))
  async getById(@Param('id', ParseIntPipe) id: number) {
    return this.productService.getById(id);
  }

  @Put('by-id/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update product' })
  @ApiBody({ type: UpdateProductDto })
  @ApiResponse(ApiResponses.updated('Product'))
  @ApiResponse(ApiResponses.validationFailed())
  @ApiResponse(ApiResponses.notFound('Product'))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateProductDto,
    @Req() req: RequestWithUser,
  ) {
    return this.productService.update(id, body, req.user?.username);
  }

  @Delete('by-id/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Soft delete product' })
  @ApiResponse(ApiResponses.deleted('Product'))
  @ApiResponse(ApiResponses.notFound('Product'))
  async remove(@Param('id', ParseIntPipe) id: number, @Req() req: RequestWithUser) {
    return this.productService.remove(id, req.user?.username);
  }

  @Get('by-id/:id/feature-options')
  @ApiOperation({ summary: 'Məhsula təyin olunmuş feature option-ları gətir (option + aid olduğu feature)' })
  @ApiResponse(ApiResponses.list('ProductFeatureOption'))
  @ApiResponse(ApiResponses.notFound('Product'))
  async getFeatureOptionsByProductId(@Param('id', ParseIntPipe) id: number) {
    return this.productService.getFeatureOptionsByProductId(id);
  }

  @Put('by-id/:id/feature-options')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Məhsula feature option id-ləri təyin et (body: featureOptionIds — əvvəlki siyahı əvəz olunur)' })
  @ApiBody({ type: AssignFeatureOptionsDto })
  @ApiResponse(ApiResponses.one('AssignedFeatureOptions'))
  @ApiResponse(ApiResponses.validationFailed())
  @ApiResponse(ApiResponses.notFound('Product'))
  async assignFeatureOptions(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: AssignFeatureOptionsDto,
  ) {
    return this.productService.assignFeatureOptions(id, body.featureOptionIds);
  }
}
