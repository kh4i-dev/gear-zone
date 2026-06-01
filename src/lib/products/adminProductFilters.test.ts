import { describe, expect, it } from 'vitest'
import {
  buildBrandCounts,
  buildCategoryCounts,
  filterAdminProducts,
  type AdminFilterProduct,
} from './adminProductFilters'

const products: AdminFilterProduct[] = [
  {
    id: 'mouse-logitech',
    name: 'Logitech G Pro Mouse',
    stock: 8,
    isVisible: true,
    status: 'ACTIVE',
    category: { id: 'cat-mouse', name: 'Chuột' },
    variants: [{ sku: 'GPRO-BLK' }],
  },
  {
    id: 'mouse-razer',
    name: 'Razer DeathAdder Mouse',
    stock: 0,
    isVisible: true,
    status: 'ACTIVE',
    category: { id: 'cat-mouse', name: 'Chuột' },
  },
  {
    id: 'headset-logitech',
    name: 'Logitech G Pro Headset',
    stock: 3,
    isVisible: false,
    status: 'ACTIVE',
    category: { id: 'cat-headset', name: 'Tai nghe' },
  },
  {
    id: 'monitor-benq',
    name: 'BenQ Zowie Monitor XL',
    stock: 4,
    isVisible: true,
    status: 'DISCONTINUED',
    category: { id: 'cat-monitor', name: 'Màn hình' },
  },
]

const categories = [
  { id: 'cat-mouse', name: 'Chuột' },
  { id: 'cat-headset', name: 'Tai nghe' },
  { id: 'cat-monitor', name: 'Màn hình' },
  { id: 'cat-keyboard', name: 'Bàn phím' },
]

const brands = ['Logitech', 'Razer', 'BenQ']

describe('admin product filters', () => {
  it('aggregates category counts from loaded products and DB categories', () => {
    expect(buildCategoryCounts(products, categories)).toEqual([
      { id: 'cat-mouse', name: 'Chuột', count: 2 },
      { id: 'cat-headset', name: 'Tai nghe', count: 1 },
      { id: 'cat-monitor', name: 'Màn hình', count: 1 },
      { id: 'cat-keyboard', name: 'Bàn phím', count: 0 },
    ])
  })

  it('aggregates brand counts inside the selected category', () => {
    expect(buildBrandCounts(products, brands, 'cat-mouse')).toEqual({
      Logitech: 1,
      Razer: 1,
    })
  })

  it('filters by category and brand together', () => {
    const result = filterAdminProducts(products, brands, {
      categoryId: 'cat-mouse',
      brand: 'Logitech',
      status: 'all',
      search: '',
    })

    expect(result.map((product) => product.id)).toEqual(['mouse-logitech'])
  })

  it('filters by status and search text including SKU', () => {
    const result = filterAdminProducts(products, brands, {
      categoryId: 'all',
      brand: 'all',
      status: 'active',
      search: 'gpro-blk',
    })

    expect(result.map((product) => product.id)).toEqual(['mouse-logitech'])
  })

  it('treats all category as a cleared category filter', () => {
    const result = filterAdminProducts(products, brands, {
      categoryId: 'all',
      brand: 'Logitech',
      status: 'all',
      search: '',
    })

    expect(result.map((product) => product.id)).toEqual(['mouse-logitech', 'headset-logitech'])
  })

  it('groups empty, null, or unknown brands under "Khác"', () => {
    const productsWithEmptyBrands: AdminFilterProduct[] = [
      {
        id: 'mouse-no-brand',
        name: 'G Pro X Superlight',
        stock: 5,
        isVisible: true,
        status: 'ACTIVE',
        category: { id: 'cat-mouse', name: 'Chuột' },
      },
      {
        id: 'mouse-empty-name',
        name: '   ',
        stock: 3,
        isVisible: true,
        status: 'ACTIVE',
        category: { id: 'cat-mouse', name: 'Chuột' },
      },
    ]

    expect(buildBrandCounts(productsWithEmptyBrands, brands)).toEqual({
      'Khác': 2,
    })
  })
})
