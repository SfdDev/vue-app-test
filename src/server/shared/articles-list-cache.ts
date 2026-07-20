type CacheEntry = { data: unknown; timestamp: number };

const cache = new Map<string, CacheEntry>();

export function getArticlesListCache(key: string, ttlMs: number): unknown | null {
  const cached = cache.get(key);
  if (!cached) return null;
  if (Date.now() - cached.timestamp >= ttlMs) {
    cache.delete(key);
    return null;
  }
  return cached.data;
}

export function setArticlesListCache(key: string, data: unknown): void {
  cache.set(key, { data, timestamp: Date.now() });
}

export function clearArticlesListCache(): void {
  cache.clear();
}
