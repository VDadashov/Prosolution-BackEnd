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
import { SliderService } from './slider.service';
import { CreateSliderDto } from './dto/create-slider.dto';
import { UpdateSliderDto } from './dto/update-slider.dto';
import { GetSlidersQueryDto } from './dto/get-sliders-query.dto';
import { GetSlidersFilteredQueryDto } from './dto/get-sliders-filtered-query.dto';
import { JwtAuthGuard } from '../auth/jwt';

@ApiTags('Slider')
@Controller('sliders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT')
export class SliderController {
  constructor(private readonly sliderService: SliderService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Slayder yarat (title, description, order, mediaId – şəkil Media id ilə)' })
  @ApiBody({ type: CreateSliderDto })
  @ApiResponse(ApiResponses.created('Slider'))
  @ApiResponse(ApiResponses.validationFailed())
  @ApiResponse(ApiResponses.conflictTitleSlug())
  @ApiResponse(ApiResponses.mediaNotFound())
  async create(@Body() body: CreateSliderDto, @Req() req: RequestWithUser) {
    const username = req.user?.username;
    return this.sliderService.create(body, username);
  }

  @Get()
  @ApiOperation({ summary: 'Get all sliders – yalnız search, isDeleted (pagination yox)' })
  @ApiResponse(ApiResponses.list('Slider'))
  @ApiResponse(ApiResponses.validationFailed())
  async getAll(@Query() query: GetSlidersQueryDto) {
    return this.sliderService.getAll({
      search: query.search,
      isDeleted: query.isDeleted,
    });
  }

  @Get('filtered')
  @ApiOperation({ summary: 'Get sliders filtered – pagination, isDeleted, search, sort (a-z | z-a | order | createdAt)' })
  @ApiResponse(ApiResponses.paginated('Slider'))
  @ApiResponse(ApiResponses.validationFailed())
  async getFiltered(@Query() query: GetSlidersFilteredQueryDto) {
    return this.sliderService.getFiltered({
      page: query.page,
      limit: query.limit,
      search: query.search,
      isDeleted: query.isDeleted,
      sort: query.sort,
    });
  }

  @Get('by-id/:id')
  @ApiOperation({ summary: 'Get slider by id' })
  @ApiResponse(ApiResponses.one('Slider'))
  @ApiResponse(ApiResponses.notFound('Slider'))
  async getById(@Param('id', ParseIntPipe) id: number) {
    return this.sliderService.getById(id);
  }

  @Put('by-id/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update slider' })
  @ApiBody({ type: UpdateSliderDto })
  @ApiResponse(ApiResponses.updated('Slider'))
  @ApiResponse(ApiResponses.validationFailed())
  @ApiResponse(ApiResponses.notFoundOrMediaNotFound('Slider'))
  @ApiResponse(ApiResponses.conflictTitleSlug())
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateSliderDto,
    @Req() req: RequestWithUser,
  ) {
    const username = req.user?.username;
    return this.sliderService.update(id, body, username);
  }

  @Delete('by-id/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Soft delete slider' })
  @ApiResponse(ApiResponses.deleted('Slider'))
  @ApiResponse(ApiResponses.notFound('Slider'))
  async remove(@Param('id', ParseIntPipe) id: number, @Req() req: RequestWithUser) {
    const username = req.user?.username;
    return this.sliderService.remove(id, username);
  }
}
