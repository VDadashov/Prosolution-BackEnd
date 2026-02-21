import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { Product } from './product.entity';
import { FeatureOption } from '../../feature/entities/feature-option.entity';

@Entity('product_feature_options')
@Unique(['productId', 'featureOptionId'])
export class ProductFeatureOption {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', name: 'product_id' })
  productId: number;

  @Column({ type: 'int', name: 'feature_option_id' })
  featureOptionId: number;

  @ManyToOne(() => Product, (product) => product.productFeatureOptions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @ManyToOne(() => FeatureOption, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'feature_option_id' })
  featureOption: FeatureOption;
}
