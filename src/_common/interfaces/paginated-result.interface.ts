/** Paginasiya ilə siyahı cavabı üçün ümumi tip. */
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
