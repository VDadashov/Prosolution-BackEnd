import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { ProductFeatureOption } from './entities/product-feature-option.entity';
import { ProductImage } from './entities/product-image.entity';
import { Media } from '../media/entities/media.entity';
import { Category } from '../category/entities/category.entity';
import { FeatureOption } from '../feature/entities/feature-option.entity';
import { BusinessException, ConflictException, NotFoundException } from '../../_common/exceptions';
import { ErrorCode } from '../../_common/constants/error-codes';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { normalizePagination, toPaginatedResult } from '../../_common/utils/pagination.util';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductFeatureOption)
    private readonly productFeatureOptionRepository: Repository<ProductFeatureOption>,
    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,
    @InjectRepository(Media)
    private readonly mediaRepository: Repository<Media>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(FeatureOption)
    private readonly featureOptionRepository: Repository<FeatureOption>,
  ) {}

  async create(dto: CreateProductDto, username?: string) {
    const category = await this.categoryRepository.findOne({
      where: { id: dto.categoryId, isDeleted: false },
    });
    if (!category) throw new NotFoundException(ErrorCode.CATEGORY_NOT_FOUND);
    if (!category.allowProducts) {
      throw new BusinessException(ErrorCode.CATEGORY_DOES_NOT_ALLOW_PRODUCTS);
    }
    const title = dto.title.trim();
    const slug = this.titleToSlug(title);
    await this.ensureProductSlugUnique(slug);
    const product = this.productRepository.create({
      categoryId: dto.categoryId,
      title,
      slug: slug || null,
      price: String(dto.price),
      description: dto.description?.trim() || null,
      soldCount: dto.soldCount ?? 0,
      inStock: dto.inStock ?? true,
      discountStartDate: dto.discountStartDate ?? null,
      discountEndDate: dto.discountEndDate ?? null,
      discountPrice: dto.discountPrice != null ? String(dto.discountPrice) : null,
      brandId: dto.brandId ?? null,
      createdBy: username ?? null,
    });
    await this.productRepository.save(product);
    if (dto.images?.length) {
      for (const img of dto.images) {
        const media = await this.mediaRepository.findOne({
          where: { id: img.mediaId, isDeleted: false },
        });
        if (!media) throw new NotFoundException(ErrorCode.MEDIA_NOT_FOUND);
      }
      const images = dto.images.map((img, index) =>
        this.productImageRepository.create({
          productId: product.id,
          mediaId: img.mediaId,
          isMain: img.isMain ?? index === 0,
          order: img.order ?? index,
          createdBy: username ?? null,
        }),
      );
      await this.productImageRepository.save(images);
    }
    return this.getById(product.id);
  }

  /** Bütün məhsullar – yalnız search və isDeleted. Pagination yox, array qaytarır. */
  async getAll(params: { search?: string; isDeleted?: boolean }) {
    const qb = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.images', 'images')
      .leftJoinAndSelect('images.media', 'media');

    if (params.isDeleted === true) {
      qb.andWhere('product.is_deleted = :isDeleted', { isDeleted: true });
    } else if (params.isDeleted === false) {
      qb.andWhere('product.is_deleted = :isDeleted', { isDeleted: false });
    }
    if (params.search?.trim()) {
      const search = `%${params.search.trim()}%`;
      qb.andWhere('(product.title ILIKE :search OR product.slug ILIKE :search)', { search });
    }

    qb.orderBy('product.createdAt', 'DESC').addOrderBy('product.id', 'ASC');
    const products = await qb.getMany();
    return products.map((p) => this.toProductResponse(p));
  }

  /** Option id-lərini feature_id-yə görə qruplaşdırır (eyni feature daxilində OR, fərqli feature-lar arasında AND). */
  private async getFeatureOptionGroups(optionIds: number[]): Promise<Map<number, number[]>> {
    if (!optionIds.length) return new Map();
    const options = await this.featureOptionRepository.find({
      where: optionIds.map((id) => ({ id })),
      select: { id: true, featureId: true },
    });
    const map = new Map<number, number[]>();
    for (const opt of options) {
      const list = map.get(opt.featureId) ?? [];
      list.push(opt.id);
      map.set(opt.featureId, list);
    }
    return map;
  }

  /** Verilən QueryBuilder-ə feature option filter əlavə edir (hər qrup üçün AND + IN subquery). */
  private applyFeatureOptionFilter(qb: ReturnType<Repository<Product>['createQueryBuilder']>, groups: Map<number, number[]>): void {
    let idx = 0;
    for (const optionIds of groups.values()) {
      if (!optionIds.length) continue;
      const param = `featureOptionIds_${idx}`;
      qb.andWhere(
        `product.id IN (SELECT pfo.product_id FROM product_feature_options pfo WHERE pfo.feature_option_id IN (:...${param}))`,
        { [param]: optionIds },
      );
      idx += 1;
    }
  }

  /** Səhifələnmiş siyahı – pagination, isDeleted, isActive, search, categorySlug, featureOptionIds, minPrice, maxPrice, brandId, inStock, sort. */
  async getFiltered(params: {
    page?: number;
    limit?: number;
    search?: string;
    isDeleted?: boolean;
    isActive?: boolean;
    categorySlug?: string;
    featureOptionIds?: number[];
    minPrice?: number;
    maxPrice?: number;
    brandId?: number;
    inStock?: boolean;
    sort?: 'a-z' | 'z-a' | 'createdAt';
  }) {
    const { page, limit } = normalizePagination(params);

    const featureGroups = (params.featureOptionIds?.length ?? 0) > 0
      ? await this.getFeatureOptionGroups(params.featureOptionIds!)
      : new Map<number, number[]>();

    const countQb = this.productRepository.createQueryBuilder('product');
    if (params.isDeleted === true) {
      countQb.andWhere('product.is_deleted = :isDeleted', { isDeleted: true });
    } else if (params.isDeleted === false) {
      countQb.andWhere('product.is_deleted = :isDeleted', { isDeleted: false });
    }
    if (params.isActive === true) countQb.andWhere('product.is_active = :isActive', { isActive: true });
    if (params.isActive === false) countQb.andWhere('product.is_active = :isActive', { isActive: false });
    if (params.search?.trim()) {
      const search = `%${params.search.trim()}%`;
      countQb.andWhere('(product.title ILIKE :search OR product.slug ILIKE :search)', { search });
    }
    if (params.categorySlug?.trim()) {
      countQb.leftJoin('product.category', 'countCategory');
      countQb.andWhere('countCategory.slug = :categorySlug', { categorySlug: params.categorySlug.trim() });
    }
    if (params.minPrice != null && params.minPrice >= 0) {
      countQb.andWhere('CAST(product.price AS DECIMAL(12,2)) >= :minPrice', { minPrice: params.minPrice });
    }
    if (params.maxPrice != null && params.maxPrice >= 0) {
      countQb.andWhere('CAST(product.price AS DECIMAL(12,2)) <= :maxPrice', { maxPrice: params.maxPrice });
    }
    if (params.brandId != null) {
      countQb.andWhere('product.brand_id = :brandId', { brandId: params.brandId });
    }
    if (params.inStock === true) {
      countQb.andWhere('product.in_stock = :inStock', { inStock: true });
    } else if (params.inStock === false) {
      countQb.andWhere('product.in_stock = :inStock', { inStock: false });
    }
    this.applyFeatureOptionFilter(countQb, featureGroups);
    const total = await countQb.getCount();

    const qb = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.images', 'images')
      .leftJoinAndSelect('images.media', 'media');

    if (params.isDeleted === true) {
      qb.andWhere('product.is_deleted = :isDeleted', { isDeleted: true });
    } else if (params.isDeleted === false) {
      qb.andWhere('product.is_deleted = :isDeleted', { isDeleted: false });
    }
    if (params.isActive === true) qb.andWhere('product.is_active = :isActive', { isActive: true });
    if (params.isActive === false) qb.andWhere('product.is_active = :isActive', { isActive: false });
    if (params.search?.trim()) {
      const search = `%${params.search.trim()}%`;
      qb.andWhere('(product.title ILIKE :search OR product.slug ILIKE :search)', { search });
    }
    if (params.categorySlug?.trim()) {
      qb.andWhere('category.slug = :categorySlug', { categorySlug: params.categorySlug.trim() });
    }
    if (params.minPrice != null && params.minPrice >= 0) {
      qb.andWhere('CAST(product.price AS DECIMAL(12,2)) >= :minPrice', { minPrice: params.minPrice });
    }
    if (params.maxPrice != null && params.maxPrice >= 0) {
      qb.andWhere('CAST(product.price AS DECIMAL(12,2)) <= :maxPrice', { maxPrice: params.maxPrice });
    }
    if (params.brandId != null) {
      qb.andWhere('product.brand_id = :brandId', { brandId: params.brandId });
    }
    if (params.inStock === true) {
      qb.andWhere('product.in_stock = :inStock', { inStock: true });
    } else if (params.inStock === false) {
      qb.andWhere('product.in_stock = :inStock', { inStock: false });
    }
    this.applyFeatureOptionFilter(qb, featureGroups);

    const sort = params.sort ?? 'createdAt';
    if (sort === 'a-z') {
      qb.orderBy('product.title', 'ASC').addOrderBy('product.id', 'ASC');
    } else if (sort === 'z-a') {
      qb.orderBy('product.title', 'DESC').addOrderBy('product.id', 'ASC');
    } else {
      qb.orderBy('product.createdAt', 'DESC').addOrderBy('product.id', 'ASC');
    }

    const data = await qb.skip((page - 1) * limit).take(limit).getMany();
    return toPaginatedResult(
      data.map((p) => this.toProductResponse(p)),
      total,
      page,
      limit,
    );
  }

  async getById(id: number) {
    const product = await this.productRepository.findOne({
      where: { id, isDeleted: false },
      relations: ['category', 'images', 'images.media', "brand"],
    });
    if (!product) throw new NotFoundException(ErrorCode.PRODUCT_NOT_FOUND);
    return this.toProductResponse(product);
  }

  /** Bir ProductImage → response obyektinə map (mainImage və images üçün eyni format) */
  private toImageResponse(img: ProductImage) {
    return {
      id: img.id,
      productId: img.productId,
      mediaId: img.mediaId,
      isMain: img.isMain,
      order: img.order,
      media: img.media
        ? {
            id: img.media.id,
            type: img.media.type,
            path: img.media.path,
            publicId: img.media.publicId,
            filename: img.media.filename,
            mimeType: img.media.mimeType,
            altText: img.media.altText,
            size: img.media.size,
          }
        : null,
    };
  }

  /** Audit sahələri (createdAt, updatedAt, isActive, isDeleted və s.) olmadan response */
  private toProductResponse(product: Product) {
    const imagesList = product.images || [];
    const images = imagesList.map((img) => this.toImageResponse(img));
    const mainImage = imagesList.find((img) => img.isMain);
    return {
      id: product.id,
      categoryId: product.categoryId,
      title: product.title,
      slug: product.slug,
      price: product.price,
      description: product.description,
      soldCount: product.soldCount,
      inStock: product.inStock,
      discountStartDate: product.discountStartDate,
      discountEndDate: product.discountEndDate,
      discountPrice: product.discountPrice,
      brandId: product.brandId,
      brandName: product.brand?.title,
      category: product.category
        ? {
            id: product.category.id,
            title: product.category.title,
            slug: product.category.slug,
            order: product.category.order,
            parentId: product.category.parentId,
            level: product.category.level,
            allowProducts: product.category.allowProducts,
          }
        : undefined,
      mainImage: mainImage ? this.toImageResponse(mainImage) : null,
      images,
    };
  }

  async update(id: number, dto: UpdateProductDto, username?: string) {
    const product = await this.productRepository.findOne({
      where: { id, isDeleted: false },
    });
    if (!product) throw new NotFoundException(ErrorCode.PRODUCT_NOT_FOUND);
    if (dto.title !== undefined) {
      product.title = dto.title.trim();
      product.slug = this.titleToSlug(product.title) || null;
      if (product.slug) await this.ensureProductSlugUnique(product.slug, id);
    }
    if (dto.price !== undefined) product.price = String(dto.price);
    if (dto.description !== undefined) product.description = dto.description?.trim() || null;
    if (dto.soldCount !== undefined) product.soldCount = dto.soldCount;
    if (dto.inStock !== undefined) product.inStock = dto.inStock;
    if (dto.discountStartDate !== undefined) product.discountStartDate = dto.discountStartDate ?? null;
    if (dto.discountEndDate !== undefined) product.discountEndDate = dto.discountEndDate ?? null;
    if (dto.discountPrice !== undefined) product.discountPrice = dto.discountPrice != null ? String(dto.discountPrice) : null;
    if (dto.brandId !== undefined) product.brandId = dto.brandId ?? null;
    if (dto.categoryId !== undefined && dto.categoryId != null) product.categoryId = dto.categoryId;
    if (dto.images !== undefined) {
      await this.productImageRepository.delete({ productId: id });
      if (dto.images.length) {
        for (const img of dto.images) {
          const media = await this.mediaRepository.findOne({
            where: { id: img.mediaId, isDeleted: false },
          });
          if (!media) throw new NotFoundException(ErrorCode.MEDIA_NOT_FOUND);
        }
        const images = dto.images.map((img, index) =>
          this.productImageRepository.create({
            productId: id,
            mediaId: img.mediaId,
            isMain: img.isMain ?? index === 0,
            order: img.order ?? index,
            createdBy: username ?? null,
          }),
        );
        await this.productImageRepository.save(images);
      }
    }
    if (username != null) product.updatedBy = username;
    product.updatedAt = new Date();
    await this.productRepository.save(product);
    return this.getById(id);
  }

  async remove(id: number, username?: string) {
    const product = await this.productRepository.findOne({
      where: { id, isDeleted: false },
    });
    if (!product) throw new NotFoundException(ErrorCode.PRODUCT_NOT_FOUND);
    product.isDeleted = true;
    if (username != null) product.updatedBy = username;
    product.updatedAt = new Date();
    await this.productRepository.save(product);
    return { message: 'Product deleted successfully' };
  }

  async assignFeatureOptions(productId: number, featureOptionIds: number[]) {
    const product = await this.productRepository.findOne({
      where: { id: productId, isDeleted: false },
    });
    if (!product) throw new NotFoundException(ErrorCode.PRODUCT_NOT_FOUND);
    const uniqueIds = [...new Set(featureOptionIds)];
    for (const optionId of uniqueIds) {
      const option = await this.featureOptionRepository.findOne({
        where: { id: optionId, isDeleted: false },
      });
      if (!option) throw new NotFoundException(ErrorCode.FEATURE_OPTION_NOT_FOUND);
    }
    await this.productFeatureOptionRepository.delete({ productId });
    const items = uniqueIds.map((featureOptionId) =>
      this.productFeatureOptionRepository.create({ productId, featureOptionId }),
    );
    await this.productFeatureOptionRepository.save(items);
    return this.getFeatureOptionsByProductId(productId);
  }

  async getFeatureOptionsByProductId(productId: number) {
    const list = await this.productFeatureOptionRepository.find({
      where: { productId },
      relations: ['featureOption', 'featureOption.feature'],
    });
    return list.map((pfo) => ({
      featureOptionId: pfo.featureOptionId,
      option: {
        id: pfo.featureOption.id,
        title: pfo.featureOption.title,
        slug: pfo.featureOption.slug,
        order: pfo.featureOption.order,
      },
      feature: {
        id: pfo.featureOption.feature.id,
        title: pfo.featureOption.feature.title,
        slug: pfo.featureOption.feature.slug,
      },
    }));
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

  private async ensureProductSlugUnique(slug: string, excludeId?: number): Promise<void> {
    if (!slug) return;
    const qb = this.productRepository
      .createQueryBuilder('p')
      .where('LOWER(TRIM(p.slug)) = LOWER(:slug)', { slug: slug.trim() })
      .andWhere('p.is_deleted = :isDeleted', { isDeleted: false });
    if (excludeId != null) qb.andWhere('p.id != :id', { id: excludeId });
    if (await qb.getOne()) throw new ConflictException(ErrorCode.PRODUCT_ALREADY_EXISTS);
  }
}
