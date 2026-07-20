export const ARTICLES_SYNC_KEY = 'articles:version';
export const ARTICLES_CHANGED_EVENT = 'articles:changed';

/** Notify other tabs and the current tab that articles changed. */
export function notifyArticlesChanged(): void {
  if (!import.meta.client) return;
  try {
    localStorage.setItem(ARTICLES_SYNC_KEY, String(Date.now()));
  } catch {
    // ignore quota / private mode
  }
  window.dispatchEvent(new CustomEvent(ARTICLES_CHANGED_EVENT));
}
