import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Page } from './entities/page.entity';
import { NotFoundException, ConflictException } from '../../_common/exceptions';
import { ErrorCode } from '../../_common/constants/error-codes';

@Injectable()
export class PageService {
  constructor(
    @InjectRepository(Page)
    private readonly pageRepository: Repository<Page>,
  ) {}

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .normalize('NFC')
      .replace(/\s+/g, '-')
      .replace(/[^\u0061-\u007a0-9\u00e0-\u00ff\u015f\u0131\u0259\u011f\-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || '';
  }

  async create(dto: { title: string; isActive?: boolean }, username?: string): Promise<Page> {
    const title = dto.title.trim();
    const slug = this.slugify(title);
    if (!slug) throw new ConflictException(ErrorCode.PAGE_ALREADY_EXISTS);

    const existing = await this.pageRepository.findOne({
      where: { slug, isDeleted: false },
    });
    if (existing) throw new ConflictException(ErrorCode.PAGE_ALREADY_EXISTS);

    const page = this.pageRepository.create({
      title,
      slug,
      isActive: dto.isActive ?? true,
      createdBy: username ?? null,
    });
    return this.pageRepository.save(page);
  }

  async findAll(): Promise<{ id: number; title: string; slug: string; isActive: boolean }[]> {
    const pages = await this.pageRepository.find({
      where: { isActive: true, isDeleted: false },
      order: { id: 'DESC' },
    });
    return pages.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      isActive: p.isActive,
    }));
  }

  async findOne(id: number) {
    const page = await this.pageRepository.findOne({
      where: { id, isActive: true, isDeleted: false },
    });
    if (!page) throw new NotFoundException(ErrorCode.PAGE_NOT_FOUND);
    return {
      id: page.id,
      title: page.title,
      slug: page.slug,
      isActive: page.isActive,
    };
  }

  async findAllForAdmin(): Promise<Page[]> {
    return this.pageRepository.find({
      where: { isDeleted: false },
      order: { id: 'DESC' },
    });
  }

  async findOneForAdmin(id: number): Promise<Page> {
    const page = await this.pageRepository.findOne({
      where: { id, isDeleted: false },
    });
    if (!page) throw new NotFoundException(ErrorCode.PAGE_NOT_FOUND);
    return page;
  }

  async update(
    id: number,
    dto: { title?: string; isActive?: boolean },
    username?: string,
  ): Promise<Page> {
    const page = await this.pageRepository.findOne({
      where: { id, isDeleted: false },
    });
    if (!page) throw new NotFoundException(ErrorCode.PAGE_NOT_FOUND);

    if (dto.title !== undefined) {
      const title = dto.title.trim();
      const slug = this.slugify(title);
      if (slug) {
        const existing = await this.pageRepository.findOne({
          where: { slug, isDeleted: false },
        });
        if (existing && existing.id !== id) throw new ConflictException(ErrorCode.PAGE_ALREADY_EXISTS);
        page.title = title;
        page.slug = slug;
      }
    }
    if (dto.isActive !== undefined) page.isActive = dto.isActive;
    if (username != null) page.updatedBy = username;
    page.updatedAt = new Date();
    return this.pageRepository.save(page);
  }

  async remove(id: number, username?: string): Promise<{ message: string }> {
    const page = await this.pageRepository.findOne({
      where: { id, isDeleted: false },
    });
    if (!page) throw new NotFoundException(ErrorCode.PAGE_NOT_FOUND);
    page.isDeleted = true;
    if (username != null) page.updatedBy = username;
    page.updatedAt = new Date();
    await this.pageRepository.save(page);
    return { message: 'Page deleted successfully' };
  }
}
