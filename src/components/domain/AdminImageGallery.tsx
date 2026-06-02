'use client'

import { useCallback, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import { ChevronUp, ChevronDown, Trash2, ImageIcon, Upload, Loader2, Link2, Plus, Star } from 'lucide-react'
import { getSafeImageSrc } from '@/lib/product-images'

interface AdminImageGalleryProps {
  imageUrl: string
  onChange: (imageUrl: string) => void
  onUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
  isUploading: boolean
  disabled?: boolean
}

function parseImageUrls(raw: string): string[] {
  return raw
    .split(/\r?\n/)
    .map((url) => url.trim())
    .filter(Boolean)
}

export function AdminImageGallery({
  imageUrl,
  onChange,
  onUpload,
  isUploading,
  disabled,
}: AdminImageGalleryProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const images = useMemo(() => parseImageUrls(imageUrl), [imageUrl])

  const handleRemove = useCallback(
    (index: number) => {
      const next = images.filter((_, i) => i !== index)
      onChange(next.join('\n'))
    },
    [images, onChange]
  )

  const handleMoveUp = useCallback(
    (index: number) => {
      if (index <= 0) return
      const next = [...images]
      ;[next[index - 1], next[index]] = [next[index], next[index - 1]]
      onChange(next.join('\n'))
    },
    [images, onChange]
  )

  const handleMoveDown = useCallback(
    (index: number) => {
      if (index >= images.length - 1) return
      const next = [...images]
      ;[next[index], next[index + 1]] = [next[index + 1], next[index]]
      onChange(next.join('\n'))
    },
    [images, onChange]
  )

  const handleSetPrimary = useCallback(
    (index: number) => {
      if (index <= 0) return
      const next = [...images]
      const [selected] = next.splice(index, 1)
      onChange([selected, ...next].join('\n'))
    },
    [images, onChange]
  )

  const [urlInput, setUrlInput] = useState('')

  const handleAddUrl = useCallback(() => {
    const trimmed = urlInput.trim()
    if (!trimmed) return
    const next = [...images, trimmed]
    onChange(next.join('\n'))
    setUrlInput('')
  }, [urlInput, images, onChange])

  const handleUrlKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        handleAddUrl()
      }
    },
    [handleAddUrl]
  )

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">Ảnh sản phẩm</p>
        {images.length > 0 && (
          <span className="text-[11px] text-slate-500">{images.length} ảnh</span>
        )}
      </div>

      {images.length === 0 ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="flex flex-col items-center justify-center gap-2 p-8 rounded-xl border-2 border-dashed border-white/[0.06] bg-white/[0.02] cursor-pointer hover:border-white/[0.12] hover:bg-white/[0.04] transition-colors"
        >
          <div className="p-3 rounded-full bg-white/[0.03] border border-white/[0.04]">
            <ImageIcon className="size-6 text-slate-500/80" />
          </div>
          <span className="text-xs font-semibold text-slate-500">
            Chưa có ảnh — nhấn để thêm
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {images.map((url, index) => {
            const safeSrc = getSafeImageSrc(url)
            return (
              <div
                key={`${url}-${index}`}
                className="group relative rounded-xl overflow-hidden bg-white border border-white/[0.06] aspect-square"
              >
                {index === 0 && (
                  <span className="absolute top-1 left-1 z-10 px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-500/80 text-white">
                    Chính
                  </span>
                )}
                <div className="absolute inset-0 flex items-center justify-center p-2">
                  <Image
                    src={safeSrc}
                    alt={`Ảnh ${index + 1}`}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-contain"
                  />
                </div>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => handleRemove(index)}
                    disabled={disabled}
                    className="p-1.5 rounded-lg bg-red-500/80 hover:bg-red-500 text-white transition-colors"
                    title="Xoá ảnh"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => handleSetPrimary(index)}
                      disabled={disabled}
                      className="p-1.5 rounded-lg bg-amber-500/80 hover:bg-amber-500 text-white transition-colors"
                      title="Đặt làm ảnh chính"
                    >
                      <Star className="size-3.5" />
                    </button>
                  )}
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => handleMoveUp(index)}
                      disabled={disabled}
                      className="p-1.5 rounded-lg bg-slate-700/80 hover:bg-slate-600 text-white transition-colors"
                      title="Di chuyển lên"
                    >
                      <ChevronUp className="size-3.5" />
                    </button>
                  )}
                  {index < images.length - 1 && (
                    <button
                      type="button"
                      onClick={() => handleMoveDown(index)}
                      disabled={disabled}
                      className="p-1.5 rounded-lg bg-slate-700/80 hover:bg-slate-600 text-white transition-colors"
                      title="Di chuyển xuống"
                    >
                      <ChevronDown className="size-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )
          })}

          <div
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-white/[0.06] bg-white/[0.02] cursor-pointer hover:border-white/[0.12] hover:bg-white/[0.04] transition-colors aspect-square"
          >
            <Upload className="size-5 text-slate-500/60" />
            <span className="text-[10px] font-semibold text-slate-500">Thêm</span>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        aria-label="Chọn tệp ảnh"
        multiple
        accept="image/png,image/jpeg,image/webp,image/gif"
        onChange={onUpload}
        disabled={disabled || isUploading}
        className="hidden"
      />

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-500" />
          <input
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={handleUrlKeyDown}
            placeholder="Dán link ảnh sản phẩm..."
            disabled={disabled}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950/60 border border-white/[0.06] text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 disabled:opacity-50"
          />
        </div>
        <button
          type="button"
          onClick={handleAddUrl}
          disabled={disabled || !urlInput.trim()}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-semibold transition-all disabled:opacity-40 disabled:active:scale-100 shrink-0"
        >
          <Plus className="size-3.5" />
          Thêm URL
        </button>
      </div>

      {isUploading && (
        <div className="flex items-center gap-2 text-sm text-blue-400">
          <Loader2 className="size-4 animate-spin" />
          Đang tải các ảnh…
        </div>
      )}

      {images.length > 0 && (
        <p className="text-[11px] text-slate-500">
          Ảnh đầu tiên là ảnh chính. Kéo thả sắp xếp chưa hỗ trợ — dùng nút mũi tên để đổi thứ tự.
        </p>
      )}
    </div>
  )
}
