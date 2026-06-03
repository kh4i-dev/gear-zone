import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gearzone.kh4idev.id.vn'
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/', '/checkout/', '/order/', '/orders/', '/cart/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
