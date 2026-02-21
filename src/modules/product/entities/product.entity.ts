import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../_common/entities';
import { Category } from '../../category/entities/category.entity';
import { Brand } from '../../brand/entities/brand.entity';
import { ProductFeatureOption } from './product-feature-option.entity';
import { ProductImage } from './product-image.entity';

@Entity('products')
export class Product extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', name: 'category_id' })
  categoryId: number;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'varchar', length: 300, unique: true, nullable: true })
  slug: string | null;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  price: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'int', default: 0, name: 'sold_count' })
  soldCount: number;

  @Column({ type: 'boolean', default: true, name: 'in_stock' })
  inStock: boolean;

  @Column({ type: 'timestamp', nullable: true, name: 'discount_start_date' })
  discountStartDate: Date | null;

  @Column({ type: 'timestamp', nullable: true, name: 'discount_end_date' })
  discountEndDate: Date | null;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true, name: 'discount_price' })
  discountPrice: string | null;

  @Column({ type: 'int', nullable: true, name: 'brand_id' })
  brandId: number | null;

  @ManyToOne(() => Category, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @ManyToOne(() => Brand, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'brand_id' })
  brand: Brand | null;

  @OneToMany(() => ProductFeatureOption, (pfo) => pfo.product)
  productFeatureOptions: ProductFeatureOption[];

  @OneToMany(() => ProductImage, (img) => img.product)
  images: ProductImage[];
}
