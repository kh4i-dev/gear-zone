import { describe, expect, it } from 'vitest'
import { buildAdminProductSubmitPayload, parseAdminImageLines, parseSpecText, serializeSpecs } from './adminProductForm'

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

describe('parseSpecText', () => {
  it('parses colon-delimited bulk text into spec objects', () => {
    const result = parseSpecText('Thương hiệu: Akko\nModel: 5075B Plus\nKết nối: Bluetooth / 2.4G / USB-C')
    expect(result).toEqual([
      { name: 'Thương hiệu', value: 'Akko' },
      { name: 'Model', value: '5075B Plus' },
      { name: 'Kết nối', value: 'Bluetooth / 2.4G / USB-C' },
    ])
  })

  it('parses pipe-delimited bulk text into spec objects', () => {
    const result = parseSpecText('Thương hiệu|Akko\nModel|5075B Plus')
    expect(result).toEqual([
      { name: 'Thương hiệu', value: 'Akko' },
      { name: 'Model', value: '5075B Plus' },
    ])
  })

  it('prefers pipe over colon when both exist on the same line', () => {
    const result = parseSpecText('Thương hiệu|Akko: Version 2')
    expect(result).toEqual([
      { name: 'Thương hiệu', value: 'Akko: Version 2' },
    ])
  })

  it('skips lines without a delimiter', () => {
    const result = parseSpecText('Thương hiệu: Akko\njust some random text\nModel: 5075B')
    expect(result).toEqual([
      { name: 'Thương hiệu', value: 'Akko' },
      { name: 'Model', value: '5075B' },
    ])
  })

  it('skips empty lines', () => {
    const result = parseSpecText('Key1: Val1\n\n\nKey2: Val2')
    expect(result).toEqual([
      { name: 'Key1', value: 'Val1' },
      { name: 'Key2', value: 'Val2' },
    ])
  })

  it('returns empty array for empty input', () => {
    expect(parseSpecText('')).toEqual([])
    expect(parseSpecText('   ')).toEqual([])
  })
})

describe('serializeSpecs', () => {
  it('serializes spec objects to colon-delimited text', () => {
    const result = serializeSpecs([
      { name: 'Thương hiệu', value: 'Akko' },
      { name: 'Model', value: '5075B Plus' },
    ])
    expect(result).toBe('Thương hiệu: Akko\nModel: 5075B Plus')
  })

  it('returns empty string for empty specs', () => {
    expect(serializeSpecs([])).toBe('')
  })
})
