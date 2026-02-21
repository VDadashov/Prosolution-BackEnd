/**
 * Tətbiq üzrə xəta kodları
 * Innovative-Learning ilə uyğun format: [MODULE]_[ERROR_TYPE]_[DESCRIPTION]
 */
export enum ErrorCode {
  // Auth (AUTH_)
  AUTH_INVALID_CREDENTIALS = 'AUTH_INVALID_CREDENTIALS',
  AUTH_TOKEN_EXPIRED = 'AUTH_TOKEN_EXPIRED',
  AUTH_TOKEN_INVALID = 'AUTH_TOKEN_INVALID',
  AUTH_UNAUTHORIZED = 'AUTH_UNAUTHORIZED',
  AUTH_FORBIDDEN = 'AUTH_FORBIDDEN',
  AUTH_EMAIL_ALREADY_EXISTS = 'AUTH_EMAIL_ALREADY_EXISTS',
  AUTH_WEAK_PASSWORD = 'AUTH_WEAK_PASSWORD',
  AUTH_RESET_TOKEN_INVALID = 'AUTH_RESET_TOKEN_INVALID',
  AUTH_RESET_TOKEN_EXPIRED = 'AUTH_RESET_TOKEN_EXPIRED',

  // User (USER_)
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  USER_ALREADY_EXISTS = 'USER_ALREADY_EXISTS',

  // Category (CATEGORY_)
  CATEGORY_NOT_FOUND = 'CATEGORY_NOT_FOUND',
  CATEGORY_ALREADY_EXISTS = 'CATEGORY_ALREADY_EXISTS',
  CATEGORY_HAS_CHILDREN = 'CATEGORY_HAS_CHILDREN',
  CATEGORY_PARENT_IS_DESCENDANT = 'CATEGORY_PARENT_IS_DESCENDANT',

  // Feature (FEATURE_)
  FEATURE_NOT_FOUND = 'FEATURE_NOT_FOUND',
  FEATURE_ALREADY_EXISTS = 'FEATURE_ALREADY_EXISTS',
  FEATURE_OPTION_NOT_FOUND = 'FEATURE_OPTION_NOT_FOUND',
  FEATURE_OPTION_ALREADY_EXISTS = 'FEATURE_OPTION_ALREADY_EXISTS',

  // Product (PRODUCT_)
  PRODUCT_NOT_FOUND = 'PRODUCT_NOT_FOUND',
  PRODUCT_ALREADY_EXISTS = 'PRODUCT_ALREADY_EXISTS',
  CATEGORY_DOES_NOT_ALLOW_PRODUCTS = 'CATEGORY_DOES_NOT_ALLOW_PRODUCTS',

  // Media (MEDIA_)
  MEDIA_NOT_FOUND = 'MEDIA_NOT_FOUND',
  MEDIA_FILE_REQUIRED = 'MEDIA_FILE_REQUIRED',
  MEDIA_UPLOAD_FAILED = 'MEDIA_UPLOAD_FAILED',

  // Brand (BRAND_)
  BRAND_NOT_FOUND = 'BRAND_NOT_FOUND',
  BRAND_ALREADY_EXISTS = 'BRAND_ALREADY_EXISTS',

  // Partner (PARTNER_)
  PARTNER_NOT_FOUND = 'PARTNER_NOT_FOUND',
  PARTNER_ALREADY_EXISTS = 'PARTNER_ALREADY_EXISTS',

  // Slider (SLIDER_)
  SLIDER_NOT_FOUND = 'SLIDER_NOT_FOUND',
  SLIDER_ALREADY_EXISTS = 'SLIDER_ALREADY_EXISTS',

  // Page (PAGE_)
  PAGE_NOT_FOUND = 'PAGE_NOT_FOUND',
  PAGE_ALREADY_EXISTS = 'PAGE_ALREADY_EXISTS',

  // Section (SECTION_)
  SECTION_NOT_FOUND = 'SECTION_NOT_FOUND',

  // ContactUs (CONTACT_US_)
  CONTACT_US_NOT_FOUND = 'CONTACT_US_NOT_FOUND',

  // Validation (VALIDATION_)
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  VALIDATION_INVALID_EMAIL = 'VALIDATION_INVALID_EMAIL',
  VALIDATION_REQUIRED_FIELD = 'VALIDATION_REQUIRED_FIELD',
  VALIDATION_INVALID_RANGE = 'VALIDATION_INVALID_RANGE',

  // Database (DB_)
  DB_CONNECTION_FAILED = 'DB_CONNECTION_FAILED',
  DB_QUERY_FAILED = 'DB_QUERY_FAILED',
  DB_DUPLICATE_ENTRY = 'DB_DUPLICATE_ENTRY',
  DB_FOREIGN_KEY_VIOLATION = 'DB_FOREIGN_KEY_VIOLATION',
  DB_TRANSACTION_FAILED = 'DB_TRANSACTION_FAILED',

  // System (SYSTEM_)
  SYSTEM_INTERNAL_ERROR = 'SYSTEM_INTERNAL_ERROR',
  SYSTEM_SERVICE_UNAVAILABLE = 'SYSTEM_SERVICE_UNAVAILABLE',

  // Business (BUSINESS_)
  BUSINESS_INVALID_OPERATION = 'BUSINESS_INVALID_OPERATION',
}

/**
 * İstifadəçi üçün azərbaycanca xəta mesajları
 */
