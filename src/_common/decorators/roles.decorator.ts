import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../enums/role.enum';

export const ROLES_KEY = 'roles';

/** Endpoint üçün tələb olunan rollar (RolesGuard ilə işlənir). */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
