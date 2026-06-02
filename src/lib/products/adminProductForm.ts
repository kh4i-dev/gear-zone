export type AdminProductFormSpec = {
  name: string
  value: string
}

export type AdminProductFormOptionGroup = {
  name: string
  values: string[]
}

export type AdminProductFormVariant = {
  sku: string
  options: Record<string, string>
  price: number | null
  salePrice: number | null
  stock: number
  imageUrl: string
  isActive: boolean
}

export type AdminProductFormState = {
  name: string
  categoryName: string
  imageUrl: string
  oldPrice: number | null
  price: number
  stock: string
  description: string
  detailedSpecs: string
  specs: AdminProductFormSpec[]
  optionGroups: AdminProductFormOptionGroup[]
  variants: AdminProductFormVariant[]
}

export type AdminProductFormOptionValueSource = {
  id: string
  optionId: string
  label: string
  option?: { id: string; name: string } | null
}

export type AdminProductFormOptionSource = {
  id: string
  name: string
  values: { id: string; label: string }[]
}

export type AdminProductFormVariantSource = {
  sku: string | null
  price: number | null
  salePrice: number | null
  stock: number
  imageUrl: string | null
  isActive: boolean
  optionValues: { optionValue: AdminProductFormOptionValueSource }[]
}

export function parseAdminImageLines(value: string) {
  return value
    .split(/\r?\n/)
    .map((url) => url.trim())
    .filter(Boolean)
}

export function parseSpecText(text: string): AdminProductFormSpec[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const pipeIdx = line.indexOf('|')
      const colonIdx = line.indexOf(':')
      if (pipeIdx > 0) {
        return { name: line.slice(0, pipeIdx).trim(), value: line.slice(pipeIdx + 1).trim() }
      }
      if (colonIdx > 0) {
        return { name: line.slice(0, colonIdx).trim(), value: line.slice(colonIdx + 1).trim() }
      }
      return null
    })
    .filter((s): s is AdminProductFormSpec => s !== null && s.name !== '' && s.value !== '')
}

export function serializeSpecs(specs: AdminProductFormSpec[]): string {
  return specs.map((s) => `${s.name}: ${s.value}`).join('\n')
}

export function hydrateAdminVariants(
  variants: AdminProductFormVariantSource[] | null | undefined,
  options: AdminProductFormOptionSource[] | null | undefined
): AdminProductFormVariant[] {
  const optionNameById = new Map<string, string>()

  for (const option of options ?? []) {
    optionNameById.set(option.id, option.name)
  }

  return (variants ?? []).map((variant) => {
    const variantOptions: Record<string, string> = {}

    for (const item of variant.optionValues) {
      const optionValue = item.optionValue
      const optionName = optionValue.option?.name ?? optionNameById.get(optionValue.optionId)
      if (optionName) {
        variantOptions[optionName] = optionValue.label
      }
    }

    return {
      sku: variant.sku ?? '',
      options: variantOptions,
      price: variant.price,
      salePrice: variant.salePrice,
      stock: variant.stock,
      imageUrl: variant.imageUrl ?? '',
      isActive: variant.isActive,
    }
  })
}

export function buildAdminProductSubmitPayload(formData: AdminProductFormState) {
  const description = formData.detailedSpecs.trim()
    ? `${formData.description.trim()}\n\n$$$SPECS$$$\n${formData.detailedSpecs.trim()}`
    : formData.description.trim()

  return {
    ...formData,
    oldPrice: formData.oldPrice ?? null,
    description,
    specs: formData.specs.filter((spec) => spec.name.trim() && spec.value.trim()),
    galleryImages: parseAdminImageLines(formData.imageUrl),
  }
}
