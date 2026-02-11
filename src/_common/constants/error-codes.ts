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

  // User (USER_)
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  USER_ALREADY_EXISTS = 'USER_ALREADY_EXISTS',

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

  [ErrorCode.USER_NOT_FOUND]: 'İstifadəçi tapılmadı',
  [ErrorCode.USER_ALREADY_EXISTS]: 'Bu istifadəçi artıq mövcuddur',

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
