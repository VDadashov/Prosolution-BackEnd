# 🏗️ Arxitektura və Tətbiq Qaydaları

Bu sənəd Prosolution backend-in arxitekturası və kod standartlarını təsvir edir.

## 📋 İçindəkilər

1. [Error Handling](#error-handling)
2. [Validation System](#validation-system)
3. [Code Organization](#code-organization)
4. [Best Practices](#best-practices)

---

## 🚨 Error Handling

### Error Code Sistemi

Layihədə mərkəzləşdirilmiş error code sistemi mövcuddur. Bütün xətalar `ErrorCode` və `ErrorMessages` (azərbaycanca) ilə idarə olunur.

```typescript
// Nümunə istifadə
throw new ConflictException(ErrorCode.AUTH_EMAIL_ALREADY_EXISTS);
throw new UnauthorizedException(ErrorCode.AUTH_INVALID_CREDENTIALS);
throw new BusinessException(ErrorCode.BUSINESS_INVALID_OPERATION);
```

### Error Kateqoriyaları

**1. Authentication (AUTH_)**
- `AUTH_INVALID_CREDENTIALS` – Email və ya şifrə yanlışdır
- `AUTH_TOKEN_EXPIRED` – Sessiya müddəti bitib
- `AUTH_TOKEN_INVALID` – Token etibarsızdır
- `AUTH_UNAUTHORIZED` – Giriş tələb olunur
- `AUTH_FORBIDDEN` – İcazə yoxdur
- `AUTH_EMAIL_ALREADY_EXISTS` – Email/username artıq qeydiyyatdadır
- `AUTH_WEAK_PASSWORD` – Şifrə ən azı 6 simvol olmalıdır

**2. User (USER_)**
- `USER_NOT_FOUND` – İstifadəçi tapılmadı
- `USER_ALREADY_EXISTS` – İstifadəçi artıq mövcuddur

**3. Validation (VALIDATION_)**
- `VALIDATION_FAILED` – Məlumatların yoxlanılması uğursuz oldu
- `VALIDATION_INVALID_EMAIL` – Etibarsız email formatı
- `VALIDATION_REQUIRED_FIELD` – Sahə mütləqdir
- `VALIDATION_INVALID_RANGE` – Dəyər etibarlı aralıqda olmalıdır

**4. Database (DB_)**
- `DB_CONNECTION_FAILED` – Veritabanına qoşulmaq mümkün olmadı
- `DB_QUERY_FAILED` – Veritabanı əməliyyatı uğursuz oldu
- `DB_DUPLICATE_ENTRY` – Bu məlumat artıq mövcuddur
- `DB_FOREIGN_KEY_VIOLATION` – Əlaqəli məlumat mövcuddur
- `DB_TRANSACTION_FAILED` – Əməliyyat uğursuz oldu

**5. System (SYSTEM_)**
- `SYSTEM_INTERNAL_ERROR` – Daxili server xətası baş verdi
- `SYSTEM_SERVICE_UNAVAILABLE` – Xidmət əlçatan deyil

**6. Business (BUSINESS_)**
- `BUSINESS_INVALID_OPERATION` – Bu əməliyyat icra edilə bilməz

### Custom Exception Sinifləri

```typescript
// Biznes qaydası pozulduqda (422)
throw new BusinessException(ErrorCode.BUSINESS_INVALID_OPERATION);

// Konflikt, məs. artıq mövcud (409)
throw new ConflictException(ErrorCode.AUTH_EMAIL_ALREADY_EXISTS);

// Giriş tələb olunur / token etibarsız (401)
throw new UnauthorizedException(ErrorCode.AUTH_UNAUTHORIZED);

// Validasiya (400)
throw new ValidationException('Xüsusi mesaj', validationErrors);
```

### Xəta Cavab Formatı

Bütün xəta cavabları vahid formatda qaytarılır:

```json
{
  "success": false,
  "statusCode": 409,
  "errorCode": "AUTH_EMAIL_ALREADY_EXISTS",
  "message": "Bu email və ya istifadəçi adı artıq qeydiyyatdadır",
  "timestamp": "2026-02-11T12:00:00.000Z",
  "path": "/auth/register",
  "requestId": "optional-x-request-id"
}
```

### Veritabanı Xətalarının Idarəsi

TypeORM/PostgreSQL xətaları `HttpAllExceptionsFilter` və `DatabaseException.fromDatabaseError()` vasitəsilə ErrorCode-a map olunur:

| PostgreSQL kodu | ErrorCode |
|-----------------|-----------|
| 23505 | DB_DUPLICATE_ENTRY |
| 23503 | DB_FOREIGN_KEY_VIOLATION |
| 23502 | VALIDATION_REQUIRED_FIELD |
| 22001 | VALIDATION_INVALID_RANGE |
| 08000, 08003, 08006 | DB_CONNECTION_FAILED |
| 40001, 40P01 | DB_TRANSACTION_FAILED |

Əlaqə xətaları (ECONNREFUSED və s.) `DatabaseConnectionException.fromConnectionError()` ilə idarə olunur.

---

## ✅ Validation System

### DTO Validasiya (class-validator)

```typescript
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  usernameOrEmail: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password: string;
}
```

### ValidationPipe (main.ts)

- `whitelist: true` – DTO-da olmayan sahələr silinir
- `forbidNonWhitelisted: true` – Əlavə sahə göndərilərsə 400
- `transform: true` – Növ çevrilməsi (query/body)

---

## 📁 Code Organization

### Layihə Strukturu

```
src/
├── _common/                    # Ümumi komponentlər
│   ├── constants/              # ErrorCode, ErrorMessages
│   ├── enums/                  # UserRole və s.
│   └── exceptions/             # BaseException, BusinessException, ...
├── common/                     # Filter və digər
│   └── filters/                # HttpAllExceptionsFilter
├── config/                     # database.config
├── modules/
│   └── auth/                   # Auth modulu
│       ├── dto/
│       ├── entities/           # User entity
│       ├── auth.controller.ts
│       ├── auth.service.ts
│       ├── auth.module.ts
│       ├── jwt.strategy.ts
│       └── jwt-auth.guard.ts
├── app.module.ts
└── main.ts
```

### Modul Strukturu

Hər modul təxminən belə qurulur:

```
module/
├── dto/                  # Create/Update/Response DTO-lar
├── entities/             # TypeORM entity-lər
├── *.controller.ts       # REST endpoint-lər
├── *.service.ts          # Biznes məntiqi
└── *.module.ts           # Modul tərifi
```

---

## 🎯 Best Practices

### 1. Error Handling

✅ **EDİN:**
```typescript
throw new ConflictException(ErrorCode.AUTH_EMAIL_ALREADY_EXISTS);
throw new UnauthorizedException(ErrorCode.AUTH_INVALID_CREDENTIALS);
```

❌ **ETMEYİN:**
```typescript
throw new Error('Not found');
throw new NotFoundException('User not found');  // ErrorCode istifadə edin
```

### 2. Təhlükəsizlik

- Şifrə yalnız hash (bcrypt) saxlanılır; açıq şifrə DB-də yazılmır.
- JWT token müddəti və secret mühit dəyişənlərindən gəlir.
- Production-da `synchronize: false`; schema migration ilə idarə olunur.

### 3. API Sənədləşmə

- Swagger `/api` altında aktivdir.
- Bearer auth `JWT` adı ilə təyin olunub.
- Endpoint-lər üçün `@ApiOperation`, `@ApiResponse`, `@ApiBody` istifadə edin.

---

## 📚 Resurslar

- [NestJS Documentation](https://docs.nestjs.com)
- [TypeORM Documentation](https://typeorm.io)
- [class-validator](https://github.com/typestack/class-validator)

---

**Son yenilənmə**: 2026-02-11  
**Layihə**: Prosolution Backend
