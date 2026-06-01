import { describe, expect, it } from 'vitest'
import {
  getAvailableOptionValues,
  getOrderedGalleryImages,
  getPrimaryProductImage,
  getSelectedVariant,
  getVariantPrice,
  type ProductVariantLike,
} from './productVariants'

const typeOption = { id: 'option-type', value: 'type', label: 'Loai' }
const colorOption = { id: 'option-color', value: 'color', label: 'Mau sac' }
const ultraMax = { id: 'value-ultra', optionId: typeOption.id, value: 'ultra-max', label: 'Ultra Max' }
const ultimate = { id: 'value-ultimate', optionId: typeOption.id, value: 'ultimate', label: 'Ultimate' }
const black = { id: 'value-black', optionId: colorOption.id, value: 'black', label: 'Black' }
const white = { id: 'value-white', optionId: colorOption.id, value: 'white', label: 'White' }

const variants: ProductVariantLike[] = [
  {
    id: 'variant-ultra-black',
    sku: 'ATK-ULTRA-BLK',
    price: 1390000,
    salePrice: 1190000,
    stock: 7,
    imageUrl: '/black.png',
    isActive: true,
    optionValues: [{ optionValue: ultraMax }, { optionValue: black }],
  },
  {
    id: 'variant-ultimate-white',
    sku: 'ATK-ULT-WHT',
    price: 1290000,
    salePrice: null,
    stock: 0,
    imageUrl: '/white.png',
    isActive: true,
    optionValues: [{ optionValue: ultimate }, { optionValue: white }],
  },
]

describe('product variant helpers', () => {
  it('selects Ultra Max + Black as the correct variant', () => {
    const selected = getSelectedVariant({
      [typeOption.id]: ultraMax.id,
      [colorOption.id]: black.id,
    }, variants)

    expect(selected?.id).toBe('variant-ultra-black')
  })

  it('marks unavailable colors disabled for the selected type', () => {
    const available = getAvailableOptionValues({ [typeOption.id]: ultraMax.id }, variants)

    expect(available.has(black.id)).toBe(true)
    expect(available.has(white.id)).toBe(false)
  })

  it('uses variant sale price and old price override', () => {
    expect(getVariantPrice({ price: 1500000, oldPrice: null }, variants[0])).toEqual({
      price: 1190000,
      oldPrice: 1390000,
    })
  })

  it('uses variant image before base primary image', () => {
    expect(getPrimaryProductImage({ price: 1, oldPrice: null, imageUrl: '/base.png' }, variants[0], [
      { url: '/primary.png', sortOrder: 0, isPrimary: true },
    ])).toBe('/black.png')
  })

  it('keeps product without variants working', () => {
    expect(getSelectedVariant({}, [])).toBeNull()
    expect(getVariantPrice({ price: 100, oldPrice: 120 }, null)).toEqual({ price: 100, oldPrice: 120 })
  })

  it('orders gallery images and falls back to primary image', () => {
    expect(getOrderedGalleryImages({ price: 1, oldPrice: null, imageUrl: '/base.png' }, [
      { url: '/two.png', sortOrder: 2 },
      { url: '/one.png', sortOrder: 1 },
    ])).toEqual(['/one.png', '/two.png'])

    expect(getOrderedGalleryImages({ price: 1, oldPrice: null, imageUrl: '/base.png' }, [])).toEqual(['/base.png'])
  })
})
