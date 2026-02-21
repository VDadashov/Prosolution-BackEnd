/**
 * Multer file (memory storage) — Express.Multer.File əvəzinə,
 * @types/multer olmadan işləmək üçün.
 */
export interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}
