import { FileFilterCallback } from 'multer';
import { MulterFile } from '../types/multer.types';

export function imageFileFilter(
  _req: unknown,
  file: MulterFile,
  cb: FileFilterCallback,
): void {
  if (!file.mimetype.match(/^image\/(jpeg|png|jpg|webp|avif|svg)$/)) {
    return cb(new Error('Yalnız şəkil faylları qəbul olunur (jpeg, png, jpg, webp)'));
  }
  cb(null, true);
}

export function pdfFileFilter(
  _req: unknown,
  file: MulterFile,
  cb: FileFilterCallback,
): void {
  if (file.mimetype !== 'application/pdf') {
    return cb(new Error('Yalnız PDF faylları qəbul olunur'));
  }
  cb(null, true);
}

export function videoFileFilter(
  _req: unknown,
  file: MulterFile,
  cb: FileFilterCallback,
): void {
  if (!file.mimetype.match(/^video\/(mp4|webm|avi|mkv)$/)) {
    return cb(new Error('Yalnız video faylları qəbul olunur (mp4, webm, avi, mkv)'));
  }
  cb(null, true);
}

export const imageMaxSize = 5 * 1024 * 1024; // 5MB
export const pdfMaxSize = 10 * 1024 * 1024; // 10MB
export const videoMaxSize = 50 * 1024 * 1024; // 50MB
