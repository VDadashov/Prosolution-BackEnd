import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Section } from './entities/section.entity';
import { Page } from '../page/entities/page.entity';
import { NotFoundException } from '../../_common/exceptions';
import { ErrorCode } from '../../_common/constants/error-codes';
import type { MultiLanguageText, MediaFile } from './entities/section.entity';

@Injectable()
export class SectionService {
  constructor(
    @InjectRepository(Section)
    private readonly sectionRepository: Repository<Section>,
    @InjectRepository(Page)
    private readonly pageRepository: Repository<Page>,
  ) {}

  private getTranslatedField(field: MultiLanguageText | undefined, lang: string): string {
    if (!field) return '';
    switch (lang) {
      case 'en':
        return (field as MultiLanguageText).en ?? (field as MultiLanguageText).az ?? '';
      case 'ru':
        return (field as MultiLanguageText).ru ?? (field as MultiLanguageText).az ?? '';
      default:
        return (field as MultiLanguageText).az ?? '';
    }
  }

  private filterAdditionalDataForLanguage(additionalData: Record<string, unknown> | null, lang: string): Record<string, unknown> | null {
    if (!additionalData) return null;
    const filtered = { ...additionalData };
    Object.keys(filtered).forEach((key) => {
      const val = filtered[key];
      if (val && typeof val === 'object' && !Array.isArray(val) && (val as Record<string, unknown>)[lang] !== undefined) {
        filtered[key] = (val as Record<string, unknown>)[lang];
      }
    });
    return filtered;
  }

  async create(
    dto: {
      name: string;
      type: Section['type'];
      title: MultiLanguageText;
      description: MultiLanguageText;
      pageId: number;
      order?: number;
      visibility?: 'desktop' | 'mobile' | 'both';
      isActive?: boolean;
      media?: MediaFile | Record<string, unknown> | null;
      additionalData?: Record<string, unknown> | null;
    },
    username?: string,
  ): Promise<Section> {
    const page = await this.pageRepository.findOne({
      where: { id: dto.pageId, isDeleted: false },
    });
    if (!page) throw new NotFoundException(ErrorCode.PAGE_NOT_FOUND);

    let order = dto.order;
    if (order === undefined) {
      const last = await this.sectionRepository.findOne({
        where: { pageId: dto.pageId, isDeleted: false },
        order: { order: 'DESC' },
      });
      order = last ? last.order + 1 : 0;
    }

    const section = this.sectionRepository.create({
      name: dto.name.trim(),
      type: dto.type,
      title: dto.title,
      description: dto.description,
      pageId: dto.pageId,
      order,
      visibility: dto.visibility ?? 'both',
      isActive: dto.isActive ?? true,
      media: dto.media ?? null,
      additionalData: dto.additionalData ?? null,
      createdBy: username ?? null,
    });
    return this.sectionRepository.save(section);
  }

  async findAllWithSelectedLanguage(
    pageId?: number,
    type?: string,
    acceptLanguage: string = 'az',
  ): Promise<Record<string, unknown>[]> {
    const where: { isActive: boolean; isDeleted: boolean; pageId?: number; type?: Section['type'] } = {
      isActive: true,
      isDeleted: false,
    };
    if (pageId != null) where.pageId = pageId;
    if (type) where.type = type as Section['type'];

    const sections = await this.sectionRepository.find({
      where,
      order: { order: 'ASC', createdAt: 'DESC' },
    });

    return sections.map((section) => ({
      id: section.id,
      name: section.name,
      type: section.type,
      order: section.order,
      pageId: section.pageId,
      isActive: section.isActive,
      visibility: section.visibility,
      createdAt: section.createdAt,
      updatedAt: section.updatedAt,
      title: this.getTranslatedField(section.title, acceptLanguage),
      description: this.getTranslatedField(section.description, acceptLanguage),
      media: section.media
        ? {
            ...section.media,
            alt: (section.media as MediaFile).alt
              ? this.getTranslatedField((section.media as MediaFile).alt, acceptLanguage)
              : '',
          }
        : section.media,
      additionalData: this.filterAdditionalDataForLanguage(section.additionalData, acceptLanguage),
    }));
  }

  async findAllForAdmin(): Promise<Section[]> {
    return this.sectionRepository.find({
      where: { isDeleted: false },
      order: { order: 'ASC', createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Section> {
    const section = await this.sectionRepository.findOne({
      where: { id, isDeleted: false },
    });
    if (!section) throw new NotFoundException(ErrorCode.SECTION_NOT_FOUND);
    return section;
  }

  async update(
    id: number,
    dto: Partial<{
      name: string;
      type: Section['type'];
      title: MultiLanguageText;
      description: MultiLanguageText;
      order: number;
      visibility: 'desktop' | 'mobile' | 'both';
      isActive: boolean;
      media: MediaFile | Record<string, unknown> | null;
      additionalData: Record<string, unknown> | null;
    }>,
    username?: string,
  ): Promise<Section> {
    const section = await this.findOne(id);
    if (dto.name !== undefined) section.name = dto.name.trim();
    if (dto.type !== undefined) section.type = dto.type;
    if (dto.title !== undefined) section.title = dto.title;
    if (dto.description !== undefined) section.description = dto.description;
    if (dto.order !== undefined) section.order = dto.order;
    if (dto.visibility !== undefined) section.visibility = dto.visibility;
    if (dto.isActive !== undefined) section.isActive = dto.isActive;
    if (dto.media !== undefined) section.media = dto.media as MediaFile | null;
    if (dto.additionalData !== undefined) section.additionalData = dto.additionalData;
    if (username != null) section.updatedBy = username;
    section.updatedAt = new Date();
    return this.sectionRepository.save(section);
  }

  async remove(id: number, username?: string): Promise<{ message: string }> {
    const section = await this.findOne(id);
    section.isDeleted = true;
    if (username != null) section.updatedBy = username;
    section.updatedAt = new Date();
    await this.sectionRepository.save(section);
    return { message: 'Section deleted successfully' };
  }
}
