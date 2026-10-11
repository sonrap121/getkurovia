import type { MetadataRoute } from "next";
import { getAllProductSlugs, getCategories } from "@/lib/data";
import { SITE } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = ["", "/shop", "/shipping", "/about", "/contact", "/track", "/legal/returns", "/legal/privacy", "/legal/terms"].map((path) => ({
    url: `${SITE.url}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" || path === "/shop" ? "daily" : "monthly",
    priority: path === "" ? 1 : path === "/shop" ? 0.9 : 0.5,
  }));

  try {
    const [products, categories] = await Promise.all([getAllProductSlugs(), getCategories()]);
    return [
      ...staticRoutes,
      ...categories.map((category) => ({
        url: `${SITE.url}/shop?category=${category.slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
      ...products.map((product) => ({
        url: `${SITE.url}/shop/${product.slug}`,
        lastModified: product.createdAt,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })),
    ];
  } catch {
    return staticRoutes;
  }
}
