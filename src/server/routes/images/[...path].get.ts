import { createReadStream, existsSync, statSync } from 'node:fs';
import { extname, join } from 'node:path';
import { sendStream } from 'h3';
import { resolveUploadDir } from '../../infrastructure/storage/local-image-storage';

const CONTENT_TYPES: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
};

function candidateRoots(): string[] {
  return [
    resolveUploadDir(),
    join(process.cwd(), 'data', 'uploads'),
    join(process.cwd(), '.output', 'public', 'images'),
    join(process.cwd(), 'public', 'images'),
  ];
}

export default defineEventHandler((event) => {
  const raw = event.context.params?.path;
  const relative = Array.isArray(raw) ? raw.join('/') : raw;
  if (!relative || relative.includes('..') || relative.includes('\0')) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid image path' });
  }

  const seen = new Set<string>();
  for (const root of candidateRoots()) {
    if (seen.has(root)) continue;
    seen.add(root);

    const filePath = join(root, relative);
    if (!existsSync(filePath)) continue;
    if (!statSync(filePath).isFile()) continue;

    const type = CONTENT_TYPES[extname(filePath).toLowerCase()];
    if (type) {
      setHeader(event, 'Content-Type', type);
    }
    setHeader(event, 'Cache-Control', 'public, max-age=31536000, immutable');
    return sendStream(event, createReadStream(filePath));
  }

  throw createError({ statusCode: 404, statusMessage: 'Image not found' });
});
