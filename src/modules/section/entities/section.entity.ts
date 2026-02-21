import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../_common/entities';
import { Page } from '../../page/entities/page.entity';

export interface MultiLanguageText {
  az: string;
  en?: string;
  ru?: string;
}

export interface MediaFile {
  url: string;
  type: 'image' | 'video';
  size?: number;
  mimeType?: string;
  alt?: MultiLanguageText;
}

@Entity('sections')
export class Section extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50 })
  name: string;

  @Column({ type: 'jsonb' })
  title: MultiLanguageText;

  @Column({ type: 'jsonb' })
  description: MultiLanguageText;

  @Column({ type: 'jsonb', nullable: true })
  media: MediaFile | null;

  @Column({ type: 'jsonb', nullable: true })
  additionalData: Record<string, unknown> | null;

  @Column({ type: 'int', default: 0, name: 'sort_order' })
  order: number;

  @Column({
    type: 'varchar',
    length: 30,
    default: 'content',
  })
  type:
    | 'hero'
    | 'content'
    | 'about'
    | 'services'
    | 'gallery'
    | 'contact'
    | 'footer'
    | 'navbar'
    | 'testimonial'
    | 'blog'
    | 'custom';

  @Column({ name: 'page_id' })
  pageId: number;

  @Column({ type: 'varchar', length: 10, default: 'both' })
  visibility: 'desktop' | 'mobile' | 'both';

  @ManyToOne(() => Page, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'page_id' })
  page: Page;
}
