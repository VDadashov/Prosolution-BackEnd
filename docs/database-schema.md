## Prosolution — Verilənlər Bazası Sxemi

Bu sənəd Prosolution backend-in veritabanı dizaynını və cədvəl əlaqələrini təsvir edir. Sxem DBML-ə bənzər sintaksisdə verilir; TypeORM entity-ləri ilə uyğundur.

### Adlandırma və Tip Qaydaları
- Əsas kimlik sahəsi `id` (integer, auto-increment) istifadə olunur.
- Şifrə yalnız hash (bcrypt) saxlanılır; açıq şifrə DB-də yazılmır.
- Enum dəyərləri (`UserRole`) tətbiq qatında sabitlərlə uyğunlaşdırılır.
- Bütün unique məcburi sahələr (email, username) indekslənir.

### Verilənlər Bazası Sxemi (DBML)

```dbml
// Prosolution Database Schema

Enum UserRole {
  user
  admin
  superAdmin
}

Table users {
  id integer [pk, increment]
  first_name varchar(50) [not null]
  last_name varchar(50) [not null]
  username varchar(50) [unique, not null]
  email varchar(100) [unique, not null]
  password_hash varchar(255) [not null]
  role UserRole [default: 'user', not null]
}
```

### Sahələr Xülasəsi

| Sahə          | Tip        | Qeyd |
|---------------|------------|------|
| id            | integer    | Primary key, avtomatik artan |
| first_name    | varchar(50)| Ad |
| last_name     | varchar(50)| Soyad |
| username      | varchar(50)| Unikal istifadəçi adı |
| email         | varchar(100)| Unikal e-poçt |
| password_hash | varchar(255)| Yalnız bcrypt hash; açıq şifrə saxlanılmır |
| role          | enum       | user, admin, superAdmin (default: user) |

### Cari Kapsam
- İlk mərhələdə yalnız **users** cədvəli mövcuddur.
- Auth: qeydiyyat (email əsaslı), giriş (username/email + şifrə), şifrə dəyişmə (JWT ilə).
- Gələcək mərhələlərdə əlavə cədvəllər (məs. layihə/istifadəçi əlaqəli) və münasibətlər sənədləşdiriləcək.

### TypeORM Entity
Entity faylı: `src/modules/auth/entities/user.entity.ts`  
Cədvəl adı: `users`.

---

**Son yenilənmə**: 2026-02-11  
**Layihə**: Prosolution Backend
