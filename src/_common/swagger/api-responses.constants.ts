/**
 * Swagger @ApiResponse üçün ümumi status və təsvirlər.
 * Bütün error response-lar _common/exceptions (BaseException) və HttpAllExceptionsFilter formatına uyğundur.
 * Controller-də: @ApiResponse(ApiResponses.created('Slider'))
 */

/** Common exception cavabı: success, errorCode, statusCode, message, timestamp, path (BaseException.getErrorResponse + path) */
const errorResponseSchema = (exampleErrorCode: string, exampleMessage: string) => ({
  type: 'object' as const,
  properties: {
    success: { type: 'boolean' as const, example: false },
    errorCode: { type: 'string' as const, example: exampleErrorCode },
    statusCode: { type: 'number' as const },
    message: { type: 'string' as const, example: exampleMessage },
    timestamp: { type: 'string' as const, format: 'date-time' as const },
    path: { type: 'string' as const },
    details: { type: 'object' as const, description: 'Optional, məs. validationErrors' },
  },
});

export const ApiResponses = {
  /** 400 – DTO/validation xətaları (errorCode: VALIDATION_FAILED, details.validationErrors) */
  validationFailed: () =>
    ({
      status: 400,
      description: 'Validation failed (DTO / class-validator). errorCode: VALIDATION_FAILED',
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          errorCode: { type: 'string', example: 'VALIDATION_FAILED' },
          statusCode: { type: 'number', example: 400 },
          message: { type: 'string', example: 'Məlumatların yoxlanılması uğursuz oldu' },
          timestamp: { type: 'string', format: 'date-time' },
          path: { type: 'string' },
          details: {
            type: 'object',
            properties: {
              validationErrors: {
                type: 'array',
                items: { type: 'string' },
                description: 'class-validator və ya ValidationException mesajları',
              },
            },
          },
        },
      },
    } as const),

  /** POST – 201 Created */
  created: (entityName: string) =>
    ({ status: 201, description: `${entityName} created` } as const),

  /** GET list – 200 */
  list: (entityName: string) =>
    ({ status: 200, description: `${entityName}[]` } as const),

  /** GET one – 200 */
  one: (entityName: string) =>
    ({ status: 200, description: entityName } as const),

  /** PUT – 200 Updated */
  updated: (entityName: string) =>
    ({ status: 200, description: `${entityName} updated` } as const),

  /** DELETE – 200 Deleted */
  deleted: (entityName: string) =>
    ({ status: 200, description: `${entityName} deleted` } as const),

  /** 404 – Resurs tapılmadı (BaseException formatı: success, errorCode, statusCode, message, timestamp, path) */
  notFound: (entityName: string) =>
    ({
      status: 404,
      description: `${entityName} not found`,
      schema: errorResponseSchema('CATEGORY_NOT_FOUND', 'Kateqoriya tapılmadı'),
    } as const),

  /** 404 – Media tapılmadı (mediaId etibarsız) */
  mediaNotFound: () =>
    ({
      status: 404,
      description: 'Media not found if mediaId invalid',
      schema: errorResponseSchema('MEDIA_NOT_FOUND', 'Media tapılmadı'),
    } as const),

  /** 404 – Resurs və ya Media tapılmadı (update zamanı) */
  notFoundOrMediaNotFound: (entityName: string) =>
    ({
      status: 404,
      description: `${entityName} or Media not found`,
      schema: errorResponseSchema('BRAND_NOT_FOUND', 'Brend və ya Media tapılmadı'),
    } as const),

  /** 409 – Title və ya slug artıq mövcuddur */
  conflictTitleSlug: () =>
    ({
      status: 409,
      description: 'Title or slug already exists',
      schema: errorResponseSchema('CATEGORY_ALREADY_EXISTS', 'Bu ad və ya slug ilə kateqoriya artıq mövcuddur'),
    } as const),

  /** 422 – Biznes qaydası (məs. category does not allow products) */
  unprocessable: (description: string) =>
    ({
      status: 422,
      description,
      schema: errorResponseSchema('CATEGORY_DOES_NOT_ALLOW_PRODUCTS', description),
    } as const),

  /** 401 – Token yoxdur, etibarsız və ya müddəti bitib (JWT) */
  unauthorized: () =>
    ({
      status: 401,
      description: 'Unauthorized – token missing, invalid or expired',
      schema: errorResponseSchema('AUTH_UNAUTHORIZED', 'Bu əməliyyat üçün giriş tələb olunur'),
    } as const),

  /** 403 – Rol icazəsi çatışmır */
  forbidden: () =>
    ({
      status: 403,
      description: 'Forbidden – insufficient role',
      schema: errorResponseSchema('AUTH_FORBIDDEN', 'Bu əməliyyatı yerinə yetirmək üçün icazəniz yoxdur'),
    } as const),

  /** 200 – Səhifələnmiş siyahı (schema: data, total, page, limit, totalPages) */
  paginated: (schemaName: string) =>
    ({
      status: 200,
      description: 'Paginated list',
      schema: {
        type: 'object',
        properties: {
          data: { type: 'array', items: { $ref: `#/components/schemas/${schemaName}` } },
          total: { type: 'number' },
          page: { type: 'number' },
          limit: { type: 'number' },
          totalPages: { type: 'number' },
        },
      },
    } as const),
} as const;