export const ErrorMessages: Record<ErrorCode, string> = {
  [ErrorCode.AUTH_INVALID_CREDENTIALS]: 'Email və ya şifrə yanlışdır',
  [ErrorCode.AUTH_TOKEN_EXPIRED]: 'Sessiya müddəti bitib. Yenidən daxil olun',
  [ErrorCode.AUTH_TOKEN_INVALID]: 'Token etibarsızdır',
  [ErrorCode.AUTH_UNAUTHORIZED]: 'Bu əməliyyat üçün giriş tələb olunur',
  [ErrorCode.AUTH_FORBIDDEN]: 'Bu əməliyyatı yerinə yetirmək üçün icazəniz yoxdur',
  [ErrorCode.AUTH_EMAIL_ALREADY_EXISTS]:
    'Bu email və ya istifadəçi adı artıq qeydiyyatdadır',
  [ErrorCode.AUTH_WEAK_PASSWORD]: 'Şifrə ən azı 6 simvol olmalıdır',
  [ErrorCode.AUTH_RESET_TOKEN_INVALID]: 'Şifrə sıfırlama linki etibarsızdır',
  [ErrorCode.AUTH_RESET_TOKEN_EXPIRED]: 'Şifrə sıfırlama linkinin müddəti bitib. Yenidən tələb edin',

  [ErrorCode.USER_NOT_FOUND]: 'İstifadəçi tapılmadı',
  [ErrorCode.USER_ALREADY_EXISTS]: 'Bu istifadəçi artıq mövcuddur',

  [ErrorCode.CATEGORY_NOT_FOUND]: 'Kateqoriya tapılmadı',
  [ErrorCode.CATEGORY_ALREADY_EXISTS]: 'Bu ad və ya slug ilə kateqoriya artıq mövcuddur',
  [ErrorCode.CATEGORY_HAS_CHILDREN]: 'Alt kateqoriyası olan kateqoriya silinə bilməz. Əvvəlcə alt kateqoriyaları silin və ya başqa kateqoriyaya köçürün',
  [ErrorCode.CATEGORY_PARENT_IS_DESCENDANT]: 'Öz alt kateqoriyanı (və ya onun altını) parent seçə bilməzsiniz',

  [ErrorCode.FEATURE_NOT_FOUND]: 'Xüsusiyyət tapılmadı',
  [ErrorCode.FEATURE_ALREADY_EXISTS]: 'Bu ad və ya slug ilə xüsusiyyət artıq mövcuddur',
  [ErrorCode.FEATURE_OPTION_NOT_FOUND]: 'Xüsusiyyət variantı tapılmadı',
  [ErrorCode.FEATURE_OPTION_ALREADY_EXISTS]: 'Bu variant artıq mövcuddur',

  [ErrorCode.PRODUCT_NOT_FOUND]: 'Məhsul tapılmadı',
  [ErrorCode.PRODUCT_ALREADY_EXISTS]: 'Bu ad və ya slug ilə məhsul artıq mövcuddur',
  [ErrorCode.CATEGORY_DOES_NOT_ALLOW_PRODUCTS]: 'Bu kateqoriyada məhsul yaradıla bilməz',

  [ErrorCode.MEDIA_NOT_FOUND]: 'Media tapılmadı',
  [ErrorCode.MEDIA_FILE_REQUIRED]: 'Fayl göndərilməyib',
  [ErrorCode.MEDIA_UPLOAD_FAILED]: 'Fayl yüklənərkən xəta baş verdi',

  [ErrorCode.BRAND_NOT_FOUND]: 'Brend tapılmadı',
  [ErrorCode.BRAND_ALREADY_EXISTS]: 'Bu ad və ya slug ilə brend artıq mövcuddur',

  [ErrorCode.PARTNER_NOT_FOUND]: 'Tərəfdaş tapılmadı',
  [ErrorCode.PARTNER_ALREADY_EXISTS]: 'Bu ad və ya slug ilə tərəfdaş artıq mövcuddur',

  [ErrorCode.SLIDER_NOT_FOUND]: 'Slayder tapılmadı',
  [ErrorCode.SLIDER_ALREADY_EXISTS]: 'Bu ad və ya slug ilə slayder artıq mövcuddur',

  [ErrorCode.PAGE_NOT_FOUND]: 'Səhifə tapılmadı',
  [ErrorCode.PAGE_ALREADY_EXISTS]: 'Bu slug ilə səhifə artıq mövcuddur',

  [ErrorCode.SECTION_NOT_FOUND]: 'Bölmə tapılmadı',

  [ErrorCode.CONTACT_US_NOT_FOUND]: 'Əlaqə mesajı tapılmadı',

  [ErrorCode.VALIDATION_FAILED]: 'Məlumatların yoxlanılması uğursuz oldu',
  [ErrorCode.VALIDATION_INVALID_EMAIL]: 'Etibarsız email formatı',
  [ErrorCode.VALIDATION_REQUIRED_FIELD]: 'Bu sahə mütləqdir',
  [ErrorCode.VALIDATION_INVALID_RANGE]: 'Dəyər etibarlı aralıqda olmalıdır',

  [ErrorCode.DB_CONNECTION_FAILED]: 'Verilənlər bazasına qoşulmaq mümkün olmadı',
  [ErrorCode.DB_QUERY_FAILED]: 'Verilənlər bazası əməliyyatı uğursuz oldu',
  [ErrorCode.DB_DUPLICATE_ENTRY]: 'Bu məlumat artıq mövcuddur',
  [ErrorCode.DB_FOREIGN_KEY_VIOLATION]: 'Əlaqəli məlumat mövcuddur',
  [ErrorCode.DB_TRANSACTION_FAILED]: 'Əməliyyat uğursuz oldu. Yenidən cəhd edin',

  [ErrorCode.SYSTEM_INTERNAL_ERROR]: 'Daxili server xətası baş verdi',
  [ErrorCode.SYSTEM_SERVICE_UNAVAILABLE]: 'Xidmət hazırda əlçatan deyil',

  [ErrorCode.BUSINESS_INVALID_OPERATION]: 'Bu əməliyyat icra edilə bilməz',
};
