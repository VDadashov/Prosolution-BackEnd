import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContactUs } from './entities/contact-us.entity';
import { CreateContactUsDto } from './dto/create-contact-us.dto';
import { NotFoundException } from '../../_common/exceptions';
import { ErrorCode } from '../../_common/constants/error-codes';
import { normalizePagination, toPaginatedResult } from '../../_common/utils/pagination.util';

@Injectable()
export class ContactUsService {
  constructor(
    @InjectRepository(ContactUs)
    private readonly contactUsRepository: Repository<ContactUs>,
  ) {}

  async create(dto: CreateContactUsDto) {
    const entity = this.contactUsRepository.create({
      firstName: dto.firstName.trim(),
      lastName: dto.lastName.trim(),
      email: dto.email.trim().toLowerCase(),
      phoneNumber: dto.phoneNumber?.trim() || null,
      message: dto.message.trim(),
    });
    await this.contactUsRepository.save(entity);
    return this.toResponse(entity);
  }

  /** Bütün əlaqə mesajları – yalnız search, isDeleted (pagination yox). */
  async getAll(params: { search?: string; isDeleted?: boolean }) {
    const qb = this.contactUsRepository.createQueryBuilder('contact_us');
    if (params.isDeleted === true) {
      qb.andWhere('contact_us.is_deleted = :isDeleted', { isDeleted: true });
    } else if (params.isDeleted === false) {
      qb.andWhere('contact_us.is_deleted = :isDeleted', { isDeleted: false });
    }
    if (params.search?.trim()) {
      const search = `%${params.search.trim()}%`;
      qb.andWhere(
        '(contact_us.first_name ILIKE :search OR contact_us.last_name ILIKE :search OR contact_us.email ILIKE :search)',
        { search },
      );
    }
    qb.orderBy('contact_us.created_at', 'DESC').addOrderBy('contact_us.id', 'ASC');
    const list = await qb.getMany();
    return list.map((row) => this.toResponse(row));
  }

  /** Səhifələnmiş siyahı – pagination, search, isDeleted, sort. */
  async getFiltered(params: {
    page?: number;
    limit?: number;
    search?: string;
    isDeleted?: boolean;
    sort?: 'createdAt' | 'createdAtAsc';
  }) {
    const { page, limit } = normalizePagination(params);
    const countQb = this.contactUsRepository.createQueryBuilder('contact_us');
    if (params.isDeleted === true) {
      countQb.andWhere('contact_us.is_deleted = :isDeleted', { isDeleted: true });
    } else if (params.isDeleted === false) {
      countQb.andWhere('contact_us.is_deleted = :isDeleted', { isDeleted: false });
    }
    if (params.search?.trim()) {
      const search = `%${params.search.trim()}%`;
      countQb.andWhere(
        '(contact_us.first_name ILIKE :search OR contact_us.last_name ILIKE :search OR contact_us.email ILIKE :search)',
        { search },
      );
    }
    const total = await countQb.getCount();

    const qb = this.contactUsRepository.createQueryBuilder('contact_us');
    if (params.isDeleted === true) {
      qb.andWhere('contact_us.is_deleted = :isDeleted', { isDeleted: true });
    } else if (params.isDeleted === false) {
      qb.andWhere('contact_us.is_deleted = :isDeleted', { isDeleted: false });
    }
    if (params.search?.trim()) {
      const search = `%${params.search.trim()}%`;
      qb.andWhere(
        '(contact_us.first_name ILIKE :search OR contact_us.last_name ILIKE :search OR contact_us.email ILIKE :search)',
        { search },
      );
    }
    const sort = params.sort ?? 'createdAt';
    if (sort === 'createdAtAsc') {
      qb.orderBy('contact_us.created_at', 'ASC').addOrderBy('contact_us.id', 'ASC');
    } else {
      qb.orderBy('contact_us.created_at', 'DESC').addOrderBy('contact_us.id', 'ASC');
    }
    const data = await qb.skip((page - 1) * limit).take(limit).getMany();
    return toPaginatedResult(
      data.map((row) => this.toResponse(row)),
      total,
      page,
      limit,
    );
  }

  async getById(id: number) {
    const row = await this.contactUsRepository.findOne({ where: { id } });
    if (!row) throw new NotFoundException(ErrorCode.CONTACT_US_NOT_FOUND);
    return this.toResponse(row);
  }

  /** Mesajı oxunmuş kimi işarələ. */
  async markAsRead(id: number) {
    const row = await this.contactUsRepository.findOne({ where: { id } });
    if (!row) throw new NotFoundException(ErrorCode.CONTACT_US_NOT_FOUND);
    row.isRead = true;
    await this.contactUsRepository.save(row);
    return this.toResponse(row);
  }

  /** Oxunmamış mesajların sayı (is_deleted = false). */
  async getUnreadCount(): Promise<number> {
    return this.contactUsRepository.count({
      where: { isRead: false, isDeleted: false },
    });
  }

  /** Soft delete – isDeleted = true (DB-də qalır). */
  async remove(id: number, username?: string): Promise<{ message: string }> {
    const row = await this.contactUsRepository.findOne({ where: { id } });
    if (!row) throw new NotFoundException(ErrorCode.CONTACT_US_NOT_FOUND);
    if (row.isDeleted) throw new NotFoundException(ErrorCode.CONTACT_US_NOT_FOUND);
    row.isDeleted = true;
    if (username != null) row.updatedBy = username;
    row.updatedAt = new Date();
    await this.contactUsRepository.save(row);
    return { message: 'ContactUs deleted successfully' };
  }

  private toResponse(row: ContactUs) {
    return {
      id: row.id,
      firstName: row.firstName,
      lastName: row.lastName,
      email: row.email,
      phoneNumber: row.phoneNumber,
      message: row.message,
      isRead: row.isRead,
      createdAt: row.createdAt,
    };
  }
}
