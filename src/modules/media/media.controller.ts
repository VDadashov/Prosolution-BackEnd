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
  UseFilters,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ApiTags, ApiOperation, ApiBody, ApiResponse, ApiConsumes, ApiBearerAuth } from '@nestjs/swagger';
import { ApiResponses } from '../../_common/swagger';
import { RequestWithUser } from '../../_common/interfaces';
import { Roles } from '../../_common/decorators/roles.decorator';
import { RolesGuard } from '../../_common/guards/roles.guard';
import { UserRole } from '../../_common/enums/role.enum';
import {
  imageFileFilter,
  videoFileFilter,
  pdfFileFilter,
  imageMaxSize,
  videoMaxSize,
  pdfMaxSize,
} from '../../_common/utils/file-validation.util';
import { MulterExceptionFilter } from '../../_common/filters/multer-exception.filter';
import { MediaService } from './media.service';
import { CreateMediaDto } from './dto/create-media.dto';
import { UpdateMediaDto } from './dto/update-media.dto';
import { UploadImageDto, UploadVideoDto, UploadPdfDto } from './dto/upload-file.dto';
import { GetMediaQueryDto } from './dto/get-media-query.dto';
import { GetMediaFilteredQueryDto } from './dto/get-media-filtered-query.dto';
import { MulterFile } from '../../_common/types/multer.types';
import { BusinessException } from '../../_common/exceptions';
import { ErrorCode } from '../../_common/constants/error-codes';
import { JwtAuthGuard } from '../auth/jwt';
import { MediaType } from '../../_common/enums/media-type.enum';

@ApiTags('Media')
@Controller('media')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Media yarat (path/publicId ilə — upload endpoint-ləri əvəzinə)' })
  @ApiBody({ type: CreateMediaDto })
  @ApiResponse(ApiResponses.created('Media'))
  @ApiResponse(ApiResponses.validationFailed())
  async create(@Body() body: CreateMediaDto, @Req() req: RequestWithUser) {
    return this.mediaService.create(body, req.user?.username);
  }

  @Post('upload/image')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Şəkil yüklə (Cloudinary) — Media qeydi avtomatik yaranır' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadImageDto })
  @ApiResponse(ApiResponses.created('Media'))
  @ApiResponse(ApiResponses.validationFailed())
  @ApiResponse(ApiResponses.unprocessable('Fayl göndərilməyib və ya yükləmə uğursuz'))
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      fileFilter: imageFileFilter,
      limits: { fileSize: imageMaxSize },
    }),
  )
  @UseFilters(MulterExceptionFilter)
  async uploadImage(
    @UploadedFile() file: MulterFile | undefined,
    @Body('altText') altText: string | undefined,
    @Req() req: RequestWithUser,
  ) {
    if (!file) throw new BusinessException(ErrorCode.MEDIA_FILE_REQUIRED);
    return this.mediaService.uploadFile(file, 'images', MediaType.IMAGE, altText, req.user?.username);
  }

  @Post('upload/video')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Video yüklə (Cloudinary)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadVideoDto })
  @ApiResponse(ApiResponses.created('Media'))
  @ApiResponse(ApiResponses.validationFailed())
  @ApiResponse(ApiResponses.unprocessable('Fayl göndərilməyib və ya yükləmə uğursuz'))
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      fileFilter: videoFileFilter,
      limits: { fileSize: videoMaxSize },
    }),
  )
  @UseFilters(MulterExceptionFilter)
  async uploadVideo(
    @UploadedFile() file: MulterFile | undefined,
    @Body('altText') altText: string | undefined,
    @Req() req: RequestWithUser,
  ) {
    if (!file) throw new BusinessException(ErrorCode.MEDIA_FILE_REQUIRED);
    return this.mediaService.uploadFile(file, 'videos', MediaType.VIDEO, altText, req.user?.username);
  }

  @Post('upload/pdf')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'PDF yüklə (Cloudinary)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadPdfDto })
  @ApiResponse(ApiResponses.created('Media'))
  @ApiResponse(ApiResponses.validationFailed())
  @ApiResponse(ApiResponses.unprocessable('Fayl göndərilməyib və ya yükləmə uğursuz'))
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      fileFilter: pdfFileFilter,
      limits: { fileSize: pdfMaxSize },
    }),
  )
  @UseFilters(MulterExceptionFilter)
  async uploadPdf(
    @UploadedFile() file: MulterFile | undefined,
    @Body('altText') altText: string | undefined,
    @Req() req: RequestWithUser,
  ) {
    if (!file) throw new BusinessException(ErrorCode.MEDIA_FILE_REQUIRED);
    return this.mediaService.uploadFile(file, 'pdfs', MediaType.PDF, altText, req.user?.username);
  }

  @Get()
  @ApiOperation({ summary: 'Bütün media – yalnız search, isDeleted, type (pagination yox)' })
  @ApiResponse(ApiResponses.list('Media'))
  @ApiResponse(ApiResponses.validationFailed())
  async getAll(@Query() query: GetMediaQueryDto) {
    return this.mediaService.getAll({
      search: query.search,
      isDeleted: query.isDeleted,
      type: query.type,
    });
  }

  @Get('filtered')
  @ApiOperation({ summary: 'Media filtered – pagination, isDeleted, search, type, sort (a-z | z-a | createdAt)' })
  @ApiResponse(ApiResponses.paginated('Media'))
  @ApiResponse(ApiResponses.validationFailed())
  async getFiltered(@Query() query: GetMediaFilteredQueryDto) {
    return this.mediaService.getFiltered({
      page: query.page,
      limit: query.limit,
      search: query.search,
      isDeleted: query.isDeleted,
      type: query.type,
      sort: query.sort,
    });
  }

  @Get('by-id/:id')
  @ApiOperation({ summary: 'Media ID ilə' })
  @ApiResponse(ApiResponses.one('Media'))
  @ApiResponse(ApiResponses.notFound('Media'))
  async getById(@Param('id', ParseIntPipe) id: number) {
    return this.mediaService.getById(id);
  }

  @Put('by-id/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Media yenilə' })
  @ApiBody({ type: UpdateMediaDto })
  @ApiResponse(ApiResponses.updated('Media'))
  @ApiResponse(ApiResponses.validationFailed())
  @ApiResponse(ApiResponses.notFound('Media'))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateMediaDto,
    @Req() req: RequestWithUser,
  ) {
    return this.mediaService.update(id, body, req.user?.username);
  }

  @Delete('by-id/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Media məntiqi sil (soft delete)' })
  @ApiResponse(ApiResponses.deleted('Media'))
  @ApiResponse(ApiResponses.notFound('Media'))
  async remove(@Param('id', ParseIntPipe) id: number, @Req() req: RequestWithUser) {
    return this.mediaService.remove(id, req.user?.username);
  }
}
