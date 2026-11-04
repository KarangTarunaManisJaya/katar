/**
 * Utility helper untuk manajemen SEO dinamis Karang Taruna Manis Jaya
 * Memastikan metadata title, description, canonical, OpenGraph, Twitter card,
 * dan Schema.org JSON-LD selalu tersinkronisasi saat pengguna membuka berita/kegiatan.
 */

export interface SeoMetadataOptions {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
  imageUrl?: string;
  type?: 'website' | 'article';
  articleData?: {
    headline: string;
    datePublished?: string;
    dateModified?: string;
    authorName?: string;
    category?: string;
    image?: string;
    description?: string;
    location?: string;
  };
}

export const DEFAULT_SEO = {
  title: 'Karang Taruna Manis Jaya | Organisasi Pemuda Tangerang',
  description:
    'Portal resmi Karang Taruna Manis Jaya, Tangerang. Wadah kegiatan pemuda dalam pembangunan sosial, kemasyarakatan, inovasi kepemudaan, dan bakti warga.',
  keywords:
    'Karang Taruna Manis Jaya, Tangerang, organisasi pemuda Tangerang, kegiatan pemuda, sosial, kemasyarakatan, Kelurahan Manis Jaya, Jatiuwung Tangerang, pemuda Banten, warta kepemudaan',
  canonicalUrl: 'https://karangtarunamanisjaya.my.id/',
  imageUrl: 'https://karangtarunamanisjaya.my.id/logo.png?v=2',
  type: 'website' as const,
};

function setOrCreateMeta(selector: string, attrName: string, attrValue: string, content: string) {
  if (typeof document === 'undefined') return;
  let element = document.querySelector(selector) as HTMLMetaElement | null;
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attrName, attrValue);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function setOrCreateLink(rel: string, href: string) {
  if (typeof document === 'undefined') return;
  let element = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', rel);
    document.head.appendChild(element);
  }
  element.setAttribute('href', href);
}

export function updatePageSeo(options: SeoMetadataOptions): void {
  if (typeof document === 'undefined') return;

  const title = options.title
    ? `${options.title} | Karang Taruna Manis Jaya`
    : DEFAULT_SEO.title;
  const description = options.description || DEFAULT_SEO.description;
  const keywords = options.keywords || DEFAULT_SEO.keywords;
  const canonicalUrl = options.canonicalUrl || DEFAULT_SEO.canonicalUrl;
  const imageUrl = options.imageUrl || DEFAULT_SEO.imageUrl;
  const type = options.type || (options.articleData ? 'article' : DEFAULT_SEO.type);

  // 1. Update Title
  document.title = title;

  // 2. Standard Meta Tags
  setOrCreateMeta('meta[name="description"]', 'name', 'description', description);
  setOrCreateMeta('meta[name="keywords"]', 'name', 'keywords', keywords);
  setOrCreateLink('canonical', canonicalUrl);

  // 3. Open Graph Tags
  setOrCreateMeta('meta[property="og:title"]', 'property', 'og:title', title);
  setOrCreateMeta('meta[property="og:description"]', 'property', 'og:description', description);
  setOrCreateMeta('meta[property="og:url"]', 'property', 'og:url', canonicalUrl);
  setOrCreateMeta('meta[property="og:image"]', 'property', 'og:image', imageUrl);
  setOrCreateMeta('meta[property="og:type"]', 'property', 'og:type', type);

  // 4. Twitter Card Tags
  setOrCreateMeta('meta[name="twitter:title"]', 'name', 'twitter:title', title);
  setOrCreateMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description);
  setOrCreateMeta('meta[name="twitter:image"]', 'name', 'twitter:image', imageUrl);

  // 5. Dynamic JSON-LD Article Schema jika sedang membaca berita
  const existingArticleSchema = document.getElementById('dynamic-article-jsonld');
  if (options.articleData) {
    const articleJson = {
      '@context': 'https://schema.org',
      '@type': 'NewsArticle',
      '@id': canonicalUrl,
      headline: options.articleData.headline || title,
      image: [imageUrl],
      datePublished: options.articleData.datePublished || new Date().toISOString(),
      dateModified: options.articleData.dateModified || options.articleData.datePublished || new Date().toISOString(),
      author: {
        '@type': 'Organization',
        name: options.articleData.authorName || 'Karang Taruna Manis Jaya',
        url: 'https://karangtarunamanisjaya.my.id/',
      },
      publisher: {
        '@type': 'Organization',
        name: 'Karang Taruna Manis Jaya',
        url: 'https://karangtarunamanisjaya.my.id/',
        logo: {
          '@type': 'ImageObject',
          url: 'https://karangtarunamanisjaya.my.id/logo.png',
        },
      },
      description: description,
      articleSection: options.articleData.category || 'Warta Pemuda',
      inLanguage: 'id-ID',
    };

    if (existingArticleSchema) {
      existingArticleSchema.textContent = JSON.stringify(articleJson);
    } else {
      const script = document.createElement('script');
      script.id = 'dynamic-article-jsonld';
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(articleJson);
      document.head.appendChild(script);
    }
  } else if (existingArticleSchema) {
    existingArticleSchema.remove();
  }
}

export function resetDefaultSeo(): void {
  updatePageSeo({
    title: undefined,
    description: DEFAULT_SEO.description,
    keywords: DEFAULT_SEO.keywords,
    canonicalUrl: DEFAULT_SEO.canonicalUrl,
    imageUrl: DEFAULT_SEO.imageUrl,
    type: 'website',
  });
}
