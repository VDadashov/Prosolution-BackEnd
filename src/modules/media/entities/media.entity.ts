import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { BaseEntity } from '../../../_common/entities';
import { MediaType } from '../../../_common/enums/media-type.enum';

@Entity('media')
export class Media extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50 })
  type: MediaType;

  /** Saxlama yolu və ya tam URL (CDN/Cloudinary secure_url) */
  @Column({ type: 'varchar', length: 1000, name: 'path' })
  path: string;

  /** Cloudinary public_id — silmək üçün lazımdır; null ola bilər (lokal fayl) */
  @Column({ type: 'varchar', length: 255, nullable: true, name: 'public_id' })
  publicId: string | null;

  @Column({ type: 'varchar', length: 255, name: 'filename' })
  filename: string;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'mime_type' })
  mimeType: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'alt_text' })
  altText: string | null;

  /** Fayl ölçüsü (bayt) */
  @Column({ type: 'int', nullable: true })
  size: number | null;
}
