## Prosolution — Verilənlər Bazası Sxemi

Bu sənəd Prosolution backend-in veritabanı dizaynını və cədvəl əlaqələrini təsvir edir. Sxem DBML-ə bənzər sintaksisdə verilir; TypeORM entity-ləri ilə uyğundur.

### Adlandırma və Tip Qaydaları
- Əsas kimlik sahəsi `id` (integer, auto-increment) istifadə olunur.
- Şifrə yalnız hash (bcrypt) saxlanılır; açıq şifrə DB-də yazılmır.
- Enum dəyərləri (`UserRole`) tətbiq qatında sabitlərlə uyğunlaşdırılır.
- Bütün unique məcburi sahələr (email, username) indekslənir.
- **BaseEntity** sahələri (created_at, updated_at, created_by, updated_by, is_active, is_deleted) BaseEntity extend edən bütün cədvəllərdə mövcuddur.

### Verilənlər Bazası Sxemi (DBML)

```dbml
// Prosolution Database Schema

Enum UserRole {
  user
  admin
  superAdmin
}

// BaseEntity: created_at (yaradanda), updated_at (yalnız PUT/PATCH-da, null ola bilər), created_by, updated_by (username), is_active, is_deleted

Table users {
  id integer [pk, increment]
  first_name varchar(50) [not null]
  last_name varchar(50) [not null]
  username varchar(50) [unique, not null]
  email varchar(100) [unique, not null]
  password_hash varchar(255) [not null]
  role UserRole [default: 'user', not null]
  password_reset_token varchar(255) [null]
  password_reset_expires timestamp [null]
  created_at timestamp [not null]
  updated_at timestamp [null]
  created_by varchar(50) [null]
  updated_by varchar(50) [null]
  is_active boolean [default: true, not null]
  is_deleted boolean [default: false, not null]
}

Table categories {
  id integer [pk, increment]
  title varchar(100) [not null]
  slug varchar(120) [unique, null]
  sort_order integer [default: 0, not null]
  parent_id integer [null, ref: > categories.id]
  level integer [default: 0, not null]
  allow_products boolean [default: true, not null]
  created_at timestamp [not null]
  updated_at timestamp [null]
  created_by varchar(50) [null]
  updated_by varchar(50) [null]
  is_active boolean [default: true, not null]
  is_deleted boolean [default: false, not null]
}
```

### Cədvəllər Xülasəsi

#### users
| Sahə                   | Tip         | Qeyd |
|------------------------|-------------|------|
| id                     | integer     | Primary key, avtomatik artan |
| first_name             | varchar(50) | Ad |
| last_name              | varchar(50) | Soyad |
| username               | varchar(50) | Unikal istifadəçi adı |
| email                  | varchar(100)| Unikal e-poçt |
| password_hash          | varchar(255)| Yalnız bcrypt hash |
| role                   | enum        | user, admin, superAdmin (default: user) |
| password_reset_token   | varchar(255)| Şifrə sıfırlama tokeni (nullable) |
| password_reset_expires | timestamp   | Token son istifadə tarixi (nullable) |
| created_at             | timestamp   | BaseEntity (yaradanda set) |
| updated_at             | timestamp   | BaseEntity (yalnız update/patch-da; null ola bilər) |
| created_by             | varchar(50) | BaseEntity (username, yaradanda) |
| updated_by             | varchar(50) | BaseEntity (username, yalnız update/patch-da) |
| is_active              | boolean     | BaseEntity (default: true) |
| is_deleted             | boolean     | BaseEntity, soft delete (default: false) |

#### categories
| Sahə         | Tip         | Qeyd |
|--------------|-------------|------|
| id           | integer     | Primary key |
| title        | varchar(100)| Kateqoriya adı |
| slug         | varchar(120)| Unikal, URL üçün (title-dan avtomatik); nullable |
| sort_order   | integer     | Sıralama (default: 0) |
| parent_id    | integer     | FK → categories.id; root üçün null |
| level        | integer     | Ağac səviyyəsi, 0 = root |
| allow_products | boolean   | true = bu kateqoriyada məhsul yaradıla bilər |
| created_at   | timestamp   | BaseEntity (yaradanda set) |
| updated_at   | timestamp   | BaseEntity (yalnız update-da; null ola bilər) |
| created_by   | varchar(50) | BaseEntity (username, yaradanda) |
| updated_by   | varchar(50) | BaseEntity (username, yalnız update-da) |
| is_active    | boolean     | BaseEntity |
| is_deleted   | boolean     | BaseEntity, soft delete |

### Əlaqələr
- **categories.parent_id** → **categories.id** (öz-özünə istinad; ağac strukturu). ON DELETE SET NULL.

### TypeORM Entity-lər
| Cədvəl     | Entity faylı |
|------------|----------------|
| users      | `src/modules/auth/entities/user.entity.ts` |
| categories | `src/modules/category/entities/category.entity.ts` |

Ümumi əsas: `src/_common/entities/base.entity.ts` (abstract BaseEntity).

### Cari Kapsam
- **users**: qeydiyyat, giriş, şifrə dəyişmə, şifrə sıfırlama (forgot/reset); BaseEntity ilə audit sahələri.
- **categories**: CRUD, ağac (parent/children), slug title əsasında, soft delete; POST/PUT/DELETE yalnız admin/superAdmin.
- Gələcək: məhsullar və digər modullar.

---

**Son yenilənmə**: 2026-02-11  
**Layihə**: Prosolution Backend
