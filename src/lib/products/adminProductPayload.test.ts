import { describe, expect, it } from 'vitest'
import {
  parseOptionGroups,
  parseVariants,
  validateProductRelations,
} from './adminProductPayload'

describe('admin product purchase option payloads', () => {
  it('rejects an option group without a name', () => {
    const optionGroups = parseOptionGroups({
      optionGroups: [{ name: '', values: ['Blaze Silver'] }],
    })

    expect(validateProductRelations([], optionGroups, [])).toBe('Option group name is required')
  })

  it('rejects duplicate option values inside the same group', () => {
    const optionGroups = parseOptionGroups({
      optionGroups: [{ name: 'Mau sac', values: ['Blaze Silver', 'blaze silver'] }],
    })

    expect(validateProductRelations([], optionGroups, [])).toBe('Option values must be unique inside each group')
  })

  it('rejects duplicate variant option combinations', () => {
    const optionGroups = parseOptionGroups({
      optionGroups: [{ name: 'Mau sac', values: ['Blaze Silver', 'Shadow White'] }],
    })
    const variants = parseVariants({
      variants: [
        { options: { 'Mau sac': 'Blaze Silver' }, sku: 'ATK-BS-1', stock: 10 },
        { options: { 'Mau sac': 'Blaze Silver' }, sku: 'ATK-BS-2', stock: 8 },
      ],
    })

    expect(validateProductRelations([], optionGroups, variants)).toBe('Variant option combinations must be unique')
  })

  it('rejects variant options that omit a configured option group', () => {
    const optionGroups = parseOptionGroups({
      optionGroups: [
        { name: 'Mau sac', values: ['Black', 'White'] },
        { name: 'Phien ban', values: ['Ultra Max', 'Ultimate'] },
      ],
    })
    const variants = parseVariants({
      variants: [
        { options: { 'Mau sac': 'Black' }, sku: 'ATK-BLK', stock: 10 },
      ],
    })

    expect(validateProductRelations([], optionGroups, variants)).toBe('Variant must select a value for every option group')
  })

  it('accepts a valid two-option variant matrix', () => {
    const optionGroups = parseOptionGroups({
      optionGroups: [
        { name: 'Mau sac', values: ['Black', 'White'] },
        { name: 'Phien ban', values: ['Ultra Max', 'Ultimate'] },
      ],
    })
    const variants = parseVariants({
      variants: [
        {
          options: { 'Mau sac': 'Black', 'Phien ban': 'Ultra Max' },
          sku: 'ATK-BLK-ULTRA',
          price: 1890000,
          salePrice: 1790000,
          stock: 10,
          imageUrl: '/black.png',
          isActive: true,
        },
        {
          options: { 'Mau sac': 'White', 'Phien ban': 'Ultimate' },
          sku: 'ATK-WHT-ULT',
          price: 1690000,
          stock: 8,
          isActive: false,
        },
      ],
    })

    expect(validateProductRelations([], optionGroups, variants)).toBeNull()
  })
})
