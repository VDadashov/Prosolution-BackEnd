import { Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class OptionalIntPipe
  implements PipeTransform<string | undefined, number | undefined> {
  transform(value: string | undefined): number | undefined {
    if (value === undefined || value === null || value === '') return undefined;
    const parsed = parseInt(value, 10);
    return Number.isNaN(parsed) ? undefined : parsed;
  }
}
