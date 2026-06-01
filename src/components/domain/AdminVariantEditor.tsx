'use client'

import { useCallback, useState } from 'react'
import { Plus, X, ChevronUp, ChevronDown, Package, Wand2, ArrowRight } from 'lucide-react'

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

interface AdminVariantEditorProps {
  optionGroups: AdminOptionGroup[]
  variants: AdminVariant[]
  onOptionGroupsChange: (groups: AdminOptionGroup[]) => void
  onVariantsChange: (variants: AdminVariant[]) => void
  disabled?: boolean
}

const PRESET_GROUPS: { name: string; values: string[] }[] = [
  { name: 'Màu sắc', values: ['Đen', 'Trắng', 'Xanh', 'Đỏ', 'Hồng', 'Tím', 'Vàng'] },
  { name: 'Phiên bản', values: ['Tiêu chuẩn', 'Plus', 'Pro', 'Ultra', 'Max', 'Mini'] },
  { name: 'Kết nối', values: ['USB-C', 'Bluetooth', '2.4Ghz', 'USB-A'] },
]

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

export function AdminVariantEditor({
  optionGroups,
  variants,
  onOptionGroupsChange,
  onVariantsChange,
  disabled,
}: AdminVariantEditorProps) {
  const [newGroupName, setNewGroupName] = useState('')
  const [batchText, setBatchText] = useState<Record<number, string>>({})

  const handleAddGroup = useCallback(() => {
    const trimmed = newGroupName.trim()
    if (!trimmed) return
    if (optionGroups.some((g) => g.name === trimmed)) return
    const next = [...optionGroups, { name: trimmed, values: [] }]
    onOptionGroupsChange(next)
    setNewGroupName('')
  }, [newGroupName, optionGroups, onOptionGroupsChange])

  const handleRemoveGroup = useCallback(
    (index: number) => {
      const next = optionGroups.filter((_, i) => i !== index)
      onOptionGroupsChange(next)
    },
    [optionGroups, onOptionGroupsChange]
  )

  const handleAddValue = useCallback(
    (groupIndex: number) => {
      if (optionGroups[groupIndex].values.length >= 50) return
      const next = optionGroups.map((g, i) =>
        i === groupIndex ? { ...g, values: [...g.values, ''] } : g
      )
      onOptionGroupsChange(next)
    },
    [optionGroups, onOptionGroupsChange]
  )

  const handleRemoveValue = useCallback(
    (groupIndex: number, valueIndex: number) => {
      const next = optionGroups.map((g, i) =>
        i === groupIndex
          ? { ...g, values: g.values.filter((_, vi) => vi !== valueIndex) }
          : g
      )
      onOptionGroupsChange(next)
    },
    [optionGroups, onOptionGroupsChange]
  )

  const handleValueChange = useCallback(
    (groupIndex: number, valueIndex: number, newValue: string) => {
      const next = optionGroups.map((g, i) =>
        i === groupIndex
          ? {
              ...g,
              values: g.values.map((v, vi) => (vi === valueIndex ? newValue : v)),
            }
          : g
      )
      onOptionGroupsChange(next)
    },
    [optionGroups, onOptionGroupsChange]
  )

  const handleMoveValue = useCallback(
    (groupIndex: number, valueIndex: number, direction: 'up' | 'down') => {
      const group = optionGroups[groupIndex]
      const targetIndex = direction === 'up' ? valueIndex - 1 : valueIndex + 1
      if (targetIndex < 0 || targetIndex >= group.values.length) return
      const nextValues = [...group.values]
      ;[nextValues[valueIndex], nextValues[targetIndex]] = [nextValues[targetIndex], nextValues[valueIndex]]
      const next = optionGroups.map((g, i) =>
        i === groupIndex ? { ...g, values: nextValues } : g
      )
      onOptionGroupsChange(next)
    },
    [optionGroups, onOptionGroupsChange]
  )

  const handleBatchAdd = useCallback(
    (groupIndex: number) => {
      const raw = batchText[groupIndex] ?? ''
      const values = raw
        .split(/[,;]+/)
        .map((v) => v.trim())
        .filter(Boolean)
      if (values.length === 0) return
      const group = optionGroups[groupIndex]
      const remaining = 50 - group.values.length
      if (remaining <= 0) return
      const toAdd = values.slice(0, remaining)
      const next = optionGroups.map((g, i) =>
        i === groupIndex ? { ...g, values: [...g.values, ...toAdd] } : g
      )
      onOptionGroupsChange(next)
      setBatchText((prev) => ({ ...prev, [groupIndex]: '' }))
    },
    [optionGroups, batchText, onOptionGroupsChange]
  )

  const handleAddPresetGroup = useCallback(
    (preset: { name: string; values: string[] }) => {
      const existing = optionGroups.find((g) => g.name === preset.name)
      if (existing) {
        const newValues = preset.values.filter((v) => !existing.values.includes(v))
        if (newValues.length === 0) return
        const remaining = 50 - existing.values.length
        if (remaining <= 0) return
        const next = optionGroups.map((g) =>
          g.name === preset.name
            ? { ...g, values: [...g.values, ...newValues.slice(0, remaining)] }
            : g
        )
        onOptionGroupsChange(next)
      } else {
        const next = [...optionGroups, { name: preset.name, values: [...preset.values] }]
        onOptionGroupsChange(next)
      }
    },
    [optionGroups, onOptionGroupsChange]
  )

  const handleVariantChange = useCallback(
    (variantIndex: number, field: keyof AdminVariant, value: any) => {
      const next = variants.map((v, i) => (i === variantIndex ? { ...v, [field]: value } : v))
      onVariantsChange(next)
    },
    [variants, onVariantsChange]
  )

  const hasGroups = optionGroups.length > 0

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <Package className="size-4 text-amber-400" />
        <p className="text-sm font-semibold text-slate-200">Phân loại hàng</p>
        {hasGroups && (
          <span className="text-[11px] text-slate-500">
            {variants.length} biến thể
          </span>
        )}
      </div>

      {!hasGroups && (
        <p className="text-xs text-slate-500 italic">
          Thêm phân loại để tạo biến thể sản phẩm (VD: Màu sắc, Kích thước, Phiên bản).
        </p>
      )}

      {hasGroups && (
        <div className="flex flex-wrap gap-4">
          {optionGroups.map((group, gi) => (
            <div
              key={gi}
              className="flex-1 min-w-[240px] rounded-xl bg-white/[0.02] border border-white/[0.06] p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <input
                  value={group.name}
                  onChange={(e) => {
                    const next = optionGroups.map((g, i) =>
                      i === gi ? { ...g, name: e.target.value } : g
                    )
                    onOptionGroupsChange(next)
                  }}
                  placeholder="VD: Màu sắc"
                  disabled={disabled}
                  className="text-sm font-bold text-slate-200 bg-transparent border-none outline-none placeholder:text-slate-600 w-full"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveGroup(gi)}
                  disabled={disabled}
                  className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
                >
                  <X className="size-3.5" />
                </button>
              </div>

              <div className="space-y-1.5">
                {group.values.map((value, vi) => (
                  <div key={vi} className="flex items-center gap-1.5">
                    <span className="text-slate-600 text-xs select-none">&bull;</span>
                    <input
                      value={value}
                      onChange={(e) => handleValueChange(gi, vi, e.target.value)}
                      placeholder="Nhập giá trị..."
                      disabled={disabled}
                      className="flex-1 text-xs bg-slate-950/60 border border-white/[0.06] rounded-lg px-2.5 py-1.5 text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500/40"
                    />
                    <button
                      type="button"
                      onClick={() => handleMoveValue(gi, vi, 'up')}
                      disabled={disabled || vi === 0}
                      className="p-0.5 rounded text-slate-600 hover:text-slate-300 disabled:opacity-20 transition-colors"
                    >
                      <ChevronUp className="size-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveValue(gi, vi, 'down')}
                      disabled={disabled || vi === group.values.length - 1}
                      className="p-0.5 rounded text-slate-600 hover:text-slate-300 disabled:opacity-20 transition-colors"
                    >
                      <ChevronDown className="size-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveValue(gi, vi)}
                      disabled={disabled}
                      className="p-0.5 rounded text-slate-600 hover:text-red-400 transition-colors"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-3 space-y-2">
                <button
                  type="button"
                  onClick={() => handleAddValue(gi)}
                  disabled={disabled}
                  className="flex items-center gap-1 text-xs text-slate-500 hover:text-blue-400 transition-colors"
                >
                  <Plus className="size-3" /> Thêm giá trị
                </button>

                <div className="flex items-center gap-1.5">
                  <input
                    value={batchText[gi] ?? ''}
                    onChange={(e) =>
                      setBatchText((prev) => ({ ...prev, [gi]: e.target.value }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleBatchAdd(gi)
                      }
                    }}
                    placeholder="Đen, Trắng, Xanh..."
                    disabled={disabled}
                    className="flex-1 text-xs bg-slate-950/60 border border-white/[0.06] rounded-lg px-2.5 py-1.5 text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500/40"
                  />
                  <button
                    type="button"
                    onClick={() => handleBatchAdd(gi)}
                    disabled={disabled || !(batchText[gi] ?? '').trim()}
                    className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 text-xs font-semibold transition-colors disabled:opacity-40"
                  >
                    <ArrowRight className="size-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {PRESET_GROUPS.map((preset) => {
          const exists = optionGroups.some((g) => g.name === preset.name)
          return (
            <button
              key={preset.name}
              type="button"
              onClick={() => handleAddPresetGroup(preset)}
              disabled={disabled}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all active:scale-95 ${
                exists
                  ? 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20 hover:bg-emerald-500/15'
                  : 'bg-white/[0.04] text-slate-300 ring-1 ring-white/[0.08] hover:bg-white/[0.08] hover:text-white'
              }`}
            >
              <Wand2 className="size-3" />
              {preset.name}
            </button>
          )
        })}
        <div className="flex items-center gap-2 ml-auto">
          <input
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleAddGroup()
              }
            }}
            placeholder="Tên nhóm phân loại mới..."
            disabled={disabled}
            className="flex-1 max-w-xs text-sm bg-slate-950/60 border border-white/[0.06] rounded-xl px-3 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 disabled:opacity-50"
          />
          <button
            type="button"
            onClick={handleAddGroup}
            disabled={disabled || !newGroupName.trim()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-semibold transition-all disabled:opacity-40 disabled:active:scale-100"
          >
            <Plus className="size-3.5" />
            Thêm nhóm
          </button>
        </div>
      </div>

      {hasGroups && variants.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-white/[0.06]">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                <th className="p-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                  SKU
                </th>
                {optionGroups.map((g) => (
                  <th
                    key={g.name}
                    className="p-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap"
                  >
                    {g.name}
                  </th>
                ))}
                <th className="p-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                  Giá
                </th>
                <th className="p-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                  Giá KM
                </th>
                <th className="p-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                  Tồn
                </th>
                <th className="p-3 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                  Kích hoạt
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {variants.map((variant, vi) => (
                <tr key={vi} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-3">
                    <input
                      value={variant.sku}
                      onChange={(e) => handleVariantChange(vi, 'sku', e.target.value)}
                      placeholder="Tự động"
                      disabled={disabled}
                      className="w-full min-w-[100px] bg-transparent border border-white/[0.06] rounded-lg px-2 py-1.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500/40"
                    />
                  </td>
                  {optionGroups.map((g) => (
                    <td key={g.name} className="p-3 text-xs text-slate-300 whitespace-nowrap">
                      {variant.options[g.name] || ''}
                    </td>
                  ))}
                  <td className="p-3">
                    <input
                      type="number"
                      value={variant.price ?? ''}
                      onChange={(e) =>
                        handleVariantChange(vi, 'price', e.target.value ? Number(e.target.value) : null)
                      }
                      placeholder="Mặc định"
                      disabled={disabled}
                      className="w-full min-w-[90px] bg-transparent border border-white/[0.06] rounded-lg px-2 py-1.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500/40 [appearance:textfield]"
                    />
                  </td>
                  <td className="p-3">
                    <input
                      type="number"
                      value={variant.salePrice ?? ''}
                      onChange={(e) =>
                        handleVariantChange(vi, 'salePrice', e.target.value ? Number(e.target.value) : null)
                      }
                      placeholder="—"
                      disabled={disabled}
                      className="w-full min-w-[90px] bg-transparent border border-white/[0.06] rounded-lg px-2 py-1.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500/40 [appearance:textfield]"
                    />
                  </td>
                  <td className="p-3">
                    <input
                      type="number"
                      value={variant.stock}
                      min="0"
                      step="1"
                      onChange={(e) => handleVariantChange(vi, 'stock', Math.max(0, Number(e.target.value) || 0))}
                      disabled={disabled}
                      className="w-full min-w-[60px] bg-transparent border border-white/[0.06] rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500/40 [appearance:textfield]"
                    />
                  </td>
                  <td className="p-3 text-center">
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={variant.isActive}
                        onChange={(e) => handleVariantChange(vi, 'isActive', e.target.checked)}
                        disabled={disabled}
                        className="sr-only peer"
                      />
                      <span className="size-4 rounded border border-white/[0.12] bg-transparent peer-checked:bg-emerald-500 peer-checked:border-emerald-500 transition-colors flex items-center justify-center">
                        {variant.isActive && (
                          <span className="text-[10px] text-white font-bold">&#10003;</span>
                        )}
                      </span>
                    </label>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
