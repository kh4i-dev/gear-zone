import { describe, it, expect } from 'vitest'
import { getProductCardImages } from './slideshow'

describe('getProductCardImages', () => {
  it('puts primary image first and sorts the rest by sortOrder', () => {
    const product = {
      id: '1',
      name: 'Test',
      description: null,
      imageUrl: '/old-image.jpg',
      price: 100,
      oldPrice: null,
      stock: 10,
      soldCount: 0,
      category: null,
      images: [
        { url: '/image3.jpg', sortOrder: 3, isPrimary: false },
        { url: '/image2.jpg', sortOrder: 2, isPrimary: false },
        { url: '/image1.jpg', sortOrder: 1, isPrimary: true },
      ]
    }
    const result = getProductCardImages(product)
    expect(result).toEqual(['/image1.jpg', '/image2.jpg', '/image3.jpg'])
  })

  it('removes duplicate image URLs', () => {
    const product = {
      id: '1',
      name: 'Test',
      description: null,
      imageUrl: '/old-image.jpg',
      price: 100,
      oldPrice: null,
      stock: 10,
      soldCount: 0,
      category: null,
      images: [
        { url: '/image1.jpg', sortOrder: 1, isPrimary: true },
        { url: '/image2.jpg', sortOrder: 2, isPrimary: false },
        { url: '/image1.jpg', sortOrder: 3, isPrimary: false },
      ]
    }
    const result = getProductCardImages(product)
    expect(result).toEqual(['/image1.jpg', '/image2.jpg'])
  })

  it('removes empty or invalid URLs', () => {
    const product = {
      id: '1',
      name: 'Test',
      description: null,
      imageUrl: '/old-image.jpg',
      price: 100,
      oldPrice: null,
      stock: 10,
      soldCount: 0,
      category: null,
      images: [
        { url: '', sortOrder: 1, isPrimary: true },
        { url: '  ', sortOrder: 2, isPrimary: false },
        { url: '/image3.jpg', sortOrder: 3, isPrimary: false },
      ]
    }
    const result = getProductCardImages(product)
    // Should fallback to imageUrl if no valid primary/images exist, but here we have /image3.jpg
    expect(result).toEqual(['/image3.jpg'])
  })

  it('falls back to legacy imageUrl if images array is empty', () => {
    const product = {
      id: '1',
      name: 'Test',
      description: null,
      imageUrl: '/legacy.jpg',
      price: 100,
      oldPrice: null,
      stock: 10,
      soldCount: 0,
      category: null,
      images: []
    }
    const result = getProductCardImages(product)
    expect(result).toEqual(['/legacy.jpg'])
  })

  it('falls back to multiple legacy imageUrls split by pipe', () => {
    const product = {
      id: '1',
      name: 'Test',
      description: null,
      imageUrl: '/legacy1.jpg | /legacy2.jpg',
      price: 100,
      oldPrice: null,
      stock: 10,
      soldCount: 0,
      category: null,
      images: []
    }
    const result = getProductCardImages(product)
    expect(result).toEqual(['/legacy1.jpg', '/legacy2.jpg'])
  })

  it('splits legacy-delimited gallery image rows before slideshow use', () => {
    const product = {
      id: '1',
      name: 'Test',
      description: null,
      imageUrl: null,
      price: 100,
      oldPrice: null,
      stock: 10,
      soldCount: 0,
      category: null,
      images: [
        { url: ' /gallery1.jpg | /gallery2.jpg ', sortOrder: 1, isPrimary: true },
        { url: '/gallery3.jpg\n/gallery2.jpg', sortOrder: 2, isPrimary: false },
      ]
    }
    const result = getProductCardImages(product)
    expect(result).toEqual(['/gallery1.jpg', '/gallery2.jpg', '/gallery3.jpg'])
  })

  it('returns empty array if no images at all', () => {
    const product = {
      id: '1',
      name: 'Test',
      description: null,
      imageUrl: null,
      price: 100,
      oldPrice: null,
      stock: 10,
      soldCount: 0,
      category: null,
      images: []
    }
    const result = getProductCardImages(product)
    expect(result).toEqual([])
  })

  it('filters out placeholder URLs from gallery images', () => {
    const product = {
      id: '1',
      name: 'Test',
      description: null,
      imageUrl: '/real-image.jpg',
      price: 100,
      oldPrice: null,
      stock: 10,
      soldCount: 0,
      category: null,
      images: [
        { url: '/real-image.jpg', sortOrder: 1, isPrimary: true },
        { url: '/placeholder-product.png', sortOrder: 2, isPrimary: false },
      ]
    }
    const result = getProductCardImages(product)
    expect(result).toEqual(['/real-image.jpg'])
  })

  it('filters out placeholder URLs from legacy fallback images', () => {
    const product = {
      id: '1',
      name: 'Test',
      description: null,
      imageUrl: '/placeholder-product.png | /real-image.jpg',
      price: 100,
      oldPrice: null,
      stock: 10,
      soldCount: 0,
      category: null,
      images: []
    }
    const result = getProductCardImages(product)
    expect(result).toEqual(['/real-image.jpg'])
  })

  it('does not include images from other products', () => {
    const productA = {
      id: '1',
      name: 'Product A',
      description: null,
      imageUrl: null,
      price: 100,
      oldPrice: null,
      stock: 10,
      soldCount: 0,
      category: null,
      images: [
        { url: '/image-a-1.jpg', sortOrder: 1, isPrimary: true },
        { url: '/image-a-2.jpg', sortOrder: 2, isPrimary: false },
      ]
    }
    const productB = {
      id: '2',
      name: 'Product B',
      description: null,
      imageUrl: null,
      price: 100,
      oldPrice: null,
      stock: 10,
      soldCount: 0,
      category: null,
      images: [
        { url: '/image-b-1.jpg', sortOrder: 1, isPrimary: true },
        { url: '/image-b-2.jpg', sortOrder: 2, isPrimary: false },
      ]
    }
    const resultA = getProductCardImages(productA)
    const resultB = getProductCardImages(productB)
    expect(resultA).toEqual(['/image-a-1.jpg', '/image-a-2.jpg'])
    expect(resultB).toEqual(['/image-b-1.jpg', '/image-b-2.jpg'])
    resultA.forEach((url) => {
      expect(url).not.toContain('image-b')
    })
  })

  it('returns only primary image when there is one real image', () => {
    const product = {
      id: '1',
      name: 'Test',
      description: null,
      imageUrl: null,
      price: 100,
      oldPrice: null,
      stock: 10,
      soldCount: 0,
      category: null,
      images: [
        { url: '/only-image.jpg', sortOrder: 1, isPrimary: true },
      ]
    }
    const result = getProductCardImages(product)
    expect(result).toEqual(['/only-image.jpg'])
  })

  it('returns multiple images sorted by sortOrder after primary', () => {
    const product = {
      id: '1',
      name: 'Test',
      description: null,
      imageUrl: null,
      price: 100,
      oldPrice: null,
      stock: 10,
      soldCount: 0,
      category: null,
      images: [
        { url: '/img3.jpg', sortOrder: 3, isPrimary: false },
        { url: '/img1.jpg', sortOrder: 1, isPrimary: true },
        { url: '/img2.jpg', sortOrder: 2, isPrimary: false },
      ]
    }
    const result = getProductCardImages(product)
    expect(result).toEqual(['/img1.jpg', '/img2.jpg', '/img3.jpg'])
  })
})
