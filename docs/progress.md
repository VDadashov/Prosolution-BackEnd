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
