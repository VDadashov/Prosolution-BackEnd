import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../_common/entities';
import { Media } from '../../media/entities/media.entity';

@Entity('sliders')
export class Slider extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  title: string;

  @Column({ type: 'varchar', length: 120, unique: true, nullable: true })
  slug: string | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'int', default: 0, name: 'sort_order' })
  order: number;

  @Column({ type: 'int', nullable: true, name: 'media_id' })
  mediaId: number | null;

  @ManyToOne(() => Media, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'media_id' })
  media: Media | null;
}
