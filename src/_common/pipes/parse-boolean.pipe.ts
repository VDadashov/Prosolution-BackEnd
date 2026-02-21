import { Injectable, PipeTransform } from '@nestjs/common';
import { ValidationException } from '../exceptions/validation.exception';

@Injectable()
export class ParseBooleanPipe implements PipeTransform<string | boolean, boolean> {
  transform(value: string | boolean): boolean {
    if (typeof value === 'boolean') return value;
    const normalized = String(value).toLowerCase().trim();
    if (['true', '1', 'yes'].includes(normalized)) return true;
    if (['false', '0', 'no'].includes(normalized)) return false;
    throw new ValidationException('Boolean dəyər etibarsızdır (true/false, 1/0, yes/no gözlənilir)');
  }
}
