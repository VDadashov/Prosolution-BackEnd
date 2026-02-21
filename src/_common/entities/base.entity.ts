import { CreateDateColumn, Column } from 'typeorm';

/**
 * Bütün entity-lərdə istifadə üçün əsas sahələr:
 * createdAt, updatedAt (yalnız update/patch zamanı), createdBy, updatedBy (username, yalnız update zamanı), isActive, isDeleted.
 * - updatedAt / updatedBy: yaradılanda set olunmur; yalnız PUT/PATCH (və məntiqi yeniləmə, məs. soft delete) zamanı.
 */
export abstract class BaseEntity {
  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @Column({ type: 'timestamp', name: 'updated_at', nullable: true })
  updatedAt: Date | null;

  @Column({ type: 'varchar', length: 50, nullable: true, name: 'created_by' })
  createdBy: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true, name: 'updated_by' })
  updatedBy: string | null;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive: boolean;

  @Column({ type: 'boolean', default: false, name: 'is_deleted' })
  isDeleted: boolean;
}
