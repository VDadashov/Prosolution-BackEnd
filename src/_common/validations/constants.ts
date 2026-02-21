/**
 * Təkrarlanan validation limitləri — bütün modullarda eyni rəqəmlər və mesajlar üçün.
 * DTO-larda @MaxLength(ValidationLengths.TITLE) kimi istifadə etmək olar.
 */
export const ValidationLengths = {
  /** Kateqoriya, Feature və s. title (məs. "Proqramlaşdırma") */
  TITLE: 100,
  /** Product title və bənzəri uzun adlar */
  TITLE_LONG: 255,
  /** Slug (URL) — Category, Feature */
  SLUG: 120,
  /** Slug və ya ID tipli string (məs. publicId) */
  SLUG_OR_ID: 255,
  /** Qısa mətn (altText, filename və s.) */
  SHORT_TEXT: 255,
  /** URL və ya fayl yolu (path) */
  PATH: 1000,
  /** Mime type */
  MIME_TYPE: 100,
  /** Təsvir, böyük mətn */
  DESCRIPTION: 10000,
  /** İstifadəçi adı, createdBy və s. */
  USERNAME: 50,
  /** Brand id və ya qısa identifikator */
  BRAND_ID: 100,
} as const;

/** Default validation mesajları (azərbaycanca) */
export const ValidationMessages = {
  REQUIRED: 'Bu sahə mütləqdir',
  MIN_LENGTH: (min: number) => `Ən azı ${min} simvol olmalıdır`,
  MAX_LENGTH: (max: number) => `Ən çoxu ${max} simvol ola bilər`,
  NOT_EMPTY_STRING: 'Boş ola bilməz',
  POSITIVE_ID: 'Müsbət tam ədəd olmalıdır',
  NON_NEGATIVE: 'Mənfi ola bilməz',
} as const;
