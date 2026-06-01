type ProductTx = any

export interface AdminImageInput {
  url: string
  alt?: string | null
  sortOrder?: number
  isPrimary?: boolean
}

export interface AdminOptionGroupInput {
  name: string
  values: string[]
}

export interface AdminVariantInput {
  sku?: string | null
  options: Record<string, string>
  price?: number | null
  salePrice?: number | null
  stock: number
  imageUrl?: string | null
  isActive?: boolean
}

function cleanUrl(value: unknown) {
  const url = String(value || '').trim()
  if (!url) return null
  if (url.startsWith('/') || url.startsWith('http://') || url.startsWith('https://')) return url
  return null
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function normalizeComparable(value: string) {
  return value.trim().toLocaleLowerCase('vi')
}

export function parseLegacyImageUrls(raw: unknown) {
  return String(raw || '')
    .split(/\r?\n/)
    .map((item) => cleanUrl(item))
    .filter(Boolean) as string[]
}

export function parseAdminImages(body: any, fallbackImageUrl: string, productName: string): AdminImageInput[] {
  const explicitImages = Array.isArray(body.galleryImages) ? body.galleryImages : Array.isArray(body.images) ? body.images : null
  const images = explicitImages
    ? explicitImages.map((item: any, index: number) => ({
        url: cleanUrl(typeof item === 'string' ? item : item.url),
        alt: typeof item === 'object' ? String(item.alt || '').trim() || productName : productName,
        sortOrder: Number.isInteger(Number(item?.sortOrder)) ? Number(item.sortOrder) : index,
        isPrimary: Boolean(item?.isPrimary) || index === 0,
      }))
    : parseLegacyImageUrls(fallbackImageUrl).map((url, index) => ({
        url,
        alt: productName,
        sortOrder: index,
        isPrimary: index === 0,
      }))

  return images.filter((image: AdminImageInput) => Boolean(image.url)) as AdminImageInput[]
}

export function parseOptionGroups(body: any): AdminOptionGroupInput[] {
  if (!Array.isArray(body.optionGroups)) return []

  return body.optionGroups
    .map((group: any) => ({
      name: String(group.name || '').trim(),
      values: Array.isArray(group.values)
        ? group.values.map((value: unknown) => String(value || '').trim())
        : [],
    }))
}

export function parseVariants(body: any): AdminVariantInput[] {
  if (!Array.isArray(body.variants)) return []

  return body.variants
    .map((variant: any) => {
      const price = variant.price === '' || variant.price == null ? null : Number(variant.price)
      const salePrice = variant.salePrice === '' || variant.salePrice == null ? null : Number(variant.salePrice)

      return {
        sku: String(variant.sku || '').trim() || null,
        options: typeof variant.options === 'object' && variant.options ? variant.options : {},
        price: price == null || Number.isFinite(price) ? price : Number.NaN,
        salePrice: salePrice == null || Number.isFinite(salePrice) ? salePrice : Number.NaN,
        stock: Number(variant.stock ?? 0),
        imageUrl: cleanUrl(variant.imageUrl),
        isActive: variant.isActive !== false,
      }
    })
}

export function validateProductRelations(images: AdminImageInput[], optionGroups: AdminOptionGroupInput[], variants: AdminVariantInput[]) {
  if (images.some((image) => !image.url)) return 'Invalid image URL'

  const optionNames = new Set<string>()
  const valueSetsByOptionName = new Map<string, Set<string>>()
  for (const group of optionGroups) {
    if (!group.name) return 'Option group name is required'
    if (optionNames.has(group.name)) return 'Option group names must be unique'
    optionNames.add(group.name)

    if (group.values.length === 0) return 'Option group must have at least one value'

    const values = new Set<string>()
    for (const value of group.values) {
      if (!value) return 'Option value name is required'
      const normalizedValue = normalizeComparable(value)
      if (values.has(normalizedValue)) return 'Option values must be unique inside each group'
      values.add(normalizedValue)
    }
    valueSetsByOptionName.set(group.name, values)
  }

  if (optionGroups.length > 0 && variants.length === 0) {
    return 'At least one variant is required when option groups are configured'
  }

  const skus = new Set<string>()
  const variantCombinations = new Set<string>()
  for (const variant of variants) {
    const variantPrice = variant.price ?? null
    const variantSalePrice = variant.salePrice ?? null

    if (!Number.isInteger(variant.stock) || variant.stock < 0) return 'Variant stock must be a non-negative integer'
    if (variantPrice !== null && !Number.isFinite(variantPrice)) return 'Variant price is invalid'
    if (variantSalePrice !== null && !Number.isFinite(variantSalePrice)) return 'Variant sale price is invalid'
    if (variantPrice !== null && variantPrice <= 0) return 'Variant price must be greater than 0'
    if (variantSalePrice !== null && variantSalePrice <= 0) return 'Variant sale price must be greater than 0'
    if (variantPrice !== null && variantSalePrice !== null && variantSalePrice > variantPrice) {
      return 'Variant sale price cannot be greater than variant price'
    }

    if (variant.sku) {
      const normalizedSku = normalizeComparable(variant.sku)
      if (skus.has(normalizedSku)) return 'Variant SKU must be unique'
      skus.add(normalizedSku)
    }

    if (optionGroups.length === 0) {
      if (Object.keys(variant.options).length > 0) return 'Variant uses option values but no option groups are configured'
      continue
    }

    const optionKeys = Object.keys(variant.options)
    for (const optionName of optionKeys) {
      if (!optionNames.has(optionName)) return `Variant uses an undefined option group: ${optionName}`
    }

    const combinationParts: string[] = []
    for (const group of optionGroups) {
      const selectedValue = String(variant.options[group.name] || '').trim()
      if (!selectedValue) return 'Variant must select a value for every option group'

      const values = valueSetsByOptionName.get(group.name)
      if (!values?.has(normalizeComparable(selectedValue))) {
        return `Variant uses an undefined option value: ${group.name}=${selectedValue}`
      }
      combinationParts.push(`${group.name}:${normalizeComparable(selectedValue)}`)
    }

    const combinationKey = combinationParts.join('|')
    if (variantCombinations.has(combinationKey)) {
      return 'Variant option combinations must be unique'
    }
    variantCombinations.add(combinationKey)
  }

  return null
}

export async function replaceProductRelations(
  tx: ProductTx,
  productId: string,
  images: AdminImageInput[],
  optionGroups: AdminOptionGroupInput[],
  variants: AdminVariantInput[]
) {
  await Promise.all([
    tx.productImage.deleteMany({ where: { productId } }),
    tx.productOption.deleteMany({ where: { productId } }),
    tx.productVariant.deleteMany({ where: { productId } }),
  ])

  if (images.length > 0) {
    await tx.productImage.createMany({
      data: images.map((image, index) => ({
        productId,
        url: image.url,
        alt: image.alt || null,
        sortOrder: image.sortOrder ?? index,
        isPrimary: image.isPrimary ?? index === 0,
      })),
    })
  }

  const createdOptions = await Promise.all(optionGroups.map((group, groupIndex) =>
    tx.productOption.create({
      data: {
        productId,
        name: group.name,
        sortOrder: groupIndex,
      },
    })
  ))

  const valueIdByGroupAndLabel = new Map<string, string>()
  await Promise.all(optionGroups.map(async (group, groupIndex) => {
    const optionValues = await Promise.all(group.values.map((label, valueIndex) =>
      tx.productOptionValue.create({
        data: {
          optionId: createdOptions[groupIndex].id,
          value: slugify(label) || `value-${valueIndex}`,
          label,
          sortOrder: valueIndex,
        },
      })
    ))
    optionValues.forEach((optionValue, valueIndex) => {
      valueIdByGroupAndLabel.set(`${group.name}:${group.values[valueIndex]}`, optionValue.id)
    })
  }))

  await Promise.all(variants.map(async (variant) => {
    const createdVariant = await tx.productVariant.create({
      data: {
        productId,
        sku: variant.sku,
        price: variant.price ?? null,
        salePrice: variant.salePrice ?? null,
        stock: variant.stock,
        imageUrl: variant.imageUrl,
        isActive: variant.isActive !== false,
      },
    })

    await Promise.all(Object.entries(variant.options).map(([optionName, label]) => {
      const optionValueId = valueIdByGroupAndLabel.get(`${optionName}:${label}`)
      if (!optionValueId) return Promise.resolve(null)

      return tx.productVariantOptionValue.create({
        data: {
          variantId: createdVariant.id,
          optionValueId,
        },
      })
    }))
  }))
}

export const productRelationsInclude = {
  images: { orderBy: { sortOrder: 'asc' as const } },
  options: {
    orderBy: { sortOrder: 'asc' as const },
    include: {
      values: { orderBy: { sortOrder: 'asc' as const } },
    },
  },
  variants: {
    orderBy: { createdAt: 'asc' as const },
    include: {
      optionValues: {
        include: {
          optionValue: {
            include: {
              option: true,
            },
          },
        },
      },
    },
  },
}
