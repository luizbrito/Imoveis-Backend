import { FileUploaded } from './fileSchemas';

export function fileLabel(file?: FileUploaded | null) {
  return file?.name;
}
