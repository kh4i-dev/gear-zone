'use client'

import { useCallback, useMemo, useState } from 'react'
import {
  CheckCircle2,
  ImageIcon,
  Package,
  Plus,
  Sparkles,
  Trash2,
  Wand2,
  X,
} from 'lucide-react'
import type { AdminOptionGroup, AdminVariant } from '@/lib/products/adminVariantMatrix'
import { generateVariants } from '@/lib/products/adminVariantMatrix'

export type { AdminOptionGroup, AdminVariant } from '@/lib/products/adminVariantMatrix'
export { generateVariants } from '@/lib/products/adminVariantMatrix'

interface AdminVariantEditorProps {
  optionGroups: AdminOptionGroup[]
  variants: AdminVariant[]
  onOptionGroupsChange: (groups: AdminOptionGroup[]) => void
  onVariantsChange: (variants: AdminVariant[]) => void
  productGalleryImages?: string[]
  disabled?: boolean
}

const PRESET_GROUPS: AdminOptionGroup[] = [
  { name: 'Mau sac', values: ['Den', 'Trang', 'Xanh', 'Do'] },
  { name: 'Phien ban', values: ['Mini', 'Mini Plus', 'Pro'] },
  { name: 'Ket noi', values: ['Bluetooth', 'USB-C', 'Wireless'] },
  { name: 'Switch', values: ['Linear', 'Tactile', 'Clicky'] },
  { name: 'Dung luong', values: ['128GB', '256GB', '512GB'] },
]

function parseValues(raw: string) {
  return raw
    .split(/[,;\n]+/)
    .map((value) => value.trim())
    .filter(Boolean)
}

function uniqueValues(values: string[]) {
  const seen = new Set<string>()
  const result: string[] = []

  for (const value of values) {
    const key = value.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    result.push(value)
  }

  return result
}

function getVariantName(variant: AdminVariant, optionGroups: AdminOptionGroup[]) {
  const labels = optionGroups
    .map((group) => variant.options[group.name])
    .filter(Boolean)

  return labels.length > 0 ? labels.join(' / ') : 'Bien the'
}

function toSkuToken(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toUpperCase()
}

function suggestedSku(variant: AdminVariant, optionGroups: AdminOptionGroup[]) {
  return optionGroups
    .map((group) => variant.options[group.name])
    .filter(Boolean)
    .map(toSkuToken)
    .filter(Boolean)
    .join('-')
}

