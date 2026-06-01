import { cache } from 'react'
import { prisma } from '@/lib/db'

export interface SiteSettings {
  shopName: string
  shopTagline: string
  shopDescription: string
  logoUrl: string | null
  faviconUrl: string | null
  seoTitleTemplate: string
  seoDescription: string
}

export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  try {
    const settings = await prisma.setting.findMany()
    const settingsMap = Object.fromEntries(settings.map((s) => [s.key, s.value]))

    const shopName = settingsMap.shop_name || 'GearZone'
    const shopTagline = settingsMap.shop_tagline || 'Gaming Gear Store'
    const shopDescription = settingsMap.shop_description || 'GearZone chuyên gaming gear, linh kiện và phụ kiện máy tính chính hãng. Chúng tôi tập trung vào sản phẩm rõ thông tin, giá minh bạch, tồn kho thực và hỗ trợ nhanh cho game thủ.'
    const logoUrl = settingsMap.logo_url || null
    const faviconUrl = settingsMap.favicon_url || '/favicon.ico'
    const seoTitleTemplate = settingsMap.seo_title_template || '%s | GearZone'
    const seoDescription = settingsMap.seo_description || 'Cửa hàng phụ kiện gaming'

    return {
      shopName,
      shopTagline,
      shopDescription,
      logoUrl,
      faviconUrl,
      seoTitleTemplate,
      seoDescription,
    }
  } catch (error: any) {
    // Return standard fallbacks if db not accessible or tables are missing during build
    return {
      shopName: 'GearZone',
      shopTagline: 'Gaming Gear Store',
      shopDescription: 'GearZone chuyên gaming gear, linh kiện và phụ kiện máy tính chính hãng. Chúng tôi tập trung vào sản phẩm rõ thông tin, giá minh bạch, tồn kho thực và hỗ trợ nhanh cho game thủ.',
      logoUrl: null,
      faviconUrl: '/favicon.ico',
      seoTitleTemplate: '%s | GearZone',
      seoDescription: 'Cửa hàng phụ kiện gaming',
    }
  }
})
