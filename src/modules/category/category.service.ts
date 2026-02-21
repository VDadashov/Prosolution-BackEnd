import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { Product } from '../product/entities/product.entity';
import { BusinessException, ConflictException, NotFoundException } from '../../_common/exceptions';
import { ErrorCode } from '../../_common/constants/error-codes';
import { normalizePagination, toPaginatedResult } from '../../_common/utils/pagination.util';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(
    dto: {
      title: string;
      order?: number;
      parentId?: number | null;
      isActive?: boolean;
      allowProducts?: boolean;
    },
    username?: string,
  ) {
    const title = dto.title.trim();
    let level = 1;
    let parent: Category | null = null;
    if (dto.parentId != null) {
      parent = await this.categoryRepository.findOne({
        where: { id: dto.parentId, isDeleted: false },
      });
      if (!parent) throw new NotFoundException(ErrorCode.CATEGORY_NOT_FOUND);
      level = parent.level + 1;
    }
    const slug = parent != null
      ? `${parent.slug}/${this.titleToSlug(title)}`
      : this.titleToSlug(title);

    await this.ensureTitleAndSlugUniqueAmongSiblings(title, slug, undefined, dto.parentId ?? null);

    const category = this.categoryRepository.create({
      title,
      slug: slug || null,
      order: dto.order ?? 0,
      parentId: dto.parentId ?? null,
      level,
      isActive: dto.isActive ?? true,
      allowProducts: dto.allowProducts ?? true,
      createdBy: username ?? null,
    });
    await this.categoryRepository.save(category);
    return category;
  }

  /** Bütün kateqoriyalar – yalnız search və isDeleted filter. Pagination yox, array qaytarır. */
  async getAll(params: { search?: string; isDeleted?: boolean }) {
    const qb = this.categoryRepository.createQueryBuilder('category');

    if (params.isDeleted === true) {
      qb.andWhere('category.is_deleted = :isDeleted', { isDeleted: true });
    } else if (params.isDeleted === false) {
      qb.andWhere('category.is_deleted = :isDeleted', { isDeleted: false });
    }
    if (params.search?.trim()) {
      const search = `%${params.search.trim()}%`;
      qb.andWhere('(category.title ILIKE :search OR category.slug ILIKE :search)', { search });
    }

    qb.orderBy('category.level', 'ASC').addOrderBy('category.order', 'ASC').addOrderBy('category.title', 'ASC');

    const list = await qb.getMany();
    const countMap = await this.getChildrenCountMap(list.map((c) => c.id));
    const productCountMap = await this.getProductCountMap(list.map((c) => c.id));
    return list.map((c) => ({ ...c, childrenCount: countMap.get(c.id) ?? 0, productCount: productCountMap.get(c.id) ?? 0 }));
  }

  private async getProductCountMap(categoryIds: number[]): Promise<Map<number, number>> {
    if (categoryIds.length === 0) return new Map();
    const rows = await this.productRepository.createQueryBuilder('p')
      .select('p.category_id', 'categoryId')
      .addSelect('COUNT(*)', 'count')
      .where('p.category_id IN (:...ids)', { ids: categoryIds })
      .andWhere('p.is_deleted = :isDeleted', { isDeleted: false })
      .groupBy('p.category_id')
      .getRawMany<{ categoryId: number; count: string }>();
    const map = new Map<number, number>();
    for (const row of rows) {
      map.set(Number(row.categoryId), parseInt(row.count, 10) || 0);
    }
    return map;
  }

  /** Verilən kateqoriya id-ləri üçün birbaşa child sayı (parent_id = id, is_deleted = false). */
  private async getChildrenCountMap(categoryIds: number[]): Promise<Map<number, number>> {
    if (categoryIds.length === 0) return new Map();
    const rows = await this.categoryRepository
      .createQueryBuilder('c')
      .select('c.parent_id', 'parentId')
      .addSelect('COUNT(*)', 'count')
      .where('c.parent_id IN (:...ids)', { ids: categoryIds })
      .andWhere('c.is_deleted = :isDeleted', { isDeleted: false })
      .groupBy('c.parent_id')
      .getRawMany<{ parentId: number; count: string }>();
    const map = new Map<number, number>();
    for (const row of rows) {
      map.set(Number(row.parentId), parseInt(row.count, 10) || 0);
    }
    return map;
  }

  /** Səhifələnmiş siyahı – pagination, isDeleted, level, parentId, search, sort (default: level). */
  async getFiltered(params: {
    page?: number;
    limit?: number;
    search?: string;
    isDeleted?: boolean;
    level?: number;
    parentId?: number;
    sort?: 'level' | 'a-z' | 'z-a' | 'order' | 'createdAt';
  }) {
    const { page, limit } = normalizePagination(params);

    const qb = this.categoryRepository.createQueryBuilder('category');

    if (params.isDeleted === true) {
      qb.andWhere('category.is_deleted = :isDeleted', { isDeleted: true });
    } else if (params.isDeleted === false) {
      qb.andWhere('category.is_deleted = :isDeleted', { isDeleted: false });
    }
    if (params.search?.trim()) {
      const search = `%${params.search.trim()}%`;
      qb.andWhere('(category.title ILIKE :search OR category.slug ILIKE :search)', { search });
    }
    if (params.level !== undefined && params.level !== null && params.level !== 0) {
      qb.andWhere('category.level = :level', { level: params.level });
    }

    if (params.parentId !== undefined) {
      qb.andWhere('category.parent_id = :parentId', { parentId: params.parentId });
    }

    const sort = params.sort ?? 'level';
    if (sort === 'level') {
      qb.orderBy('category.level', 'ASC').addOrderBy('category.order', 'ASC').addOrderBy('category.title', 'ASC').addOrderBy('category.id', 'ASC');
    } else if (sort === 'a-z') {
      qb.orderBy('category.title', 'ASC').addOrderBy('category.id', 'ASC');
    } else if (sort === 'z-a') {
      qb.orderBy('category.title', 'DESC').addOrderBy('category.id', 'ASC');
    } else if (sort === 'order') {
      qb.orderBy('category.order', 'ASC').addOrderBy('category.title', 'ASC').addOrderBy('category.id', 'ASC');
    } else {
      qb.orderBy('category.createdAt', 'DESC').addOrderBy('category.id', 'ASC');
    }

    const total = await qb.getCount();
    const data = await qb.skip((page - 1) * limit).take(limit).getMany();
    const countMap = await this.getChildrenCountMap(data.map((c) => c.id));
    const productCountMap = await this.getProductCountMap(data.map((c) => c.id));
    const dataWithCount = data.map((c) => ({ ...c, childrenCount: countMap.get(c.id) ?? 0, productCount: productCountMap.get(c.id) ?? 0 }));

    return toPaginatedResult(dataWithCount, total, page, limit);
  }

  async getById(id: number) {
    const category = await this.categoryRepository.findOne({
      where: { id, isDeleted: false },
    });
    if (!category) throw new NotFoundException(ErrorCode.CATEGORY_NOT_FOUND);
    const countMap = await this.getChildrenCountMap([id]);
    const productCountMap = await this.getProductCountMap([id]);
    return { ...category, childrenCount: countMap.get(id) ?? 0, productCount: productCountMap.get(id) ?? 0 };
  }

  async getBySlug(slug: string) {
    const category = await this.categoryRepository.findOne({
      where: { slug, isDeleted: false },
    });
    if (!category) throw new NotFoundException(ErrorCode.CATEGORY_NOT_FOUND);
    const countMap = await this.getChildrenCountMap([category.id]);
    return { ...category, childrenCount: countMap.get(category.id) ?? 0 };
  }

  /** Verilən parent-in uşaq kateqoriyaları – pagination, search, isActive, sort. Yalnız silinməmiş uşaqlar. */
  async getChildrenByParentId(
    parentId: number,
    params?: {
      page?: number;
      limit?: number;
      search?: string;
      isActive?: boolean;
      sort?: 'level' | 'a-z' | 'z-a' | 'order' | 'createdAt';
    },
  ) {
    const parent = await this.categoryRepository.findOne({
      where: { id: parentId, isDeleted: false },
    });
    if (!parent) throw new NotFoundException(ErrorCode.CATEGORY_NOT_FOUND);
    const { page, limit } = normalizePagination(params);
    const qb = this.categoryRepository
      .createQueryBuilder('category')
      .where('category.parent_id = :parentId', { parentId })
      .andWhere('category.is_deleted = :isDeleted', { isDeleted: false });
    if (params?.isActive === true) qb.andWhere('category.is_active = :isActive', { isActive: true });
    if (params?.isActive === false) qb.andWhere('category.is_active = :isActive', { isActive: false });
    if (params?.search?.trim()) {
      const search = `%${params.search.trim()}%`;
      qb.andWhere('(category.title ILIKE :search OR category.slug ILIKE :search)', { search });
    }
    const sort = params?.sort ?? 'level';
    if (sort === 'level') {
      qb.orderBy('category.level', 'ASC').addOrderBy('category.order', 'ASC').addOrderBy('category.title', 'ASC').addOrderBy('category.id', 'ASC');
    } else if (sort === 'a-z') {
      qb.orderBy('category.title', 'ASC').addOrderBy('category.id', 'ASC');
    } else if (sort === 'z-a') {
      qb.orderBy('category.title', 'DESC').addOrderBy('category.id', 'ASC');
    } else if (sort === 'order') {
      qb.orderBy('category.order', 'ASC').addOrderBy('category.title', 'ASC').addOrderBy('category.id', 'ASC');
    } else {
      qb.orderBy('category.createdAt', 'DESC').addOrderBy('category.id', 'ASC');
    }
    const total = await qb.getCount();
    const data = await qb.skip((page - 1) * limit).take(limit).getMany();
    const countMap = await this.getChildrenCountMap(data.map((c) => c.id));
    const productCountMap = await this.getProductCountMap(data.map((c) => c.id));
    const dataWithCount = data.map((c) => ({ ...c, childrenCount: countMap.get(c.id) ?? 0, productCount: productCountMap.get(c.id) ?? 0 }));
    return toPaginatedResult(dataWithCount, total, page, limit);
  }

  async update(
    id: number,
    dto: {
      title?: string;
      order?: number;
      parentId?: number | null;
      isActive?: boolean;
      allowProducts?: boolean;
    },
    username?: string,
  ) {
    const category = await this.categoryRepository.findOne({
      where: { id, isDeleted: false },
    });
    if (!category) throw new NotFoundException(ErrorCode.CATEGORY_NOT_FOUND);

    const effectiveParentId = dto.parentId !== undefined ? dto.parentId ?? null : category.parentId ?? null;

    if (dto.title !== undefined) {
      const title = dto.title.trim();
      let newSlug: string;
      if (effectiveParentId != null) {
        const parentRow = await this.categoryRepository.findOne({ where: { id: effectiveParentId }, select: ['slug'] });
        newSlug = parentRow ? `${parentRow.slug}/${this.titleToSlug(title)}` : this.titleToSlug(title);
      } else {
        newSlug = this.titleToSlug(title);
      }
      await this.ensureTitleAndSlugUniqueAmongSiblings(title, newSlug || undefined, id, effectiveParentId);
      category.title = title;
      if (dto.parentId === undefined) category.slug = newSlug || null;
    }
    if (dto.order !== undefined) category.order = dto.order;
    if (dto.isActive !== undefined) category.isActive = dto.isActive;
    if (dto.allowProducts !== undefined) category.allowProducts = dto.allowProducts;

    let levelDelta = 0;
    if (dto.parentId !== undefined) {
      const oldLevel = category.level;
      if (dto.parentId != null) {
        if (dto.parentId === id) throw new BusinessException(ErrorCode.CATEGORY_PARENT_IS_DESCENDANT);
        const descendantIds = await this.getDescendantIds(id);
        if (descendantIds.includes(dto.parentId)) throw new BusinessException(ErrorCode.CATEGORY_PARENT_IS_DESCENDANT);
        const parent = await this.categoryRepository.findOne({
          where: { id: dto.parentId, isDeleted: false },
        });
        if (!parent) throw new NotFoundException(ErrorCode.CATEGORY_NOT_FOUND);
        const newSlug = `${parent.slug}/${this.titleToSlug(category.title)}`;
        await this.ensureTitleAndSlugUniqueAmongSiblings(category.title, newSlug, id, dto.parentId);
        category.level = parent.level + 1;
        category.slug = newSlug;
      } else {
        const newSlug = this.titleToSlug(category.title);
        await this.ensureTitleAndSlugUniqueAmongSiblings(category.title, newSlug, id, null);
        category.level = 1;
        category.slug = newSlug;
      }
      category.parentId = dto.parentId ?? null;
      levelDelta = category.level - oldLevel;
    }

    if (username != null) category.updatedBy = username;
    category.updatedAt = new Date();

    await this.categoryRepository.save(category);

    if (levelDelta !== 0) {
      const descendantIds = await this.getDescendantIds(id);
      if (descendantIds.length > 0) {
        await this.categoryRepository
          .createQueryBuilder()
          .update(Category)
          .set({ level: () => 'level + :delta' })
          .where('id IN (:...ids)', { ids: descendantIds })
          .setParameter('delta', levelDelta)
          .execute();
      }
    }
    return category;
  }

  /** Soft delete: isDeleted = true, sətir DB-də qalır. Alt kateqoriyası olan kateqoriya silinə bilməz. */
  async remove(id: number, username?: string): Promise<{ message: string }> {
    const category = await this.categoryRepository.findOne({
      where: { id, isDeleted: false },
    });
    if (!category) throw new NotFoundException(ErrorCode.CATEGORY_NOT_FOUND);

    const childrenCount = await this.categoryRepository.count({
      where: { parentId: id, isDeleted: false },
    });
    if (childrenCount > 0) throw new BusinessException(ErrorCode.CATEGORY_HAS_CHILDREN);

    category.isDeleted = true;
    if (username != null) category.updatedBy = username;
    category.updatedAt = new Date();
    await this.categoryRepository.save(category);
    return { message: 'Category deleted successfully' };
  }

  /** Verilən kateqoriyanın bütün nəsil id-ləri (child, nəvə, ...). Parent seçimində dairəvi asılılığı qarşısını almaq üçün. */
  private async getDescendantIds(categoryId: number): Promise<number[]> {
    const result: number[] = [];
    let currentIds: number[] = [categoryId];
    while (currentIds.length > 0) {
      const children = await this.categoryRepository.find({
        where: { parentId: In(currentIds), isDeleted: false },
        select: ['id'],
      });
      const newIds = children.map((c) => c.id).filter((id) => !result.includes(id));
      result.push(...newIds);
      currentIds = newIds;
    }
    return result;
  }

  /** title → slug: yalnız kiçik hərflər, boşluq→tire. Title necə yazılıbsa (ş, ı, ə və s.) slug-da eyni hərflər qalır. */
  private titleToSlug(title: string): string {
    const s = title.trim().normalize('NFC').toLowerCase();
    const slug = s
      .replace(/\s+/g, '-')
      .replace(/[^\u0061-\u007a0-9\u00e0-\u00ff\u015f\u0131\u0259\u011f\-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    return slug || '';
  }

  /** Eyni parent altında (sibling) title və ya slug təkrarlanırsa ConflictException. Fərqli parent altında eyni title/slug icazəlidir (qovluqlarda eyni fayl adı kimi). */
  private async ensureTitleAndSlugUniqueAmongSiblings(
    title?: string,
    slug?: string,
    excludeId?: number,
    parentId?: number | null,
  ): Promise<void> {
    const qb = this.categoryRepository
      .createQueryBuilder('c')
      .andWhere('c.is_deleted = :isDeleted', { isDeleted: false });
    if (parentId == null) {
      qb.andWhere('c.parent_id IS NULL');
    } else {
      qb.andWhere('c.parent_id = :parentId', { parentId });
    }
    if (excludeId != null) qb.andWhere('c.id != :excludeId', { excludeId });

    if (title !== undefined && title.trim() !== '') {
      const byTitle = qb.clone();
      byTitle.andWhere('LOWER(TRIM(c.title)) = LOWER(:title)', { title: title.trim() });
      if (await byTitle.getOne()) throw new ConflictException(ErrorCode.CATEGORY_ALREADY_EXISTS);
    }
    if (slug !== undefined && slug !== '') {
      const bySlug = this.categoryRepository
        .createQueryBuilder('c')
        .where('LOWER(TRIM(c.slug)) = LOWER(:slug)', { slug: slug.trim() })
        .andWhere('c.is_deleted = :isDeleted', { isDeleted: false });
      if (parentId == null) {
        bySlug.andWhere('c.parent_id IS NULL');
      } else {
        bySlug.andWhere('c.parent_id = :parentId', { parentId });
      }
      if (excludeId != null) bySlug.andWhere('c.id != :excludeId', { excludeId });
      if (await bySlug.getOne()) throw new ConflictException(ErrorCode.CATEGORY_ALREADY_EXISTS);
    }
  }
}
