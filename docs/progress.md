## Layihə İrəliləyiş Gündəliyi

Bu fayl, backend inkişaf prosesindəki mərhələləri xronoloji olaraq qeyd etmək üçün istifadə olunur.

### Şablon
- Tarix: YYYY-MM-DD
- Mərhələ: (Dizayn / Tətbiq / Test / İcmal / Buraxılış)
- Məzmun: Qısa izah
- Görülən işlər:
  - maddə 1
  - maddə 2
- Qeydlər/Risklər: (əgər varsa)

---

### 2026-02-11 — Layihə başlanğıcı və NestJS qurulması
- Mərhələ: Tətbiq
- Məzmun: Prosolution backend-in ilkin qurulması
- Görülən işlər:
  - NestJS layihəsi yaradıldı (TypeScript, TypeORM, PostgreSQL)
  - ConfigModule, database.config (env əsaslı)
  - Swagger inteqrasiyası (`/api`), Bearer JWT
  - ValidationPipe (whitelist, forbidNonWhitelisted, transform)
  - Auth modulu: register, login, change-password
  - User entity (users cədvəli), şifrə yalnız hash saxlanılır
  - JWT Strategy, JwtAuthGuard
  - Qeydiyyatda e-poçt ilə müvəqqəti şifrə göndərmə (nodemailer)
- Qeydlər/Risklər:
  - Production-da `synchronize` söndürülməlidir; JWT_SECRET və DB/EMAIL env təyin olunmalıdır

### 2026-02-11 — Exception sistemi və ErrorCode
- Mərhələ: Tətbiq
- Məzmun: Mərkəzləşdirilmiş xəta idarəetməsi (Innovative-Learning ilə uyğun)
- Görülən işlər:
  - `_common/constants/error-codes.ts` – ErrorCode enum və ErrorMessages (azərbaycanca)
  - `_common/exceptions/` – BaseException (errorCode əsaslı), BusinessException, ConflictException, UnauthorizedException, ValidationException, DatabaseException, DatabaseConnectionException
  - BaseException: getErrorResponse(), setPath(); PostgreSQL xəta kodları map (DatabaseException.fromDatabaseError), connection xətaları (DatabaseConnectionException.fromConnectionError)
  - HttpAllExceptionsFilter – bütün xətaları vahid formatda cavablayır, requestId, production-da sensitiv məlumat silinir
  - Auth servis və controller custom exception + ErrorCode ilə yeniləndi
- Qeydlər/Risklər:
  - Lazım olanda NotFoundException, ForbiddenException və createValidationException əlavə edilə bilər

### 2026-02-11 — DTO validasiya və təhlükəsizlik
- Mərhələ: Tətbiq
- Məzmun: DTO validasiya və təkrar qeydiyyat yoxlaması
- Görülən işlər:
  - RegisterDto, LoginDto, ChangePasswordDto – class-validator (IsEmail, IsNotEmpty, MinLength və s.)
  - Register-də email/username təkrar yoxlaması; ConflictException
  - E-poçt göndərmə uğursuz olsa belə qeydiyyat 201 qaytarır, xəta loglanır
- Qeydlər/Risklər: —

### 2026-02-11 — Sənədləşmə (docs)
- Mərhələ: İcmal
- Məzmun: Innovative-Learning ilə eyni strukturdə docs qovluğu
- Görülən işlər:
  - `docs/ARCHITECTURE.md` – arxitektura, error handling, validation, code organization, best practices
  - `docs/progress.md` – irəliləyiş gündəliyi (şablon + prosolution mərhələləri)
  - `docs/database-schema.md` – veritabanı sxemi (users cədvəli, DBML üslubu)
- Qeydlər/Risklər: —

### 2026-02-11 — BaseEntity və Category modulu
- Mərhələ: Tətbiq
- Məzmun: Ümumi əsas entity, Category CRUD, ağac strukturu, slug, guard
- Görülən işlər:
  - **BaseEntity** (`_common/entities/base.entity.ts`): createdAt, updatedAt, createdBy, updatedBy, isActive, isDeleted. Bütün entity-lər üçün əsas.
  - **Category entity**: title, slug, order (sort_order), parentId, level, allowProducts; parent/children relation; BaseEntity extend.
  - **User entity**: BaseEntity extend (createdAt, updatedAt, createdBy, updatedBy, isActive, isDeleted).
  - **Category slug**: POST-da slug göndərilmir; title əsasında avtomatik (titleToSlug). Azərbaycan/Türk hərfləri transliterasiya: ş→s, ı→i, ə→e və s.
  - **Category API**: POST (create), PUT by-id/:id (update), DELETE by-id/:id (soft delete). POST/PUT/DELETE yalnız admin və superAdmin (RolesGuard + @Roles).
  - **GET /categories**: yalnız search, isDeleted; cavab Category[] (pagination yox).
  - **GET /categories/filtered**: pagination, isDeleted, level, parentId, search, sort. sort = a-z | z-a | order | createdAt (ayrı order parametri yoxdur).
  - **RequestWithUser** (`_common/interfaces`): Express Request + user (JWT payload); Category controller-da req.user tipi üçün.
  - **description** Category-dan tamamilə çıxarıldı.
- Qeydlər/Risklər:
  - DB-də categories/users cədvəllərinə yeni sütunlar (BaseEntity, title, order, level, isActive, isDeleted və s.) əlavə olunmalıdır; migration və ya sync.

### 2026-02-21 — Slider və Page yeniləmələri
- Mərhələ: Tətbiq
- Məzmun: Slider filtered cavabına isActive əlavəsi; Page modulunda multilanguage ləğvi
- Görülən işlər:
  - **Slider**: `toSliderResponse`-da `isActive` sahəsi əlavə olundu; getFiltered və getAll/getById cavablarında hər item üçün `isActive` qaytarılır.
  - **Page — multilanguage ləğv**: Səhifə başlığı artıq tək dildə (string). Entity-də `title` jsonb → varchar(255); `MultiLanguageText` interface silindi.
  - **Page DTO**: CreatePageDto/UpdatePageDto-da `title` tək string (MaxLength 255); `multi-language-title.dto.ts` silindi.
  - **PageService**: `getTranslatedField` və `lang` parametrləri çıxarıldı; create/update/findAll/findOne sadə string title ilə işləyir; title dəyişəndə slug da yenilənir və unikallıq yoxlanır.
  - **PageController**: `lang`, `accept-language` və dil query parametrləri silindi; `allLanguages=true` admin siyahısı üçün saxlanıldı.
- Qeydlər/Risklər:
  - Əgər `pages.title` hal-hazırda DB-də jsonb-dırsa, varchar(255)-ə keçid üçün migration və köhnə məlumatın (məs. title->>'az') köçürülməsi tələb oluna bilər.
