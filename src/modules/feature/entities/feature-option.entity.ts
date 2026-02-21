import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { BaseEntity } from '../../../_common/entities';
import { Feature } from './feature.entity';

@Entity('feature_options')
@Unique(['featureId', 'title'])
export class FeatureOption extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', name: 'feature_id' })
  featureId: number;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  slug: string | null;

  @Column({ type: 'int', default: 0, name: 'sort_order' })
  order: number;

  @ManyToOne(() => Feature, (feature) => feature.options, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'feature_id' })
  feature: Feature;
}
