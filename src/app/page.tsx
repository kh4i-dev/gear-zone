import { Metadata } from 'next'
import StoreHomePageClient, { DEFAULT_HOME_SETTINGS } from './StoreHomePageClient'
import { prisma } from '@/lib/db'
import { toStoreProduct } from '@/lib/products/mapper'
import { publicInStockProductWhere, publicProductWhere } from '@/lib/products/publicProductHelper'
import { selectHomepageFeaturedProducts } from '@/lib/products/publicProductSections'

import { getSiteSettings } from '@/lib/settings'

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  return {
    title: {
      absolute: `${settings.shopName} - ${settings.shopTagline}`,
    },
    description: settings.seoDescription || settings.shopDescription,
  }
}

export const dynamic = 'force-dynamic'

export default async function StoreHomePage() {
  const [featuredPool, categoryProducts, settings, storeFeatures] = await Promise.all([
    prisma.product.findMany({
      where: publicInStockProductWhere,
      include: homeProductInclude,
      orderBy: [
        { soldCount: 'desc' },
        { updatedAt: 'desc' },
      ],
      take: 36,
    }),
    prisma.product.findMany({
      where: publicProductWhere,
      include: homeProductInclude,
      orderBy: [
        { soldCount: 'desc' },
        { updatedAt: 'desc' },
      ],
      take: 100,
    }),
    prisma.setting.findMany(),
    prisma.storeFeature.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    }),
  ])

  const featuredProducts = selectHomepageFeaturedProducts(featuredPool).map(toStoreProduct)

  return (
    <StoreHomePageClient
      featuredProducts={featuredProducts}
      categoryProducts={categoryProducts.map(toStoreProduct)}
      settings={buildHomeSettings(settings)}
      storeFeatures={storeFeatures}
    />
  )
}

const homeProductInclude = {
  category: { select: { name: true } },
  images: {
    orderBy: { sortOrder: 'asc' as const },
    select: { url: true, sortOrder: true, isPrimary: true },
  },
}

function buildHomeSettings(settings: { key: string; value: string }[]) {
  const settingsMap = Object.fromEntries(settings.map((setting) => [setting.key, setting.value]))

  return {
    videoUrl: settingsMap.homepage_video || DEFAULT_HOME_SETTINGS.videoUrl,
    themeAccent: settingsMap.theme_accent || DEFAULT_HOME_SETTINGS.themeAccent,
    introTitle: settingsMap.homepage_intro_title || DEFAULT_HOME_SETTINGS.introTitle,
    introText: settingsMap.homepage_intro_text || DEFAULT_HOME_SETTINGS.introText,
    bannerTitle: settingsMap.homepage_banner_title || DEFAULT_HOME_SETTINGS.bannerTitle,
    bannerSubtitle: settingsMap.homepage_banner_subtitle || DEFAULT_HOME_SETTINGS.bannerSubtitle,
    bannerCtaText: settingsMap.homepage_banner_cta_text || DEFAULT_HOME_SETTINGS.bannerCtaText,
    bannerCtaLink: settingsMap.homepage_banner_cta_link || DEFAULT_HOME_SETTINGS.bannerCtaLink,
    tickerSpeed: settingsMap.homepage_ticker_speed || DEFAULT_HOME_SETTINGS.tickerSpeed,
    tickerMessages: parseTickerMessages(
      settingsMap.homepage_ticker_messages,
      DEFAULT_HOME_SETTINGS.tickerMessages
    ),
    shopName: settingsMap.shop_name || DEFAULT_HOME_SETTINGS.shopName,
    shopTagline: settingsMap.shop_tagline || DEFAULT_HOME_SETTINGS.shopTagline,
  }
}

function parseTickerMessages(raw: string | null | undefined, fallback: string[]) {
  if (!raw) return fallback

  try {
    const list = JSON.parse(raw)
    return Array.isArray(list) ? list.map((msg: string) => msg.trim()).filter(Boolean) : fallback
  } catch {
    return raw.split('|').map((msg) => msg.trim()).filter(Boolean)
  }
}
