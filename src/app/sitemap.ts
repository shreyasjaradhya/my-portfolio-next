import type { MetadataRoute } from 'next';
import { PROJECT_REPORTS } from '@/data/projectReports';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://shreyas-aradhya.vercel.app';
  const lastModified = new Date();

  const reportEntries: MetadataRoute.Sitemap = Object.keys(PROJECT_REPORTS).map((slug) => ({
    url: `${baseUrl}/projects/${slug}`,
    lastModified,
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified,
      changeFrequency: 'weekly',
      priority: 1,
    },
    ...reportEntries,
  ];
}
