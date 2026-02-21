import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Brand } from './entities/brand.entity';
import { Media } from '../media/entities/media.entity';
import { ConflictException, NotFoundException } from '../../_common/exceptions';
import { ErrorCode } from '../../_common/constants/error-codes';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { normalizePagination, toPaginatedResult } from '../../_common/utils/pagination.util';

@Injectable()
export class BrandService {
  constructor(
    @InjectRepository(Brand)
    private readonly brandRepository: Repository<Brand>,
    @InjectRepository(Media)
    private readonly mediaRepository: Repository<Media>,
  ) {}

  async create(dto: CreateBrandDto, username?: string) {
    const title = dto.title.trim();
    const slug = this.titleToSlug(title);
    await this.ensureTitleAndSlugUnique(title, slug);

    if (dto.mediaId != null) {
      const media = await this.mediaRepository.findOne({
        where: { id: dto.mediaId, isDeleted: false },
      });
      if (!media) throw new NotFoundException(ErrorCode.MEDIA_NOT_FOUND);
    }

    const brand = this.brandRepository.create({
      title,
      slug: slug || null,
      description: dto.description?.trim() || null,
      mediaId: dto.mediaId ?? null,
      isActive: dto.isActive ?? true,
      createdBy: username ?? null,
    });
    await this.brandRepository.save(brand);
    return this.getById(brand.id);
  }

  /** Bütün brendlər – yalnız search və isDeleted. Pagination yox, array qaytarır. */
  async getAll(params: { search?: string; isDeleted?: boolean }) {
    const qb = this.brandRepository
      .createQueryBuilder('brand')
      .leftJoinAndSelect('brand.media', 'media');

    if (params.isDeleted === true) {
      qb.andWhere('brand.is_deleted = :isDeleted', { isDeleted: true });
    } else if (params.isDeleted === false) {
      qb.andWhere('brand.is_deleted = :isDeleted', { isDeleted: false });
    }
    if (params.search?.trim()) {
      const search = `%${params.search.trim()}%`;
      qb.andWhere('(brand.title ILIKE :search OR brand.slug ILIKE :search)', { search });
    }

    qb.orderBy('brand.title', 'ASC').addOrderBy('brand.id', 'ASC');
    const brands = await qb.getMany();
    return brands.map((b) => this.toBrandResponse(b));
  }

  /** Səhifələnmiş siyahı – pagination, isDeleted, isActive, search, sort (a-z | z-a | createdAt). */
  async getFiltered(params: {
    page?: number;
    limit?: number;
    search?: string;
    isDeleted?: boolean;
    isActive?: boolean;
    sort?: 'a-z' | 'z-a' | 'createdAt';
  }) {
    const { page, limit } = normalizePagination(params);

    const qb = this.brandRepository
      .createQueryBuilder('brand')
      .leftJoinAndSelect('brand.media', 'media');

    if (params.isDeleted === true) {
      qb.andWhere('brand.is_deleted = :isDeleted', { isDeleted: true });
    } else if (params.isDeleted === false) {
      qb.andWhere('brand.is_deleted = :isDeleted', { isDeleted: false });
    }
    if (params.isActive === true) qb.andWhere('brand.is_active = :isActive', { isActive: true });
    if (params.isActive === false) qb.andWhere('brand.is_active = :isActive', { isActive: false });
    if (params.search?.trim()) {
      const search = `%${params.search.trim()}%`;
      qb.andWhere('(brand.title ILIKE :search OR brand.slug ILIKE :search)', { search });
    }

    const sort = params.sort ?? 'a-z';
    if (sort === 'a-z') {
      qb.orderBy('brand.title', 'ASC').addOrderBy('brand.id', 'ASC');
    } else if (sort === 'z-a') {
      qb.orderBy('brand.title', 'DESC').addOrderBy('brand.id', 'ASC');
    } else {
      qb.orderBy('brand.createdAt', 'DESC').addOrderBy('brand.id', 'ASC');
    }

    const total = await qb.getCount();
    const data = await qb.skip((page - 1) * limit).take(limit).getMany();
    return toPaginatedResult(
      data.map((b) => this.toBrandResponse(b)),
      total,
      page,
      limit,
    );
  }

