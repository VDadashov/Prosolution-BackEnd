import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Feature } from './entities/feature.entity';
import { FeatureOption } from './entities/feature-option.entity';
import { CategoryFeature } from './entities/category-feature.entity';
import { Category } from '../category/entities/category.entity';
import { ProductFeatureOption } from '../product/entities/product-feature-option.entity';
import { Product } from '../product/entities/product.entity';
import { ConflictException, NotFoundException } from '../../_common/exceptions';
import { ErrorCode } from '../../_common/constants/error-codes';
import { normalizePagination, toPaginatedResult } from '../../_common/utils/pagination.util';

@Injectable()
export class FeatureService {
  constructor(
    @InjectRepository(Feature)
    private readonly featureRepository: Repository<Feature>,
    @InjectRepository(FeatureOption)
    private readonly optionRepository: Repository<FeatureOption>,
    @InjectRepository(CategoryFeature)
    private readonly categoryFeatureRepository: Repository<CategoryFeature>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(ProductFeatureOption)
    private readonly productFeatureOptionRepository: Repository<ProductFeatureOption>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async createFeature(
    dto: {
      title: string;
      order?: number;
      isActive?: boolean;
      options?: Array<{ title: string; order?: number }>;
    },
    username?: string,
  ) {
    const title = dto.title.trim();
    const slug = this.titleToSlug(title);
    await this.ensureFeatureTitleSlugUnique(title, slug);
    const feature = this.featureRepository.create({
      title,
      slug: slug || null,
      order: dto.order ?? 0,
      isActive: dto.isActive ?? true,
      createdBy: username ?? null,
    });
    await this.featureRepository.save(feature);

    if (dto.options?.length) {
      const created = await this.addOptionsToFeature(feature.id, dto.options, username);
      return { ...feature, options: created };
    }
    return feature;
  }

  /** Feature-a çoxlu option əlavə edir; eyni title (həmin feature üçün) artıq varsa onu atlayır. */
  async addOptionsToFeature(
    featureId: number,
    items: Array<{ title: string; order?: number }>,
    username?: string,
  ): Promise<FeatureOption[]> {
    const feature = await this.featureRepository.findOne({
      where: { id: featureId, isDeleted: false },
    });
    if (!feature) throw new NotFoundException(ErrorCode.FEATURE_NOT_FOUND);
    const created: FeatureOption[] = [];
    for (let i = 0; i < items.length; i++) {
      const { title: rawTitle, order: itemOrder } = items[i];
      const title = rawTitle.trim();
      if (!title) continue;
      const existing = await this.optionRepository.findOne({
        where: { featureId, title, isDeleted: false },
      });
      if (existing) continue;
      const optionSlug = feature.slug
        ? `${feature.slug}/${this.titleToSlug(title)}`
        : this.titleToSlug(title);
      const option = this.optionRepository.create({
        featureId,
        title,
        slug: optionSlug || null,
        order: itemOrder ?? i,
        createdBy: username ?? null,
      });
      await this.optionRepository.save(option);
      created.push(option);
    }
    return created;
  }

  /** Bütün xüsusiyyətlər – yalnız search və isDeleted. Pagination yox, array qaytarır. */
  async getAllFeatures(params: { search?: string; isDeleted?: boolean }) {
    const qb = this.featureRepository.createQueryBuilder('feature');

    if (params.isDeleted === true) {
      qb.andWhere('feature.is_deleted = :isDeleted', { isDeleted: true });
    } else if (params.isDeleted === false) {
      qb.andWhere('feature.is_deleted = :isDeleted', { isDeleted: false });
    }
    if (params.search?.trim()) {
      const search = `%${params.search.trim()}%`;
      qb.andWhere('(feature.title ILIKE :search OR feature.slug ILIKE :search)', { search });
    }

    qb.orderBy('feature.order', 'ASC').addOrderBy('feature.title', 'ASC').addOrderBy('feature.id', 'ASC');
    return qb.getMany();
  }

  /** Səhifələnmiş siyahı – pagination, isDeleted, isActive, search, sort. sort göndərilməzsə default: feature.order üzrə. */
  async getFilteredFeatures(params: {
    page?: number;
    limit?: number;
    search?: string;
    isDeleted?: boolean;
    isActive?: boolean;
    sort?: 'a-z' | 'z-a' | 'createdAt';
  }) {
    const { page, limit } = normalizePagination(params);

    const qb = this.featureRepository.createQueryBuilder('feature');

    if (params.isDeleted === true) {
      qb.andWhere('feature.is_deleted = :isDeleted', { isDeleted: true });
    } else if (params.isDeleted === false) {
      qb.andWhere('feature.is_deleted = :isDeleted', { isDeleted: false });
    }
    if (params.isActive === true) qb.andWhere('feature.is_active = :isActive', { isActive: true });
    if (params.isActive === false) qb.andWhere('feature.is_active = :isActive', { isActive: false });
    if (params.search?.trim()) {
      const search = `%${params.search.trim()}%`;
      qb.andWhere('(feature.title ILIKE :search OR feature.slug ILIKE :search)', { search });
    }

    const sort = params.sort ?? 'order';
    if (sort === 'order') {
      qb.orderBy('feature.order', 'ASC').addOrderBy('feature.title', 'ASC').addOrderBy('feature.id', 'ASC');
    }
    if (sort === 'a-z') {
      qb.orderBy('feature.title', 'ASC').addOrderBy('feature.id', 'ASC');
    } else if (sort === 'z-a') {
      qb.orderBy('feature.title', 'DESC').addOrderBy('feature.id', 'ASC');
    } else if (sort === 'createdAt') {
      qb.orderBy('feature.createdAt', 'DESC').addOrderBy('feature.id', 'ASC');
    } else {
      qb.orderBy('feature.order', 'ASC').addOrderBy('feature.title', 'ASC').addOrderBy('feature.id', 'ASC');
    }

    const total = await qb.getCount();
    const data = await qb.skip((page - 1) * limit).take(limit).getMany();
    const optionsCountMap = await this.getOptionsCountMap(data.map((f) => f.id));
    const dataWithCount = data.map((f) => ({ ...f, optionsCount: optionsCountMap.get(f.id) ?? 0 }));
    return toPaginatedResult(dataWithCount, total, page, limit);
  }

  /** Verilən feature id-ləri üçün option sayı (feature_id = id, is_deleted = false). */
  private async getOptionsCountMap(featureIds: number[]): Promise<Map<number, number>> {
    if (featureIds.length === 0) return new Map();
    const rows = await this.optionRepository
      .createQueryBuilder('opt')
      .select('opt.feature_id', 'featureId')
      .addSelect('COUNT(*)', 'count')
      .where('opt.feature_id IN (:...ids)', { ids: featureIds })
      .andWhere('opt.is_deleted = :isDeleted', { isDeleted: false })
      .groupBy('opt.feature_id')
      .getRawMany<{ featureId: number; count: string }>();
    const map = new Map<number, number>();
    for (const row of rows) {
      map.set(Number(row.featureId), parseInt(row.count, 10) || 0);
    }
    return map;
  }

  async getFeatureById(id: number) {
    const feature = await this.featureRepository.findOne({
      where: { id, isDeleted: false },
    });
    if (!feature) throw new NotFoundException(ErrorCode.FEATURE_NOT_FOUND);
    return feature;
  }

  async updateFeature(id: number, dto: { title?: string; order?: number; isActive?: boolean }, username?: string) {
    const feature = await this.featureRepository.findOne({
      where: { id, isDeleted: false },
    });
    if (!feature) throw new NotFoundException(ErrorCode.FEATURE_NOT_FOUND);
    if (dto.title !== undefined) {
      const title = dto.title.trim();
      await this.ensureFeatureTitleSlugUnique(title, undefined, id);
      feature.title = title;
      feature.slug = this.titleToSlug(title) || null;
    }
    if (dto.order !== undefined) feature.order = dto.order;
    if (dto.isActive !== undefined) feature.isActive = dto.isActive;
    if (username != null) feature.updatedBy = username;
    feature.updatedAt = new Date();
    await this.featureRepository.save(feature);

    if (dto.title !== undefined) {
      const options = await this.optionRepository.find({
        where: { featureId: id, isDeleted: false },
      });
      for (const opt of options) {
        opt.slug = feature.slug
          ? `${feature.slug}/${this.titleToSlug(opt.title)}`
          : this.titleToSlug(opt.title) || null;
        opt.updatedAt = new Date();
        if (username != null) opt.updatedBy = username;
      }
      if (options.length > 0) await this.optionRepository.save(options);
    }
    return feature;
  }

  async removeFeature(id: number, username?: string) {
    const feature = await this.featureRepository.findOne({
      where: { id, isDeleted: false },
    });
    if (!feature) throw new NotFoundException(ErrorCode.FEATURE_NOT_FOUND);
    feature.isDeleted = true;
    if (username != null) feature.updatedBy = username;
    feature.updatedAt = new Date();
    await this.featureRepository.save(feature);
    await this.optionRepository.update(
      { featureId: id },
      { isDeleted: true, updatedBy: username ?? null, updatedAt: new Date() },
    );
    return { message: 'Feature deleted successfully' };
  }

  async createFeatureOption(
    dto: { featureId: number; title: string; order?: number },
    username?: string,
  ) {
    const feature = await this.featureRepository.findOne({
      where: { id: dto.featureId, isDeleted: false },
    });
    if (!feature) throw new NotFoundException(ErrorCode.FEATURE_NOT_FOUND);
    const title = dto.title.trim();
    const optionSlug = feature.slug
      ? `${feature.slug}/${this.titleToSlug(title)}`
      : this.titleToSlug(title);
    const option = this.optionRepository.create({
      featureId: dto.featureId,
      title,
      slug: optionSlug || null,
      order: dto.order ?? 0,
      createdBy: username ?? null,
    });
    await this.optionRepository.save(option);
    return option;
  }

  async getOptionsByFeatureId(featureId: number, params?: { page?: number; limit?: number; search?: string; isActive?: boolean }) {
    await this.getFeatureById(featureId);
    const { page, limit } = normalizePagination(params);
    const qb = this.optionRepository
      .createQueryBuilder('opt')
      .where('opt.feature_id = :featureId', { featureId })
      .andWhere('opt.is_deleted = :isDeleted', { isDeleted: false });
    if (params?.search?.trim()) {
      const search = `%${params.search.trim()}%`;
      qb.andWhere('(opt.title ILIKE :search OR opt.slug ILIKE :search)', { search });
    }
    if (params?.isActive === true) qb.andWhere('opt.is_active = :isActive', { isActive: true });
    if (params?.isActive === false) qb.andWhere('opt.is_active = :isActive', { isActive: false });
    qb.orderBy('opt.order', 'ASC').addOrderBy('opt.title', 'ASC');
    const total = await qb.getCount();
    const data = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();
    return toPaginatedResult(data, total, page, limit);
  }

  async getFeatureOptionById(id: number) {
    const option = await this.optionRepository.findOne({
      where: { id, isDeleted: false },
      relations: ['feature'],
    });
    if (!option) throw new NotFoundException(ErrorCode.FEATURE_OPTION_NOT_FOUND);
    return option;
  }

  async updateFeatureOption(
    id: number,
    dto: { title?: string; order?: number },
    username?: string,
  ) {
    const option = await this.optionRepository.findOne({
      where: { id, isDeleted: false },
      relations: ['feature'],
    });
    if (!option) throw new NotFoundException(ErrorCode.FEATURE_OPTION_NOT_FOUND);
    if (dto.title !== undefined) {
      option.title = dto.title.trim();
      const feature = option.feature;
      option.slug = feature?.slug
        ? `${feature.slug}/${this.titleToSlug(option.title)}`
        : this.titleToSlug(option.title) || null;
    }
    if (dto.order !== undefined) option.order = dto.order;
    if (username != null) option.updatedBy = username;
    option.updatedAt = new Date();
    await this.optionRepository.save(option);
    return option;
  }

  async removeFeatureOption(id: number, username?: string) {
    const option = await this.optionRepository.findOne({
      where: { id, isDeleted: false },
    });
    if (!option) throw new NotFoundException(ErrorCode.FEATURE_OPTION_NOT_FOUND);
    option.isDeleted = true;
    if (username != null) option.updatedBy = username;
    option.updatedAt = new Date();
    await this.optionRepository.save(option);
    return { message: 'Feature option deleted successfully' };
  }

  async assignFeaturesToCategory(categoryId: number, featureIds: number[]) {
    const uniqueFeatureIds = [...new Set(featureIds)];
    const category = await this.categoryRepository.findOne({
      where: { id: categoryId, isDeleted: false },
    });
    if (!category) throw new NotFoundException(ErrorCode.CATEGORY_NOT_FOUND);
    for (const featureId of uniqueFeatureIds) {
      const feature = await this.featureRepository.findOne({
        where: { id: featureId, isDeleted: false },
      });
      if (!feature) throw new NotFoundException(ErrorCode.FEATURE_NOT_FOUND);
    }
    const existing = await this.categoryFeatureRepository.find({
      where: { categoryId },
    });
    await this.categoryFeatureRepository.remove(existing);
    const items = uniqueFeatureIds.map((featureId, index) =>
      this.categoryFeatureRepository.create({
        categoryId,
        featureId,
        order: index,
      }),
    );
    await this.categoryFeatureRepository.save(items);
    return this.getFeaturesByCategoryId(categoryId);
  }

  /** Kateqoriya üçün feature + option siyahısı; hər option-da bu kateqoriyada həmin option-u olan məhsul sayı (productCount). */
  async getFeaturesByCategoryId(categoryId: number) {
    const category = await this.categoryRepository.findOne({
      where: { id: categoryId, isDeleted: false },
    });
    if (!category) throw new NotFoundException(ErrorCode.CATEGORY_NOT_FOUND);
    const list = await this.categoryFeatureRepository.find({
      where: { categoryId },
      relations: ['feature', 'feature.options'],
      order: { order: 'ASC' },
    });
    const optionCountMap = await this.getProductCountByOptionIdForCategory(categoryId);
    return list
      .filter((cf) => !cf.feature.isDeleted)
      .map((cf) => ({
        id: cf.feature.id,
        title: cf.feature.title,
        slug: cf.feature.slug,
        order: cf.order,
        options: (cf.feature.options || [])
          .filter((o) => !o.isDeleted)
          .map((o) => ({
            id: o.id,
            featureId: o.featureId,
            title: o.title,
            slug: o.slug,
            order: o.order,
            productCount: optionCountMap.get(o.id) ?? 0,
          })),
      }));
  }

  /** Verilən kateqoriyada hər feature option üçün (silinməmiş) məhsul sayı. */
  private async getProductCountByOptionIdForCategory(categoryId: number): Promise<Map<number, number>> {
    const rows = await this.productFeatureOptionRepository
      .createQueryBuilder('pfo')
      .innerJoin(Product, 'p', 'p.id = pfo.product_id AND p.category_id = :categoryId AND p.is_deleted = :isDeleted', {
        categoryId,
        isDeleted: false,
      })
      .select('pfo.feature_option_id', 'optionId')
      .addSelect('COUNT(DISTINCT pfo.product_id)', 'cnt')
      .groupBy('pfo.feature_option_id')
      .getRawMany<{ optionId: number; cnt: string }>();
    const map = new Map<number, number>();
    for (const r of rows) {
      map.set(Number(r.optionId), parseInt(r.cnt, 10) || 0);
    }
    return map;
  }

  private titleToSlug(title: string): string {
    const s = title.trim().normalize('NFC').toLowerCase();
    const slug = s
      .replace(/\s+/g, '-')
      .replace(/[^\u0061-\u007a0-9\u00e0-\u00ff\u015f\u0131\u0259\u011f\-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    return slug || '';
  }

  private async ensureFeatureTitleSlugUnique(
    title?: string,
    slug?: string,
    excludeId?: number,
  ): Promise<void> {
    if (title !== undefined) {
      const qb = this.featureRepository
        .createQueryBuilder('f')
        .where('LOWER(TRIM(f.title)) = LOWER(:title)', { title: title.trim() })
        .andWhere('f.is_deleted = :isDeleted', { isDeleted: false });
      if (excludeId != null) qb.andWhere('f.id != :id', { id: excludeId });
      if (await qb.getOne()) throw new ConflictException(ErrorCode.FEATURE_ALREADY_EXISTS);
    }
    if (slug !== undefined && slug !== '') {
      const qb = this.featureRepository
        .createQueryBuilder('f')
        .where('LOWER(TRIM(f.slug)) = LOWER(:slug)', { slug: slug.trim() })
        .andWhere('f.is_deleted = :isDeleted', { isDeleted: false });
      if (excludeId != null) qb.andWhere('f.id != :id', { id: excludeId });
      if (await qb.getOne()) throw new ConflictException(ErrorCode.FEATURE_ALREADY_EXISTS);
    }
  }
}
