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

export function parseAdminImageLines(value: string) {
  return value
    .split(/\r?\n/)
    .map((url) => url.trim())
    .filter(Boolean)
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