export function AdminVariantEditor({
  optionGroups,
  variants,
  onOptionGroupsChange,
  onVariantsChange,
  productGalleryImages,
  disabled,
}: AdminVariantEditorProps) {
  const [newGroupName, setNewGroupName] = useState('')
  const [valueDrafts, setValueDrafts] = useState<Record<number, string>>({})
  const [bulkPrice, setBulkPrice] = useState('')
  const [bulkSalePrice, setBulkSalePrice] = useState('')
  const [bulkStock, setBulkStock] = useState('')
  const [skuPrefix, setSkuPrefix] = useState('')

  const generatedPreview = useMemo(
    () => generateVariants(optionGroups, variants),
    [optionGroups, variants]
  )

  const hasGroups = optionGroups.length > 0
  const hasCompleteGroups = optionGroups.every((group) => group.name.trim() && group.values.length > 0)
  const matrixNeedsSync = hasCompleteGroups && generatedPreview.length !== variants.length
  const matrixCount = generatedPreview.length

  const updateGroups = useCallback(
    (nextGroups: AdminOptionGroup[], shouldSyncMatrix = true) => {
      onOptionGroupsChange(nextGroups)
      if (shouldSyncMatrix) {
        onVariantsChange(generateVariants(nextGroups, variants))
      }
    },
    [variants, onOptionGroupsChange, onVariantsChange]
  )

  const addGroup = useCallback(() => {
    const name = newGroupName.trim()
    if (!name) return
    if (optionGroups.some((group) => group.name.toLowerCase() === name.toLowerCase())) return

    updateGroups([...optionGroups, { name, values: [] }], false)
    setNewGroupName('')
  }, [newGroupName, optionGroups, updateGroups])

  const addPresetGroup = useCallback(
    (preset: AdminOptionGroup) => {
      const existingIndex = optionGroups.findIndex(
        (group) => group.name.toLowerCase() === preset.name.toLowerCase()
      )

      if (existingIndex >= 0) {
        const nextGroups = optionGroups.map((group, index) => {
          if (index !== existingIndex) return group
          return {
            ...group,
            values: uniqueValues([...group.values, ...preset.values]),
          }
        })
        updateGroups(nextGroups)
        return
      }

      updateGroups([...optionGroups, { name: preset.name, values: preset.values }])
    },
    [optionGroups, updateGroups]
  )

  const removeGroup = useCallback(
    (groupIndex: number) => {
      updateGroups(optionGroups.filter((_, index) => index !== groupIndex))
    },
    [optionGroups, updateGroups]
  )

  const renameGroup = useCallback(
    (groupIndex: number, nextName: string) => {
      const previousName = optionGroups[groupIndex]?.name
      const nextGroups = optionGroups.map((group, index) =>
        index === groupIndex ? { ...group, name: nextName } : group
      )
      const nextVariants = variants.map((variant) => {
        if (!previousName || previousName === nextName) return variant
        const { [previousName]: existingValue, ...remainingOptions } = variant.options
        return {
          ...variant,
          options: {
            ...remainingOptions,
            ...(existingValue ? { [nextName]: existingValue } : {}),
          },
        }
      })

      onOptionGroupsChange(nextGroups)
      onVariantsChange(generateVariants(nextGroups, nextVariants))
    },
    [optionGroups, variants, onOptionGroupsChange, onVariantsChange]
  )

  const addValues = useCallback(
    (groupIndex: number) => {
      const parsed = parseValues(valueDrafts[groupIndex] ?? '')
      if (parsed.length === 0) return

      const nextGroups = optionGroups.map((group, index) =>
        index === groupIndex
          ? { ...group, values: uniqueValues([...group.values, ...parsed]) }
          : group
      )

      updateGroups(nextGroups)
      setValueDrafts((current) => ({ ...current, [groupIndex]: '' }))
    },
    [optionGroups, valueDrafts, updateGroups]
  )

  const removeValue = useCallback(
    (groupIndex: number, value: string) => {
      const nextGroups = optionGroups.map((group, index) =>
        index === groupIndex
          ? { ...group, values: group.values.filter((item) => item !== value) }
          : group
      )
      updateGroups(nextGroups)
    },
    [optionGroups, updateGroups]
  )

  const syncMatrix = useCallback(() => {
    onVariantsChange(generateVariants(optionGroups, variants))
  }, [optionGroups, variants, onVariantsChange])

  const handleVariantChange = useCallback(
    (variantIndex: number, field: keyof AdminVariant, value: any) => {
      onVariantsChange(variants.map((variant, index) =>
        index === variantIndex ? { ...variant, [field]: value } : variant
      ))
    },
    [variants, onVariantsChange]
  )

  const applyBulkNumber = useCallback(
    (field: 'price' | 'salePrice' | 'stock', rawValue: string, allowNull = false) => {
      const trimmed = rawValue.trim()
      if (!trimmed && !allowNull) return
      const parsed = trimmed ? Number(trimmed) : null
      if (parsed !== null && !Number.isFinite(parsed)) return

      onVariantsChange(variants.map((variant) => ({
        ...variant,
        [field]: field === 'stock' ? Math.max(0, Math.floor(parsed ?? 0)) : parsed,
      })))
    },
    [variants, onVariantsChange]
  )

  const fillMissingSku = useCallback(() => {
    onVariantsChange(variants.map((variant) => ({
      ...variant,
      sku: variant.sku || suggestedSku(variant, optionGroups),
    })))
  }, [variants, optionGroups, onVariantsChange])

  const applySkuPrefix = useCallback(() => {
    const trimmed = skuPrefix.trim()
    if (!trimmed) return
    onVariantsChange(variants.map((variant, index) => ({
      ...variant,
      sku: `${trimmed}-${(index + 1).toString().padStart(2, '0')}`,
    })))
  }, [variants, skuPrefix, onVariantsChange])

  const toggleAllActive = useCallback(() => {
    if (variants.length === 0) return
    const allActive = variants.every(v => v.isActive)
    onVariantsChange(variants.map(v => ({ ...v, isActive: !allActive })))
  }, [variants, onVariantsChange])

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 border-b border-white/[0.06] pb-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Package className="size-4 text-emerald-400" />
            <p className="text-sm font-semibold text-slate-100">Phan loai va bien the</p>
            {variants.length > 0 && (
              <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] font-bold text-emerald-400 ring-1 ring-emerald-500/20">
                {variants.length} bien the
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Tao nhom, them gia tri bang dau phay, sau do cap nhat ma tran ban hang.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {PRESET_GROUPS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => addPresetGroup(preset)}
              disabled={disabled}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 text-[11px] font-semibold text-slate-300 transition-colors hover:border-blue-500/30 hover:text-white disabled:opacity-40"
            >
              <Wand2 className="size-3" />
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.25fr)]">
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">1. Nhom bien the</p>
              <p className="mt-0.5 text-[11px] text-slate-500">Vi du: Mau sac, Phien ban, Ket noi.</p>
            </div>
            <span className="text-[11px] font-semibold text-slate-500">{optionGroups.length} nhom</span>
          </div>

          <div className="flex gap-2">
            <input
              value={newGroupName}
              onChange={(event) => setNewGroupName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  addGroup()
                }
              }}
              placeholder="Ten nhom"
              disabled={disabled}
              className="h-9 min-w-0 flex-1 rounded-lg border border-white/[0.06] bg-slate-950/60 px-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500/40"
            />
            <button
              type="button"
              onClick={addGroup}
              disabled={disabled || !newGroupName.trim()}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-blue-600 px-3 text-xs font-bold text-white transition-colors hover:bg-blue-500 disabled:opacity-40"
            >
              <Plus className="size-3.5" />
              Them
            </button>
          </div>

          {!hasGroups && (
            <div className="mt-3 rounded-lg border border-dashed border-white/[0.08] p-4 text-center">
              <Sparkles className="mx-auto mb-2 size-5 text-slate-600" />
              <p className="text-xs font-semibold text-slate-400">Chua co nhom bien the</p>
              <p className="mt-1 text-[11px] text-slate-600">Them nhanh bang preset hoac nhap ten nhom rieng.</p>
            </div>
          )}

          <div className="mt-3 space-y-2">
            {optionGroups.map((group, groupIndex) => (
              <div
                key={`${group.name}-${groupIndex}`}
                className="rounded-lg border border-white/[0.06] bg-slate-950/35 p-2.5"
              >
                <div className="flex items-center gap-2">
                  <input
                    value={group.name}
                    onChange={(event) => renameGroup(groupIndex, event.target.value)}
                    disabled={disabled}
                    className="h-8 min-w-0 flex-1 rounded-md border border-transparent bg-transparent px-2 text-sm font-bold text-slate-100 outline-none hover:border-white/[0.06] focus:border-blue-500/40"
                  />
                  <span className="rounded-md bg-white/[0.04] px-2 py-1 text-[11px] font-semibold text-slate-500">
                    {group.values.length}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeGroup(groupIndex)}
                    disabled={disabled}
                    className="grid size-8 place-items-center rounded-md text-slate-500 transition-colors hover:bg-red-500/10 hover:text-red-400 disabled:opacity-40"
                    title="Xoa nhom"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>

                <div className="mt-2 flex flex-wrap gap-1.5">
                  {group.values.map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => removeValue(groupIndex, value)}
                      disabled={disabled}
                      className="inline-flex h-7 items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 text-[11px] font-semibold text-emerald-300 transition-colors hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-300 disabled:opacity-40"
                      title="Xoa gia tri"
                    >
                      {value}
                      <X className="size-3" />
                    </button>
                  ))}
                </div>

                <div className="mt-2 flex gap-2">
                  <input
                    value={valueDrafts[groupIndex] ?? ''}
                    onChange={(event) =>
                      setValueDrafts((current) => ({ ...current, [groupIndex]: event.target.value }))
                    }
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault()
                        addValues(groupIndex)
                      }
                    }}
                    placeholder="Trang, Den, Xanh, Do"
                    disabled={disabled}
                    className="h-8 min-w-0 flex-1 rounded-md border border-white/[0.06] bg-slate-950/60 px-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500/40"
                  />
                  <button
                    type="button"
                    onClick={() => addValues(groupIndex)}
                    disabled={disabled || !(valueDrafts[groupIndex] ?? '').trim()}
                    className="h-8 rounded-md bg-emerald-600/20 px-2.5 text-[11px] font-bold text-emerald-300 ring-1 ring-emerald-500/20 hover:bg-emerald-600/30 disabled:opacity-40"
                  >
                    Them gia tri
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">2. Ma tran bien the</p>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  {hasCompleteGroups
                    ? `${matrixCount} dong se duoc tao tu cac nhom hien tai.`
                    : 'Moi nhom can it nhat mot gia tri de tao ma tran.'}
                </p>
              </div>
              <button
                type="button"
                onClick={syncMatrix}
                disabled={disabled || !hasCompleteGroups}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-3 text-xs font-bold text-white transition-colors hover:bg-emerald-500 disabled:opacity-40"
              >
                <CheckCircle2 className="size-3.5" />
                Tao / dong bo ma tran
              </button>
            </div>

            {matrixNeedsSync && (
              <p className="mt-3 rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
                Nhom bien the da thay doi. Bam dong bo de cap nhat bang bien the truoc khi luu.
              </p>
            )}
          </div>

          {variants.length > 0 && (
            <>
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Thao tac nhanh</p>
                    <p className="mt-0.5 text-[11px] text-slate-500">Ap dung gia tri cho toan bo bang.</p>
                  </div>
                  <button
                    type="button"
                    onClick={fillMissingSku}
                    disabled={disabled}
                    className="h-8 rounded-lg border border-white/[0.08] px-2.5 text-[11px] font-bold text-slate-300 transition-colors hover:border-blue-500/30 hover:text-white disabled:opacity-40"
                  >
                    Tự tạo SKU thiếu
                  </button>
                  <button
                    type="button"
                    onClick={toggleAllActive}
                    disabled={disabled || variants.length === 0}
                    className="h-8 rounded-lg border border-white/[0.08] px-2.5 text-[11px] font-bold text-slate-300 transition-colors hover:border-blue-500/30 hover:text-white disabled:opacity-40"
                  >
                    Bật/Tắt tất cả Active
                  </button>
                </div>

                <div className="grid gap-2 sm:grid-cols-3">
                  <div className="flex gap-1.5">
                    <input
                      type="number"
                      value={bulkPrice}
                      onChange={(event) => setBulkPrice(event.target.value)}
                      placeholder="Gia"
                      disabled={disabled}
                      className="h-8 min-w-0 flex-1 rounded-md border border-white/[0.06] bg-slate-950/60 px-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500/40"
                    />
                    <button
                      type="button"
                      onClick={() => applyBulkNumber('price', bulkPrice)}
                      disabled={disabled || !bulkPrice.trim()}
                      className="h-8 rounded-md bg-blue-600/20 px-2 text-[11px] font-bold text-blue-300 hover:bg-blue-600/30 disabled:opacity-40"
                    >
                      Ap dung
                    </button>
                  </div>
                  <div className="flex gap-1.5">
                    <input
                      type="number"
                      value={bulkSalePrice}
                      onChange={(event) => setBulkSalePrice(event.target.value)}
                      placeholder="Gia KM"
                      disabled={disabled}
                      className="h-8 min-w-0 flex-1 rounded-md border border-white/[0.06] bg-slate-950/60 px-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500/40"
                    />
                    <button
                      type="button"
                      onClick={() => applyBulkNumber('salePrice', bulkSalePrice, true)}
                      disabled={disabled}
                      className="h-8 rounded-md bg-blue-600/20 px-2 text-[11px] font-bold text-blue-300 hover:bg-blue-600/30 disabled:opacity-40"
                    >
                      Ap dung
                    </button>
                  </div>
                  <div className="flex gap-1.5">
                    <input
                      type="number"
                      value={bulkStock}
                      onChange={(event) => setBulkStock(event.target.value)}
                      placeholder="Ton"
                      disabled={disabled}
                      className="h-8 min-w-0 flex-1 rounded-md border border-white/[0.06] bg-slate-950/60 px-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500/40"
                    />
                    <button
                      type="button"
                      onClick={() => applyBulkNumber('stock', bulkStock)}
                      disabled={disabled || !bulkStock.trim()}
                      className="h-8 rounded-md bg-blue-600/20 px-2 text-[11px] font-bold text-blue-300 hover:bg-blue-600/30 disabled:opacity-40"
                    >
                      Ap dung
                    </button>
                  </div>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={skuPrefix}
                      onChange={(event) => setSkuPrefix(event.target.value)}
                      placeholder="Prefix SKU (VD: SP01)"
                      disabled={disabled}
                      className="h-8 min-w-0 flex-1 rounded-md border border-white/[0.06] bg-slate-950/60 px-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500/40"
                    />
                    <button
                      type="button"
                      onClick={applySkuPrefix}
                      disabled={disabled || !skuPrefix.trim()}
                      className="h-8 rounded-md bg-blue-600/20 px-2 text-[11px] font-bold text-blue-300 hover:bg-blue-600/30 disabled:opacity-40"
                    >
                      Áp dụng
                    </button>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-white/[0.06]">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.06] bg-slate-950/50">
                      {['Variant', 'SKU', 'Price', 'Sale Price', 'Stock', 'Image', 'Status'].map((label) => (
                        <th
                          key={label}
                          className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400"
                        >
                          {label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {variants.map((variant, variantIndex) => (
                      <tr key={`${getVariantName(variant, optionGroups)}-${variantIndex}`} className="bg-[#070707] hover:bg-white/[0.02]">
                        <td className="min-w-[160px] px-3 py-2">
                          <p className="text-xs font-bold text-slate-100">{getVariantName(variant, optionGroups)}</p>
                        </td>
                        <td className="px-3 py-2">
                          <input
                            value={variant.sku}
                            onChange={(event) => handleVariantChange(variantIndex, 'sku', event.target.value)}
                            placeholder={suggestedSku(variant, optionGroups) || 'SKU'}
                            disabled={disabled}
                            className="h-8 min-w-[120px] rounded-md border border-white/[0.06] bg-transparent px-2 text-xs font-mono text-white placeholder:text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500/40"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            value={variant.price ?? ''}
                            onChange={(event) =>
                              handleVariantChange(variantIndex, 'price', event.target.value ? Number(event.target.value) : null)
                            }
                            placeholder="Mac dinh"
                            disabled={disabled}
                            className="h-8 min-w-[105px] rounded-md border border-white/[0.06] bg-transparent px-2 text-xs text-white placeholder:text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500/40"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            value={variant.salePrice ?? ''}
                            onChange={(event) =>
                              handleVariantChange(variantIndex, 'salePrice', event.target.value ? Number(event.target.value) : null)
                            }
                            placeholder="Khong co"
                            disabled={disabled}
                            className="h-8 min-w-[105px] rounded-md border border-white/[0.06] bg-transparent px-2 text-xs text-white placeholder:text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500/40"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            min="0"
                            value={variant.stock}
                            onChange={(event) =>
                              handleVariantChange(variantIndex, 'stock', Math.max(0, Number(event.target.value) || 0))
                            }
                            disabled={disabled}
                            className="h-8 min-w-[72px] rounded-md border border-white/[0.06] bg-transparent px-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500/40"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <div className="relative flex items-center gap-2">
                            {variant.imageUrl && (
                              <img src={variant.imageUrl.startsWith('http') ? variant.imageUrl : `/uploads/${variant.imageUrl}`} alt="" className="size-8 rounded object-contain bg-white shrink-0" />
                            )}
                            <div className="relative flex-1">
                              <ImageIcon className="absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-slate-600 pointer-events-none" />
                              {productGalleryImages && productGalleryImages.length > 0 ? (
                                <select
                                  value={variant.imageUrl || ''}
                                  onChange={(event) => handleVariantChange(variantIndex, 'imageUrl', event.target.value)}
                                  disabled={disabled}
                                  className="h-8 w-full min-w-[120px] rounded-md border border-white/[0.06] bg-slate-900 py-1.5 pl-7 pr-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500/40 appearance-none"
                                >
                                  <option value="">-- Chọn ảnh --</option>
                                  {productGalleryImages.map((url, i) => (
                                    <option key={i} value={url}>Ảnh {i + 1}</option>
                                  ))}
                                </select>
                              ) : (
                                <input
                                  value={variant.imageUrl || ''}
                                  onChange={(event) => handleVariantChange(variantIndex, 'imageUrl', event.target.value)}
                                  placeholder="URL ảnh"
                                  disabled={disabled}
                                  className="h-8 w-full min-w-[120px] rounded-md border border-white/[0.06] bg-transparent py-1.5 pl-7 pr-2 text-xs text-white placeholder:text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500/40"
                                />
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <button
                            type="button"
                            onClick={() => handleVariantChange(variantIndex, 'isActive', !variant.isActive)}
                            disabled={disabled}
                            className={`h-8 rounded-md px-3 text-[11px] font-bold transition-colors ${
                              variant.isActive
                                ? 'bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/20'
                                : 'bg-slate-800/60 text-slate-500 ring-1 ring-white/[0.06]'
                            }`}
                          >
                            {variant.isActive ? 'Active' : 'Off'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
