import { PaginatedResult } from '../interfaces/paginated-result.interface';
import { PaginationQueryDto } from '../dto/pagination-query.dto';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

/** Query-dan page və limit-i normallaşdırır (dəyərlər aralığında saxlayır). */
export function normalizePagination(
  params?: Partial<Pick<PaginationQueryDto, 'page' | 'limit'>>,
): { page: number; limit: number } {
  const page = Math.max(1, params?.page ?? DEFAULT_PAGE);
  const limit = Math.min(MAX_LIMIT, Math.max(1, params?.limit ?? DEFAULT_LIMIT));
  return { page, limit };
}

/** Paginasiya cavabı yaradır. */
export function toPaginatedResult<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
): PaginatedResult<T> {
  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
  };
}
