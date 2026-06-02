export interface AdminOptionGroup {
  name: string
  values: string[]
}

export interface AdminVariant {
  sku: string
  options: Record<string, string>
  price: number | null
  salePrice: number | null
  stock: number
  imageUrl: string
  isActive: boolean
}

function cartesianProduct(groups: AdminOptionGroup[]): Record<string, string>[] {
  if (groups.length === 0) return []
  const valueArrays = groups.map((g) => g.values.filter(Boolean).map((v) => ({ name: g.name, value: v })))

  function combine(
    index: number,
    current: Record<string, string>
  ): Record<string, string>[] {
    if (index >= valueArrays.length) return [current]
    const results: Record<string, string>[] = []
    for (const item of valueArrays[index]) {
      results.push(...combine(index + 1, { ...current, [item.name]: item.value }))
    }
    return results
  }

  return combine(0, {})
}

function getOptionKey(options: Record<string, string>): string {
  return Object.entries(options)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, v]) => v)
    .join('|')
}

export function generateVariants(
  groups: AdminOptionGroup[],
  existingVariants: AdminVariant[]
): AdminVariant[] {
  if (groups.length === 0) return []

  const existingByKey = new Map<string, AdminVariant>()
  for (const v of existingVariants) {
    existingByKey.set(getOptionKey(v.options), v)
  }

  const combinations = cartesianProduct(groups)
  return combinations.map((combo) => {
    const key = getOptionKey(combo)
    const existing = existingByKey.get(key)
    return {
      sku: existing?.sku ?? '',
      options: combo,
      price: existing?.price ?? null,
      salePrice: existing?.salePrice ?? null,
      stock: existing?.stock ?? 0,
      imageUrl: existing?.imageUrl ?? '',
      isActive: existing?.isActive ?? true,
    }
  })
}
