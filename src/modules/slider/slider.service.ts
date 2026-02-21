import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Slider } from './entities/slider.entity';
import { Media } from '../media/entities/media.entity';
import { ConflictException, NotFoundException } from '../../_common/exceptions';
import { ErrorCode } from '../../_common/constants/error-codes';
import { CreateSliderDto } from './dto/create-slider.dto';
import { UpdateSliderDto } from './dto/update-slider.dto';
import { normalizePagination, toPaginatedResult } from '../../_common/utils/pagination.util';

@Injectable()
export class SliderService {
  constructor(
    @InjectRepository(Slider)
    private readonly sliderRepository: Repository<Slider>,
    @InjectRepository(Media)
    private readonly mediaRepository: Repository<Media>,
  ) {}

  async create(dto: CreateSliderDto, username?: string) {
    const title = dto.title.trim();
    const slug = this.titleToSlug(title);
    await this.ensureTitleAndSlugUnique(title, slug);

    if (dto.mediaId != null) {
      const media = await this.mediaRepository.findOne({
        where: { id: dto.mediaId, isDeleted: false },
      });
      if (!media) throw new NotFoundException(ErrorCode.MEDIA_NOT_FOUND);
    }

    const slider = this.sliderRepository.create({
      title,
      slug: slug || null,
      description: dto.description?.trim() || null,
      order: dto.order ?? 0,
      mediaId: dto.mediaId ?? null,
      isActive: dto.isActive ?? true,
      createdBy: username ?? null,
    });
    await this.sliderRepository.save(slider);
    return this.getById(slider.id);
  }

  /** Bütün slayderlər – yalnız search və isDeleted. Pagination yox, array qaytarır. */
  async getAll(params: { search?: string; isDeleted?: boolean }) {
    const qb = this.sliderRepository
      .createQueryBuilder('slider')
      .leftJoinAndSelect('slider.media', 'media');

    if (params.isDeleted === true) {
      qb.andWhere('slider.is_deleted = :isDeleted', { isDeleted: true });
    } else if (params.isDeleted === false) {
      qb.andWhere('slider.is_deleted = :isDeleted', { isDeleted: false });
    }
    if (params.search?.trim()) {
      const search = `%${params.search.trim()}%`;
      qb.andWhere('(slider.title ILIKE :search OR slider.slug ILIKE :search)', { search });
    }

    qb.orderBy('slider.order', 'ASC').addOrderBy('slider.title', 'ASC').addOrderBy('slider.id', 'ASC');
    const sliders = await qb.getMany();
    return sliders.map((s) => this.toSliderResponse(s));
  }

  /** Səhifələnmiş siyahı – pagination, isDeleted, search, sort (a-z | z-a | order | createdAt). */
  async getFiltered(params: {
    page?: number;
    limit?: number;
    search?: string;
    isDeleted?: boolean;
    sort?: 'a-z' | 'z-a' | 'order' | 'createdAt';
  }) {
    const { page, limit } = normalizePagination(params);

    const qb = this.sliderRepository
      .createQueryBuilder('slider')
      .leftJoinAndSelect('slider.media', 'media');

    if (params.isDeleted === true) {
      qb.andWhere('slider.is_deleted = :isDeleted', { isDeleted: true });
    } else if (params.isDeleted === false) {
      qb.andWhere('slider.is_deleted = :isDeleted', { isDeleted: false });
    }
    if (params.search?.trim()) {
      const search = `%${params.search.trim()}%`;
      qb.andWhere('(slider.title ILIKE :search OR slider.slug ILIKE :search)', { search });
    }

    const sort = params.sort ?? 'order';
    if (sort === 'a-z') {
      qb.orderBy('slider.title', 'ASC').addOrderBy('slider.id', 'ASC');
    } else if (sort === 'z-a') {
      qb.orderBy('slider.title', 'DESC').addOrderBy('slider.id', 'ASC');
    } else if (sort === 'order') {
      qb.orderBy('slider.order', 'ASC').addOrderBy('slider.title', 'ASC').addOrderBy('slider.id', 'ASC');
    } else {
      qb.orderBy('slider.createdAt', 'DESC').addOrderBy('slider.id', 'ASC');
    }

    const total = await qb.getCount();
    const data = await qb.skip((page - 1) * limit).take(limit).getMany();
    return toPaginatedResult(
      data.map((s) => this.toSliderResponse(s)),
      total,
      page,
      limit,
    );
  }

