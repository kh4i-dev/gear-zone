import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { createTraceId, fail, logServerError, success } from '@/lib/api'
import { CATEGORY_SLUG_TO_NAME, productFilters } from '@/config/productFilters'

const FILTER_KEYS = new Set(['brand', 'resolution', 'refreshRate', 'connection', 'switch', 'size', 'shape', 'panel', 'layout', 'weight', 'sensor'])
const RESERVED_QUERY_KEYS = new Set(['search', 'q', 'category', 'minPrice', 'maxPrice', 'page', 'pageSize', 'sort', 'inStockOnly'])
const SORT_OPTIONS = new Set(['featured', 'name-asc', 'price-asc', 'price-desc', 'stock-desc', 'newest'])
const DEFAULT_PAGE_SIZE = 100
const MAX_PAGE_SIZE = 100

function parsePositiveInt(value: string | null, fallback: number) {
  if (value == null || value === '') return fallback
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null
}

function parsePrice(value: string | null) {
  if (value == null || value === '') return null
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined
}

function textContains(value: string) {
  return { contains: value, mode: 'insensitive' as const }
}

function filterClauses(key: string, value: string) {
  const rawValues = value.split(',').map((item) => item.trim()).filter(Boolean)
  if (rawValues.length === 0) return []

  const definition = productFilters.find((filter) => filter.key === key)
  const aliases = rawValues.flatMap((rawValue) => {
    const option = definition?.options.find((item) => item.value === rawValue)
    return option ? [option.value, option.label, ...option.aliases] : [rawValue]
  })

  return [{
    OR: aliases.flatMap((alias) => [
      { name: textContains(alias) },
      { description: textContains(alias) },
      { category: { is: { name: textContains(alias) } } },
    ]),
  }]
}

export async function GET(request: NextRequest) {
  const traceId = createTraceId()

  try {
    const { searchParams } = new URL(request.url)
    const search = (searchParams.get('search') || searchParams.get('q') || '').trim()
    const category = (searchParams.get('category') || '').trim()
    const sort = searchParams.get('sort') || 'featured'
    const page = parsePositiveInt(searchParams.get('page'), 1)
    const pageSize = parsePositiveInt(searchParams.get('pageSize'), DEFAULT_PAGE_SIZE)
    const minPrice = parsePrice(searchParams.get('minPrice'))
    const maxPrice = parsePrice(searchParams.get('maxPrice'))
    const inStockOnly = searchParams.get('inStockOnly') === 'true'

    if (page === null) {
      return NextResponse.json(fail('VALIDATION_ERROR', 'page must be a positive integer', { traceId }), { status: 400 })
    }

    if (pageSize === null || pageSize > MAX_PAGE_SIZE) {
      return NextResponse.json(fail('VALIDATION_ERROR', `pageSize must be between 1 and ${MAX_PAGE_SIZE}`, { traceId }), { status: 400 })
    }

    if (minPrice === undefined || maxPrice === undefined || (minPrice !== null && maxPrice !== null && minPrice > maxPrice)) {
      return NextResponse.json(fail('VALIDATION_ERROR', 'Invalid price range', { traceId }), { status: 400 })
    }

    if (!SORT_OPTIONS.has(sort)) {
      return NextResponse.json(fail('VALIDATION_ERROR', 'Invalid sort option', { traceId }), { status: 400 })
    }

    const where: any = {
      isVisible: true,
      status: 'ACTIVE',
      ...(inStockOnly ? { stock: { gt: 0 } } : {}),
      ...(minPrice !== null || maxPrice !== null
        ? {
            price: {
              ...(minPrice !== null ? { gte: minPrice } : {}),
              ...(maxPrice !== null ? { lte: maxPrice } : {}),
            },
          }
        : {}),
    }

    if (search) {
      where.OR = [
        { name: textContains(search) },
        { description: textContains(search) },
        { category: { is: { name: textContains(search) } } },
      ]
    }

    if (category && category !== 'all') {
      const categoryName = CATEGORY_SLUG_TO_NAME[category] ?? category
      where.category = {
        is: {
          OR: [
            { id: category },
            { name: categoryName },
            { name: textContains(categoryName) },
          ],
        },
      }
    }

    const filterAndClauses: any[] = []
    searchParams.forEach((value, key) => {
      if (RESERVED_QUERY_KEYS.has(key)) return
      if (!FILTER_KEYS.has(key)) return
      filterAndClauses.push(...filterClauses(key, value))
    })
    if (searchParams.has('brand')) {
      filterAndClauses.push(...filterClauses('brand', searchParams.get('brand') || ''))
    }
    if (filterAndClauses.length > 0) {
      where.AND = [...(where.AND || []), ...filterAndClauses]
    }

    const orderBy = sort === 'name-asc'
      ? [{ name: 'asc' as const }]
      : sort === 'price-asc'
        ? [{ price: 'asc' as const }]
        : sort === 'price-desc'
          ? [{ price: 'desc' as const }]
          : sort === 'stock-desc'
            ? [{ stock: 'desc' as const }]
            : sort === 'newest'
              ? [{ createdAt: 'desc' as const }]
              : [{ soldCount: 'desc' as const }, { updatedAt: 'desc' as const }]

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: { select: { name: true } },
          images: {
            orderBy: { sortOrder: 'asc' },
            select: { url: true, alt: true, sortOrder: true, isPrimary: true },
          },
          reviews: {
            select: { rating: true }
          }
        },
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.product.count({ where }),
    ])

    const productsWithReviews = products.map((product) => {
      const reviews = product.reviews || []
      const reviewCount = reviews.length
      const averageRating = reviewCount > 0
        ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviewCount
        : 0
      
      const { reviews: _, ...rest } = product
      return {
        ...rest,
        reviewCount,
        averageRating
      }
    })

    return NextResponse.json(success(productsWithReviews, {
      traceId,
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    }))
  } catch (error) {
    logServerError('api.products.list', error, traceId)
    return NextResponse.json(fail('FETCH_PRODUCTS_ERROR', 'Lỗi khi lấy danh sách sản phẩm', { traceId }), { status: 500 })
  }
}
