import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { Feature } from './feature.entity';
import { Category } from '../../category/entities/category.entity';

@Entity('category_features')
@Unique(['categoryId', 'featureId'])
export class CategoryFeature {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', name: 'category_id' })
  categoryId: number;

  @Column({ type: 'int', name: 'feature_id' })
  featureId: number;

  @Column({ type: 'int', default: 0, name: 'sort_order' })
  order: number;

  @ManyToOne(() => Category, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @ManyToOne(() => Feature, (feature) => feature.categoryFeatures, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'feature_id' })
  feature: Feature;
}