  async getById(id: number) {
    const brand = await this.brandRepository.findOne({
      where: { id, isDeleted: false },
      relations: ['media'],
    });
    if (!brand) throw new NotFoundException(ErrorCode.BRAND_NOT_FOUND);
    return this.toBrandResponse(brand);
  }

  /** Audit sahələri olmadan response */
  private toBrandResponse(brand: Brand) {
    return {
      id: brand.id,
      title: brand.title,
      slug: brand.slug,
      description: brand.description,
      isActive: brand.isActive,
      mediaId: brand.mediaId,
      media: brand.media
        ? {
            id: brand.media.id,
            type: brand.media.type,
            path: brand.media.path,
            publicId: brand.media.publicId,
            filename: brand.media.filename,
            mimeType: brand.media.mimeType,
            altText: brand.media.altText,
            size: brand.media.size,
          }
        : null,
    };
  }

  async update(id: number, dto: UpdateBrandDto, username?: string) {
    const brand = await this.brandRepository.findOne({
      where: { id, isDeleted: false },
    });
    if (!brand) throw new NotFoundException(ErrorCode.BRAND_NOT_FOUND);

    if (dto.title !== undefined) {
      const title = dto.title.trim();
      const slug = this.titleToSlug(title);
      await this.ensureTitleAndSlugUnique(title, slug, id);
      brand.title = title;
      brand.slug = slug || null;
    }
    if (dto.description !== undefined) brand.description = dto.description.trim() || null;
    if (dto.mediaId !== undefined) {
      if (dto.mediaId != null) {
        const media = await this.mediaRepository.findOne({
          where: { id: dto.mediaId, isDeleted: false },
        });
        if (!media) throw new NotFoundException(ErrorCode.MEDIA_NOT_FOUND);
        brand.mediaId = dto.mediaId;
      } else {
        brand.mediaId = null;
      }
    }
    if (dto.isActive !== undefined) brand.isActive = dto.isActive;

    if (username != null) brand.updatedBy = username;
    brand.updatedAt = new Date();
    await this.brandRepository.save(brand);
    return this.getById(id);
  }

  async remove(id: number, username?: string): Promise<{ message: string }> {
    const brand = await this.brandRepository.findOne({
      where: { id, isDeleted: false },
    });
    if (!brand) throw new NotFoundException(ErrorCode.BRAND_NOT_FOUND);
    brand.isDeleted = true;
    if (username != null) brand.updatedBy = username;
    brand.updatedAt = new Date();
    await this.brandRepository.save(brand);
    return { message: 'Brand deleted successfully' };
  }

  private titleToSlug(title: string): string {
    const s = title.trim().normalize('NFC').toLowerCase();
    return s
      .replace(/\s+/g, '-')
      .replace(/[^\u0061-\u007a0-9\u00e0-\u00ff\u015f\u0131\u0259\u011f\-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      || '';
  }

  private async ensureTitleAndSlugUnique(
    title?: string,
    slug?: string,
    excludeId?: number,
  ): Promise<void> {
    if (title !== undefined) {
      const qb = this.brandRepository
        .createQueryBuilder('b')
        .where('LOWER(TRIM(b.title)) = LOWER(:title)', { title: title.trim() })
        .andWhere('b.is_deleted = :isDeleted', { isDeleted: false });
      if (excludeId != null) qb.andWhere('b.id != :id', { id: excludeId });
      if (await qb.getOne()) throw new ConflictException(ErrorCode.BRAND_ALREADY_EXISTS);
    }
    if (slug !== undefined && slug !== '') {
      const qb = this.brandRepository
        .createQueryBuilder('b')
        .where('LOWER(TRIM(b.slug)) = LOWER(:slug)', { slug: slug.trim() })
        .andWhere('b.is_deleted = :isDeleted', { isDeleted: false });
      if (excludeId != null) qb.andWhere('b.id != :id', { id: excludeId });
      if (await qb.getOne()) throw new ConflictException(ErrorCode.BRAND_ALREADY_EXISTS);
    }
  }
}
