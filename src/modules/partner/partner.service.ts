import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Partner } from './entities/partner.entity';
import { Media } from '../media/entities/media.entity';
import { ConflictException, NotFoundException } from '../../_common/exceptions';
import { ErrorCode } from '../../_common/constants/error-codes';
import { CreatePartnerDto } from './dto/create-partner.dto';
import { UpdatePartnerDto } from './dto/update-partner.dto';
import { normalizePagination, toPaginatedResult } from '../../_common/utils/pagination.util';

@Injectable()
export class PartnerService {
  constructor(
    @InjectRepository(Partner)
    private readonly partnerRepository: Repository<Partner>,
    @InjectRepository(Media)
    private readonly mediaRepository: Repository<Media>,
  ) {}

  async create(dto: CreatePartnerDto, username?: string) {
    const title = dto.title.trim();
    const slug = this.titleToSlug(title);
    await this.ensureTitleAndSlugUnique(title, slug);

    if (dto.mediaId != null) {
      const media = await this.mediaRepository.findOne({
        where: { id: dto.mediaId, isDeleted: false },
      });
      if (!media) throw new NotFoundException(ErrorCode.MEDIA_NOT_FOUND);
    }

    const partner = this.partnerRepository.create({
      title,
      slug: slug || null,
      description: dto.description?.trim() || null,
      mediaId: dto.mediaId ?? null,
      isActive: dto.isActive ?? true,
      createdBy: username ?? null,
    });
    await this.partnerRepository.save(partner);
    return this.getById(partner.id);
  }

  /** Bütün tərəfdaşlar – yalnız search və isDeleted. Pagination yox, array qaytarır. */
  async getAll(params: { search?: string; isDeleted?: boolean }) {
    const qb = this.partnerRepository
      .createQueryBuilder('partner')
      .leftJoinAndSelect('partner.media', 'media');

    if (params.isDeleted === true) {
      qb.andWhere('partner.is_deleted = :isDeleted', { isDeleted: true });
    } else if (params.isDeleted === false) {
      qb.andWhere('partner.is_deleted = :isDeleted', { isDeleted: false });
    }
    if (params.search?.trim()) {
      const search = `%${params.search.trim()}%`;
      qb.andWhere('(partner.title ILIKE :search OR partner.slug ILIKE :search)', { search });
    }

    qb.orderBy('partner.title', 'ASC').addOrderBy('partner.id', 'ASC');
    const partners = await qb.getMany();
    return partners.map((p) => this.toPartnerResponse(p));
  }

  /** Səhifələnmiş siyahı – pagination, isDeleted, search, sort (a-z | z-a | createdAt). */
  async getFiltered(params: {
    page?: number;
    limit?: number;
    search?: string;
    isDeleted?: boolean;
    sort?: 'a-z' | 'z-a' | 'createdAt';
  }) {
    const { page, limit } = normalizePagination(params);

    const qb = this.partnerRepository
      .createQueryBuilder('partner')
      .leftJoinAndSelect('partner.media', 'media');

    if (params.isDeleted === true) {
      qb.andWhere('partner.is_deleted = :isDeleted', { isDeleted: true });
    } else if (params.isDeleted === false) {
      qb.andWhere('partner.is_deleted = :isDeleted', { isDeleted: false });
    }
    if (params.search?.trim()) {
      const search = `%${params.search.trim()}%`;
      qb.andWhere('(partner.title ILIKE :search OR partner.slug ILIKE :search)', { search });
    }

    const sort = params.sort ?? 'a-z';
    if (sort === 'a-z') {
      qb.orderBy('partner.title', 'ASC').addOrderBy('partner.id', 'ASC');
    } else if (sort === 'z-a') {
      qb.orderBy('partner.title', 'DESC').addOrderBy('partner.id', 'ASC');
    } else {
      qb.orderBy('partner.createdAt', 'DESC').addOrderBy('partner.id', 'ASC');
    }

    const total = await qb.getCount();
    const data = await qb.skip((page - 1) * limit).take(limit).getMany();
    return toPaginatedResult(
      data.map((p) => this.toPartnerResponse(p)),
      total,
      page,
      limit,
    );
  }

  async getById(id: number) {
    const partner = await this.partnerRepository.findOne({
      where: { id, isDeleted: false },
      relations: ['media'],
    });
    if (!partner) throw new NotFoundException(ErrorCode.PARTNER_NOT_FOUND);
    return this.toPartnerResponse(partner);
  }

  /** Audit sahələri olmadan response */
  private toPartnerResponse(partner: Partner) {
    return {
      id: partner.id,
      title: partner.title,
      slug: partner.slug,
      description: partner.description,
      mediaId: partner.mediaId,
      media: partner.media
        ? {
            id: partner.media.id,
            type: partner.media.type,
            path: partner.media.path,
            publicId: partner.media.publicId,
            filename: partner.media.filename,
            mimeType: partner.media.mimeType,
            altText: partner.media.altText,
            size: partner.media.size,
          }
        : null,
    };
  }

  async update(id: number, dto: UpdatePartnerDto, username?: string) {
    const partner = await this.partnerRepository.findOne({
      where: { id, isDeleted: false },
    });
    if (!partner) throw new NotFoundException(ErrorCode.PARTNER_NOT_FOUND);

    if (dto.title !== undefined) {
      const title = dto.title.trim();
      const slug = this.titleToSlug(title);
      await this.ensureTitleAndSlugUnique(title, slug, id);
      partner.title = title;
      partner.slug = slug || null;
    }
    if (dto.description !== undefined) partner.description = dto.description.trim() || null;
    if (dto.mediaId !== undefined) {
      if (dto.mediaId != null) {
        const media = await this.mediaRepository.findOne({
          where: { id: dto.mediaId, isDeleted: false },
        });
        if (!media) throw new NotFoundException(ErrorCode.MEDIA_NOT_FOUND);
        partner.mediaId = dto.mediaId;
      } else {
        partner.mediaId = null;
      }
    }
    if (dto.isActive !== undefined) partner.isActive = dto.isActive;

    if (username != null) partner.updatedBy = username;
    partner.updatedAt = new Date();
    await this.partnerRepository.save(partner);
    return this.getById(id);
  }

  async remove(id: number, username?: string): Promise<{ message: string }> {
    const partner = await this.partnerRepository.findOne({
      where: { id, isDeleted: false },
    });
    if (!partner) throw new NotFoundException(ErrorCode.PARTNER_NOT_FOUND);
    partner.isDeleted = true;
    if (username != null) partner.updatedBy = username;
    partner.updatedAt = new Date();
    await this.partnerRepository.save(partner);
    return { message: 'Partner deleted successfully' };
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
      const qb = this.partnerRepository
        .createQueryBuilder('p')
        .where('LOWER(TRIM(p.title)) = LOWER(:title)', { title: title.trim() })
        .andWhere('p.is_deleted = :isDeleted', { isDeleted: false });
      if (excludeId != null) qb.andWhere('p.id != :id', { id: excludeId });
      if (await qb.getOne()) throw new ConflictException(ErrorCode.PARTNER_ALREADY_EXISTS);
    }
    if (slug !== undefined && slug !== '') {
      const qb = this.partnerRepository
        .createQueryBuilder('p')
        .where('LOWER(TRIM(p.slug)) = LOWER(:slug)', { slug: slug.trim() })
        .andWhere('p.is_deleted = :isDeleted', { isDeleted: false });
      if (excludeId != null) qb.andWhere('p.id != :id', { id: excludeId });
      if (await qb.getOne()) throw new ConflictException(ErrorCode.PARTNER_ALREADY_EXISTS);
    }
  }
}
