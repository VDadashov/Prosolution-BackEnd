import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v2 as cloudinary } from 'cloudinary';
import { configureCloudinary } from '../../config/cloudinary.config';
import { Media } from './entities/media.entity';
import { BusinessException, NotFoundException } from '../../_common/exceptions';
import { ErrorCode } from '../../_common/constants/error-codes';
import { CreateMediaDto } from './dto/create-media.dto';
import { UpdateMediaDto } from './dto/update-media.dto';
import { MediaType } from '../../_common/enums/media-type.enum';
import { normalizePagination, toPaginatedResult } from '../../_common/utils/pagination.util';
import { MulterFile } from '../../_common/types/multer.types';

export type UploadFolder = 'images' | 'pdfs' | 'videos';

@Injectable()
export class MediaService {
  private cloudinaryInstance: typeof cloudinary;

  constructor(
    @InjectRepository(Media)
    private readonly mediaRepository: Repository<Media>,
    private readonly configService: ConfigService,
  ) {
    this.cloudinaryInstance = configureCloudinary(this.configService);
  }

  async create(dto: CreateMediaDto, username?: string) {
    const media = this.mediaRepository.create({
      type: dto.type,
      path: dto.path.trim(),
      filename: dto.filename.trim(),
      publicId: dto.publicId?.trim() || null,
      mimeType: dto.mimeType?.trim() || null,
      altText: dto.altText?.trim() || null,
      size: dto.size ?? null,
      createdBy: username ?? null,
    });
    await this.mediaRepository.save(media);
    return media;
  }

