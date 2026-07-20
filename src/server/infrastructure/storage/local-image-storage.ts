import { promises as fs } from 'fs';
import { existsSync } from 'fs';
import path from 'path';
import type { FileStorage } from '../../ports/file-storage';

/** Directory for uploaded article images (served under /images/*). */
export function resolveUploadDir(): string {
  if (process.env.UPLOAD_DIR) {
    return process.env.UPLOAD_DIR;
  }

  const dataUploads = path.join(process.cwd(), 'data', 'uploads');
  const nitroImages = path.join(process.cwd(), '.output', 'public', 'images');
  const legacyImages = path.join(process.cwd(), 'public', 'images');

  if (existsSync(path.join(process.cwd(), '.output', 'public'))) {
    // Prefer persistent data dir when present; else nitro public images
    if (existsSync(dataUploads) || process.env.NODE_ENV === 'production') {
      return dataUploads;
    }
    return nitroImages;
  }

  return legacyImages;
}

export class LocalImageStorage implements FileStorage {
  constructor(private readonly uploadDir = resolveUploadDir()) {}

  async saveImage(buffer: Buffer, originalFilename: string): Promise<string> {
    await fs.mkdir(this.uploadDir, { recursive: true });

    const ext = path.extname(originalFilename);
    const fileName = `${Date.now()}-${Math.random().toString(16).slice(2)}${ext || ''}`;
    const filePath = path.join(this.uploadDir, fileName);

    await fs.writeFile(filePath, buffer);
    return `/images/${fileName}`;
  }

  async deleteByUrl(url: string | null | undefined): Promise<void> {
    if (!url) return;
    const fileName = path.basename(url);
    const fullPath = path.join(this.uploadDir, fileName);
    await fs.unlink(fullPath).catch(() => {});
  }
}