  async getById(id: number) {
    const slider = await this.sliderRepository.findOne({
      where: { id, isDeleted: false },
      relations: ['media'],
    });
    if (!slider) throw new NotFoundException(ErrorCode.SLIDER_NOT_FOUND);
    return this.toSliderResponse(slider);
  }

  /** Audit sahələri olmadan response */
  private toSliderResponse(slider: Slider) {
    return {
      id: slider.id,
      title: slider.title,
      slug: slider.slug,
      description: slider.description,
      order: slider.order,
      isActive: slider.isActive,
      mediaId: slider.mediaId,
      media: slider.media
        ? {
            id: slider.media.id,
            type: slider.media.type,
            path: slider.media.path,
            publicId: slider.media.publicId,
            filename: slider.media.filename,
            mimeType: slider.media.mimeType,
            altText: slider.media.altText,
            size: slider.media.size,
          }
        : null,
    };
  }

  async update(id: number, dto: UpdateSliderDto, username?: string) {
    const slider = await this.sliderRepository.findOne({
      where: { id, isDeleted: false },
    });
    if (!slider) throw new NotFoundException(ErrorCode.SLIDER_NOT_FOUND);

    if (dto.title !== undefined) {
      const title = dto.title.trim();
      const slug = this.titleToSlug(title);
      await this.ensureTitleAndSlugUnique(title, slug, id);
      slider.title = title;
      slider.slug = slug || null;
    }
    if (dto.description !== undefined) slider.description = dto.description.trim() || null;
    if (dto.order !== undefined) slider.order = dto.order;
    if (dto.mediaId !== undefined) {
      if (dto.mediaId != null) {
        const media = await this.mediaRepository.findOne({
          where: { id: dto.mediaId, isDeleted: false },
        });
        if (!media) throw new NotFoundException(ErrorCode.MEDIA_NOT_FOUND);
        slider.mediaId = dto.mediaId;
      } else {
        slider.mediaId = null;
      }
    }
    if (dto.isActive !== undefined) slider.isActive = dto.isActive;

    if (username != null) slider.updatedBy = username;
    slider.updatedAt = new Date();
    await this.sliderRepository.save(slider);
    return this.getById(id);
  }

  async remove(id: number, username?: string): Promise<{ message: string }> {
    const slider = await this.sliderRepository.findOne({
      where: { id, isDeleted: false },
    });
    if (!slider) throw new NotFoundException(ErrorCode.SLIDER_NOT_FOUND);
    slider.isDeleted = true;
    if (username != null) slider.updatedBy = username;
    slider.updatedAt = new Date();
    await this.sliderRepository.save(slider);
    return { message: 'Slider deleted successfully' };
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
      const qb = this.sliderRepository
        .createQueryBuilder('s')
        .where('LOWER(TRIM(s.title)) = LOWER(:title)', { title: title.trim() })
        .andWhere('s.is_deleted = :isDeleted', { isDeleted: false });
      if (excludeId != null) qb.andWhere('s.id != :id', { id: excludeId });
      if (await qb.getOne()) throw new ConflictException(ErrorCode.SLIDER_ALREADY_EXISTS);
    }
    if (slug !== undefined && slug !== '') {
      const qb = this.sliderRepository
        .createQueryBuilder('s')
        .where('LOWER(TRIM(s.slug)) = LOWER(:slug)', { slug: slug.trim() })
        .andWhere('s.is_deleted = :isDeleted', { isDeleted: false });
      if (excludeId != null) qb.andWhere('s.id != :id', { id: excludeId });
      if (await qb.getOne()) throw new ConflictException(ErrorCode.SLIDER_ALREADY_EXISTS);
    }
  }
}