  /**
   * Faylı Cloudinary-ə yükləyir və Media qeydi yaradır.
   */
  async uploadFile(
    file: MulterFile,
    folder: UploadFolder,
    type: MediaType,
    altText?: string,
    username?: string,
  ): Promise<Media> {
    let result: { secure_url: string; public_id: string };
    try {
      result = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
        const uploadOptions: Record<string, unknown> = {
          folder: `prosolution/${folder}`,
          resource_type: folder === 'videos' ? 'video' : 'auto',
          public_id: `${Date.now()}-${Math.round(Math.random() * 1e9)}`,
        };
        const uploadStream = this.cloudinaryInstance.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            if (error) reject(error);
            else if (!result) reject(new Error('Upload failed: No result returned'));
            else resolve({ secure_url: result.secure_url, public_id: result.public_id });
          },
        );
        uploadStream.end(file.buffer);
      });
    } catch (err) {
      const raw = err as { message?: string; error?: { message?: string } };
      const message =
        raw?.message ||
        raw?.error?.message ||
        (err instanceof Error ? err.message : undefined) ||
        'Cloudinary xətası';
      if (process.env.NODE_ENV !== 'production') {
        console.error('[MediaService] Cloudinary upload error:', err);
      }
      throw new BusinessException(ErrorCode.MEDIA_UPLOAD_FAILED, message);
    }

    const media = this.mediaRepository.create({
      type,
      path: result.secure_url,
      filename: file.originalname || result.public_id.split('/').pop() || 'file',
      publicId: result.public_id,
      mimeType: file.mimetype || null,
      altText: altText?.trim() || file.originalname || null,
      size: file.size ?? null,
      createdBy: username ?? null,
    });
    await this.mediaRepository.save(media);
    return media;
  }

  /** Bütün media – yalnız search, isDeleted, type. Pagination yox, array qaytarır. */
  async getAll(params: { search?: string; isDeleted?: boolean; type?: MediaType }) {
    const qb = this.mediaRepository.createQueryBuilder('media');

    if (params.isDeleted === true) {
      qb.andWhere('media.is_deleted = :isDeleted', { isDeleted: true });
    } else if (params.isDeleted === false) {
      qb.andWhere('media.is_deleted = :isDeleted', { isDeleted: false });
    }
    if (params.type != null) {
      qb.andWhere('media.type = :type', { type: params.type });
    }
    if (params.search?.trim()) {
      const search = `%${params.search.trim()}%`;
      qb.andWhere(
        '(media.filename ILIKE :search OR media.path ILIKE :search OR media.alt_text ILIKE :search)',
        { search },
      );
    }

    qb.orderBy('media.createdAt', 'DESC').addOrderBy('media.id', 'ASC');
    return qb.getMany();
  }

  /** Səhifələnmiş siyahı – pagination, isDeleted, search, type, sort (a-z | z-a | createdAt). */
  async getFiltered(params: {
    page?: number;
    limit?: number;
    search?: string;
    isDeleted?: boolean;
    type?: MediaType;
    sort?: 'a-z' | 'z-a' | 'createdAt';
  }) {
    const { page, limit } = normalizePagination(params);

    const qb = this.mediaRepository.createQueryBuilder('media');

    if (params.isDeleted === true) {
      qb.andWhere('media.is_deleted = :isDeleted', { isDeleted: true });
    } else if (params.isDeleted === false) {
      qb.andWhere('media.is_deleted = :isDeleted', { isDeleted: false });
    }
    if (params.type != null) {
      qb.andWhere('media.type = :type', { type: params.type });
    }
    if (params.search?.trim()) {
      const search = `%${params.search.trim()}%`;
      qb.andWhere(
        '(media.filename ILIKE :search OR media.path ILIKE :search OR media.alt_text ILIKE :search)',
        { search },
      );
    }

    const sort = params.sort ?? 'createdAt';
    if (sort === 'a-z') {
      qb.orderBy('media.filename', 'ASC').addOrderBy('media.id', 'ASC');
    } else if (sort === 'z-a') {
      qb.orderBy('media.filename', 'DESC').addOrderBy('media.id', 'ASC');
    } else {
      qb.orderBy('media.createdAt', 'DESC').addOrderBy('media.id', 'ASC');
    }

    const total = await qb.getCount();
    const data = await qb.skip((page - 1) * limit).take(limit).getMany();
    return toPaginatedResult(data, total, page, limit);
  }

  async getById(id: number) {
    const media = await this.mediaRepository.findOne({
      where: { id, isDeleted: false },
    });
    if (!media) throw new NotFoundException(ErrorCode.MEDIA_NOT_FOUND);
    return media;
  }

  async update(id: number, dto: UpdateMediaDto, username?: string) {
    const media = await this.mediaRepository.findOne({
      where: { id, isDeleted: false },
    });
    if (!media) throw new NotFoundException(ErrorCode.MEDIA_NOT_FOUND);
    if (dto.type !== undefined) media.type = dto.type;
    if (dto.path !== undefined) media.path = dto.path.trim();
    if (dto.filename !== undefined) media.filename = dto.filename.trim();
    if (dto.publicId !== undefined) media.publicId = dto.publicId?.trim() || null;
    if (dto.mimeType !== undefined) media.mimeType = dto.mimeType?.trim() || null;
    if (dto.altText !== undefined) media.altText = dto.altText?.trim() || null;
    if (dto.size !== undefined) media.size = dto.size ?? null;
    if (username != null) media.updatedBy = username;
    media.updatedAt = new Date();
    await this.mediaRepository.save(media);
    return media;
  }

  async remove(id: number, username?: string) {
    const media = await this.mediaRepository.findOne({
      where: { id, isDeleted: false },
    });
    if (!media) throw new NotFoundException(ErrorCode.MEDIA_NOT_FOUND);
    if (media.publicId) {
      const resourceType = media.type === MediaType.VIDEO ? 'video' : media.type === MediaType.PDF ? 'raw' : 'image';
      try {
        await this.cloudinaryInstance.uploader.destroy(media.publicId, { resource_type: resourceType });
      } catch {
        // Cloudinary-dan silinmədi; yine də DB-də soft delete edirik
      }
    }
    media.isDeleted = true;
    if (username != null) media.updatedBy = username;
    media.updatedAt = new Date();
    await this.mediaRepository.save(media);
    return { message: 'Media silindi' };
  }
}
