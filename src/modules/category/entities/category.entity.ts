import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../_common/entities';

@Entity('categories')
export class Category extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  title: string;

  /** Unikallıq yalnız is_deleted = false üçün tətbiq olunur (partial unique index – migration ilə). Silinmiş kateqoriya ilə eyni slug icazəlidir. */
  @Column({ type: 'varchar', length: 120, nullable: true })
  slug: string | null;

  @Column({ type: 'int', default: 0, name: 'sort_order' })
  order: number;

  @Column({ type: 'int', nullable: true, name: 'parent_id' })
  parentId: number | null;

  @Column({ type: 'int', default: 1 })
  level: number;

  /** true = bu kateqoriyada məhsul yaradıla bilər; false = yalnız konteyner, məhsul yox */
  @Column({ type: 'boolean', default: true, name: 'allow_products' })
  allowProducts: boolean;

  @ManyToOne(() => Category, (category) => category.children, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'parent_id' })
  parent: Category | null;

  @OneToMany(() => Category, (category) => category.parent)
  children: Category[];
}
