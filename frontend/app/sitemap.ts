import { MetadataRoute } from 'next'

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const SITE_URL = "https://e-ticaret-red-mu.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${SITE_URL}/shop`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/categories`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
  ];

  try {
    const res = await fetch(`${API_URL}/api/products`);
    if (res.ok) {
      const products = await res.json();
      const productRoutes = products.map((product: any) => ({
        url: `${SITE_URL}/urun/${product.slug || product.id}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.9,
      }));
      routes.push(...productRoutes);
    }
  } catch (error) {
    console.error("Sitemap uretilirken hata:", error);
  }

  const categorySlugs = ["giyim", "ayakkabi", "aksesuar"];
  const categoryRoutes = categorySlugs.map(slug => ({
    url: `${SITE_URL}/kategori/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));
  routes.push(...categoryRoutes);

  return routes;
}
