/**
 * Utility to generate dynamic sitemap for bouquets
 * This can be called server-side or client-side to generate sitemap entries
 */

import { API_BASE } from "../config/api";
import { STORE_PROFILE } from "../config/store-profile";

export interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: number;
}

/**
 * Generate sitemap XML string
 */
export function generateSitemapXml(urls: SitemapUrl[]): string {
  const baseUrl = STORE_PROFILE.brand.domain;
  const today = new Date().toISOString().split("T")[0];

  const urlEntries = urls.map((url) => {
    const fullUrl = url.loc.startsWith("http") ? url.loc : `${baseUrl}${url.loc}`;
    return `  <url>
    <loc>${fullUrl}</loc>
    ${url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : `<lastmod>${today}</lastmod>`}
    ${url.changefreq ? `<changefreq>${url.changefreq}</changefreq>` : `<changefreq>weekly</changefreq>`}
    ${url.priority !== undefined ? `<priority>${url.priority}</priority>` : `<priority>0.8</priority>`}
  </url>`;
  }).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
  
  <!-- Static Pages -->
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/collection</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  
  <!-- Dynamic Bouquet Pages -->
${urlEntries}
  
</urlset>`;
}

/**
 * Fetch all bouquets and generate sitemap URLs
 */
export async function fetchBouquetUrls(): Promise<SitemapUrl[]> {
  try {
    const response = await fetch(`${API_BASE}/api/bouquets`);
    if (!response.ok) return [];

    const bouquets = await response.json();
    if (!Array.isArray(bouquets)) return [];

    return bouquets.map((bouquet: { _id: string; updatedAt?: string }) => ({
      loc: `/bouquet/${bouquet._id}`,
      lastmod: bouquet.updatedAt
        ? new Date(bouquet.updatedAt).toISOString().split("T")[0]
        : undefined,
      changefreq: "weekly" as const,
      priority: 0.8,
    }));
  } catch (err) {
    console.error("Failed to fetch bouquets for sitemap:", err);
    return [];
  }
}

