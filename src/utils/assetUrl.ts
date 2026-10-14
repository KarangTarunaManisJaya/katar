/**
 * Resolves static asset paths consistently across development, Cloud Run,
 * AI Studio preview iframes, and GitHub Pages subdirectory deployments (/katar/).
 */
export function resolveAssetUrl(url: string | undefined | null): string {
  if (!url) return '';
  if (
    url.startsWith('data:') ||
    url.startsWith('blob:') ||
    url.startsWith('http://') ||
    url.startsWith('https://')
  ) {
    return url;
  }

  let base = '/';
  if (typeof window !== 'undefined') {
    const { hostname, pathname } = window.location;
    if (hostname.includes('github.io') && pathname.startsWith('/katar')) {
      base = '/katar/';
    }
  } else if (
    typeof process !== 'undefined' &&
    (process.env?.GITHUB_ACTIONS === 'true' || process.env?.GITHUB_PAGES === 'true')
  ) {
    base = '/katar/';
  }

  // Remove leading './' or '/'
  let clean = url.replace(/^\.?\/+/, '');

  // If already prefixed with katar/, don't duplicate
  if (base !== '/' && clean.startsWith('katar/')) {
    clean = clean.slice(6);
  }

  return `${base}${clean}`;
}
