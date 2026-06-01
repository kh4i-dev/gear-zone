import { describe, expect, it } from 'vitest'
import { getCategoryImage, getCategorySlug } from './categoryImages'

describe('category image mapping', () => {
  it('normalizes Vietnamese category names to stable slugs', () => {
    expect(getCategorySlug('Chuột')).toBe('chuot')
    expect(getCategorySlug('Tai nghe')).toBe('tai-nghe')
    expect(getCategorySlug('Bàn phím')).toBe('ban-phim')
    expect(getCategorySlug('Bàn chơi game')).toBe('ban-choi-game')
    expect(getCategorySlug('Màn hình')).toBe('man-hinh')
    expect(getCategorySlug('Lót chuột (Mousepad)')).toBe('lot-chuot-mousepad')
  })

  it('maps known categories to local category image files', () => {
    expect(getCategoryImage('Chuột')).toBe('/categories/mouse.webp')
    expect(getCategoryImage('Tai nghe')).toBe('/categories/headset.webp')
    expect(getCategoryImage('Bàn phím')).toBe('/categories/keyboard.webp')
    expect(getCategoryImage('Bàn chơi game')).toBe('/categories/desk.webp')
    expect(getCategoryImage('Màn hình')).toBe('/categories/monitor.webp')
    expect(getCategoryImage('Lót chuột (Mousepad)')).toBe('/categories/mousepad.webp')
    expect(getCategoryImage('mousepad')).toBe('/categories/mousepad.webp')
  })

  it('returns null for categories without a local image mapping', () => {
    expect(getCategoryImage('Phụ kiện / Khác')).toBeNull()
  })
})
