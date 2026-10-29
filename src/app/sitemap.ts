import type { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://mgrh-mahabaleshwar.org';

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ['', '/about', '/facilities', '/doctors', '/programmes', '/events', '/support', '/contact', '/emergency'];
  const now = new Date();
  return routes.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: now,
    changeFrequency: route === '' ? 'weekly' : 'monthly',
    priority: route === '' ? 1 : 0.7,
  }));
}
