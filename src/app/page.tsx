import { Metadata } from 'next'
import StoreHomePageClient, { DEFAULT_HOME_SETTINGS } from './StoreHomePageClient'
import { prisma } from '@/lib/db'
import { toStoreProduct } from '@/lib/products/mapper'
import { publicInStockProductWhere, publicProductWhere } from '@/lib/products/publicProductHelper'
import { selectHomepageFeaturedProducts } from '@/lib/products/publicProductSections'
import { getCategoryImage, getCategorySlug } from '@/lib/products/categoryImages'
import type { CategoryData } from '@/components/domain/CategoryCard'

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
  const [featuredPool, settings, storeFeatures, categoryCounts] = await Promise.all([
    prisma.product.findMany({
      where: publicInStockProductWhere,
      select: homeProductSelect,
      orderBy: [
        { soldCount: 'desc' },
        { updatedAt: 'desc' },
      ],
      take: 36,
    }),
    prisma.setting.findMany(),
    prisma.storeFeature.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    }),
    prisma.product.groupBy({
      by: ['categoryId'],
      where: publicProductWhere,
      _count: { _all: true },
    }),
  ])

  const categoryIds = categoryCounts
    .map((item) => item.categoryId)
    .filter((id): id is string => Boolean(id))

  const categories = categoryIds.length > 0
    ? await prisma.category.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, name: true },
    })
    : []

  const featuredProducts = selectHomepageFeaturedProducts(featuredPool).map(toStoreProduct)
  const categoryProducts = buildHomeCategories(categoryCounts, categories)

  return (
    <StoreHomePageClient
      featuredProducts={featuredProducts}
      categoryProducts={categoryProducts}
      settings={buildHomeSettings(settings)}
      storeFeatures={storeFeatures}
    />
  )
}

const homeProductSelect = {
  id: true,
  name: true,
  description: true,
  imageUrl: true,
  price: true,
  oldPrice: true,
  stock: true,
  soldCount: true,
  isVisible: true,
  status: true,
  updatedAt: true,
  createdAt: true,
  specs: true,
  category: { select: { name: true } },
  images: {
    orderBy: { sortOrder: 'asc' as const },
    select: { url: true, sortOrder: true, isPrimary: true },
  },
}

function buildHomeCategories(
  counts: { categoryId: string | null; _count: { _all: number } }[],
  categories: { id: string; name: string }[],
): CategoryData[] {
  const categoryNameById = new Map(categories.map((category) => [category.id, category.name]))

  return counts
    .map((item) => {
      const name = item.categoryId
        ? categoryNameById.get(item.categoryId)
        : 'Phụ kiện / Khác'

      if (!name) return null

      return {
        id: getCategorySlug(name),
        name,
        count: item._count._all,
        imageUrl: getCategoryImage(name) || '',
      }
    })
    .filter((category): category is CategoryData => Boolean(category))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
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
