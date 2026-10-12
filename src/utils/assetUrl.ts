/**
 * Resolves static asset paths consistently across development, Cloud Run,
 * and GitHub Pages subdirectory deployments (/katar/).
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

  const base = import.meta.env.BASE_URL || './';
  const cleanBase = base.endsWith('/') ? base : `${base}/`;

  let cleanPath = url.startsWith('/') ? url.slice(1) : url;
  if (cleanPath.startsWith('./')) {
    cleanPath = cleanPath.slice(2);
  }

  return `${cleanBase}${cleanPath}`;
}
