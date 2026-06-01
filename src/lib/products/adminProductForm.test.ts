import { describe, expect, it } from 'vitest'
import { buildAdminProductSubmitPayload, parseAdminImageLines } from './adminProductForm'

describe('admin product form payload', () => {
  it('keeps gallery, summary specs, purchase options, variants, and detailed specs separate', () => {
    const payload = buildAdminProductSubmitPayload({
      name: 'ATK Blazing Sky',
      categoryName: 'Chuột',
      imageUrl: '/a.png\n/b.png',
      oldPrice: null,
      price: 1890000,
      stock: '10',
      description: 'Mô tả sản phẩm',
      detailedSpecs: 'Sensor: PAW3955',
      specs: [
        { name: 'SummarySpec', value: 'Wireless' },
        { name: '', value: 'ignored' },
      ],
      optionGroups: [
        { name: 'Màu sắc', values: ['Blaze Silver', 'Shadow White'] },
      ],
      variants: [
        {
          sku: 'ATK-BS',
          options: { 'Màu sắc': 'Blaze Silver' },
          price: 1890000,
          salePrice: null,
          stock: 10,
          imageUrl: '/a.png',
          isActive: true,
        },
      ],
    })

    expect(payload.galleryImages).toEqual(['/a.png', '/b.png'])
    expect(payload.specs).toEqual([{ name: 'SummarySpec', value: 'Wireless' }])
    expect(payload.optionGroups).toEqual([{ name: 'Màu sắc', values: ['Blaze Silver', 'Shadow White'] }])
    expect(payload.variants).toHaveLength(1)
    expect(payload.description).toBe('Mô tả sản phẩm\n\n$$$SPECS$$$\nSensor: PAW3955')
  })

  it('does not append the legacy detailed specs marker when no detailed specs exist', () => {
    const payload = buildAdminProductSubmitPayload({
      name: 'Product',
      categoryName: '',
      imageUrl: '',
      oldPrice: 100,
      price: 90,
      stock: '1',
      description: 'Short description',
      detailedSpecs: '   ',
      specs: [],
      optionGroups: [],
      variants: [],
    })

    expect(payload.description).toBe('Short description')
    expect(payload.galleryImages).toEqual([])
  })

  it('parses one gallery URL per line and removes empty lines', () => {
    expect(parseAdminImageLines('/a.png\n\n /b.png \r\n')).toEqual(['/a.png', '/b.png'])
  })
})
