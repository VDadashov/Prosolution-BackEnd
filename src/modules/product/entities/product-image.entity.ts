import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../_common/entities';
import { Product } from './product.entity';
import { Media } from '../../media/entities/media.entity';

@Entity('product_images')
export class ProductImage extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', name: 'product_id' })
  productId: number;

  /** Nullable: köhnə sətirlər (image_path dövründən) media_id-siz qala bilər; yeni yazılar üçün məcburidir. */
  @Column({ type: 'int', name: 'media_id', nullable: true })
  mediaId: number | null;

  @Column({ type: 'boolean', default: false, name: 'is_main' })
  isMain: boolean;

  @Column({ type: 'int', default: 0, name: 'sort_order' })
  order: number;

  @ManyToOne(() => Product, (p) => p.images, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @ManyToOne(() => Media, { onDelete: 'RESTRICT', nullable: true })
  @JoinColumn({ name: 'media_id' })
  media: Media | null;
}
