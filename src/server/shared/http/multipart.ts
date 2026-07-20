import type { MultiPartData } from 'h3';
import type { UploadedImage } from '../../domain/article';

export function getFormField(formData: MultiPartData[], name: string): string {
  return formData.find((part) => part.name === name && !part.filename)?.data.toString('utf8') ?? '';
}

export function getFormImage(formData: MultiPartData[], name = 'image'): UploadedImage | null {
  const imagePart = formData.find((part) => part.name === name && part.filename);
  if (!imagePart?.filename || !imagePart.data) {
    return null;
  }
  return {
    buffer: imagePart.data,
    filename: imagePart.filename,
  };
}
