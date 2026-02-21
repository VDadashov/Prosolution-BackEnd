import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/** JWT yoxlamasını bu endpoint üçün keçir (məs. login, register). */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
