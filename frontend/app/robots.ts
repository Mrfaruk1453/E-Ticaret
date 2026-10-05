import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/shop', '/urun/', '/kategori/', '/categories'],
      disallow: ['/checkout', '/admin', '/payment', '/cart', '/login', '/register'],
    },
    sitemap: 'https://e-ticaret-red-mu.vercel.app/sitemap.xml',
  }
}
