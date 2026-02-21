import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../_common/entities';
import { FeatureOption } from './feature-option.entity';
import { CategoryFeature } from './category-feature.entity';

@Entity('features')
export class Feature extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  title: string;

  @Column({ type: 'varchar', length: 120, unique: true, nullable: true })
  slug: string | null;

  @Column({ type: 'int', default: 0, name: 'sort_order' })
  order: number;

  @OneToMany(() => FeatureOption, (option) => option.feature)
  options: FeatureOption[];

  @OneToMany(() => CategoryFeature, (cf) => cf.feature)
  categoryFeatures: CategoryFeature[];
}
