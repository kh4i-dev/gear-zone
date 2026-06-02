import { Edit2, Plus } from 'lucide-react'
import { Input, MoneyInputVND, Button } from '@/components/domain/ui'
import { RichTextEditor } from '@/components/domain/RichTextEditor'
import { AdminImageGallery } from '@/components/domain/AdminImageGallery'
import { AdminVariantEditor } from '@/components/domain/AdminVariantEditor'
import { AdminProductPreview } from '@/components/domain/AdminProductPreview'
import { parseSpecText } from '@/lib/products/adminProductForm'

interface AdminProductFormProps {
  formData: any
  setFormData: (val: any) => void
  existingCategories: string[]
  isSaving: boolean
  isUploading: boolean
  editingId: string | null
  hasSubmitted: boolean
  handleImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
  handleSubmit: (event: React.FormEvent) => void
  handleCancelEdit: () => void
  previewVariant: any
  previewPrice: number | string | null
  previewOldPrice: number | null
  previewStock: number | string
  formHasVariants: boolean
  formVariantStockTotal: number
}

export function AdminProductForm({
  formData,
  setFormData,
  existingCategories,
  isSaving,
  isUploading,
  editingId,
  hasSubmitted,
  handleImageUpload,
  handleSubmit,
  handleCancelEdit,
  previewVariant,
  previewPrice,
  previewOldPrice,
  previewStock,
  formHasVariants,
  formVariantStockTotal,
}: AdminProductFormProps) {
  return (
    <form onSubmit={handleSubmit} className="mb-8 bg-slate-900/40 backdrop-blur-md rounded-2xl border border-white/5 p-5">
      <div className="flex items-center gap-2 mb-5">
        <div className="size-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
          {editingId ? <Edit2 className="size-4 text-blue-400" /> : <Plus className="size-4 text-blue-400" />}
        </div>
        <div>
          <h2 className="font-semibold text-lg">{editingId ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm mới'}</h2>
          <p className="text-xs text-muted-foreground">Các trạng thái bán hàng nâng cao sẽ sớm được hỗ trợ (TODO).</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Input
              label="Tên sản phẩm"
              value={formData.name}
              onChange={(event) => setFormData({ ...formData, name: event.target.value })}
              placeholder="VD: Logitech G Pro X Superlight 2"
              required
            />
            <p className="mt-1 text-[11px] text-slate-400 flex items-center gap-1">
              <span className="inline-block size-1 bg-emerald-400 rounded-full animate-pulse" />
              Hãng sản xuất tự nhận diện theo tên sản phẩm (VD: Logitech, Asus, Razer, Akko…).
            </p>
          </div>
          <div>
            <Input
              label="Danh mục"
              value={formData.categoryName}
              onChange={(event) => setFormData({ ...formData, categoryName: event.target.value })}
              placeholder="VD: Chuột, Bàn phím, Tai nghe"
              list="categories"
            />
            <datalist id="categories">
              {existingCategories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </datalist>
          </div>
          <div className="md:col-span-2">
            <AdminImageGallery
              imageUrl={formData.imageUrl}
              onChange={(val) => setFormData({ ...formData, imageUrl: val })}
              onUpload={handleImageUpload}
              isUploading={isUploading}
              disabled={isSaving}
            />
            <div className="mt-2">
              <input
                aria-label="Thêm ảnh bằng URL"
                placeholder="Hoặc dán URL ảnh vào đây và nhấn Enter"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    const url = (e.target as HTMLInputElement).value.trim()
                    if (url) {
                      const next = formData.imageUrl
                        ? formData.imageUrl + '\n' + url
                        : url
                      setFormData({ ...formData, imageUrl: next })
                      ;(e.target as HTMLInputElement).value = ''
                    }
                  }
                }}
                className="w-full rounded-lg border border-white/[0.06] bg-slate-950/60 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
          </div>
          <div>
            <MoneyInputVND
              label="Giá cũ"
              value={formData.oldPrice}
              onChange={(val) => setFormData({ ...formData, oldPrice: val })}
              placeholder=""
            />
          </div>
          <div>
            <MoneyInputVND
              label="Giá bán"
              value={formData.price}
              onChange={(val) => setFormData({ ...formData, price: val })}
              placeholder=""
              required
              error={hasSubmitted && formData.price === 0 ? "Giá bán bắt buộc nhập và lớn hơn 0" : undefined}
              hint={formData.oldPrice != null && formData.oldPrice > 0 && formData.price > formData.oldPrice ? "Giá bán đang cao hơn giá cũ" : undefined}
            />
          </div>
          {formHasVariants ? (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3">
              <p className="text-sm font-bold text-emerald-300">Tồn kho được tính từ từng biến thể.</p>
              <p className="mt-1 text-xs text-slate-400">
                Tổng kho hiện tại: <span className="font-mono font-bold text-white">{formVariantStockTotal}</span>
              </p>
            </div>
          ) : (
            <Input
              label="Số lượng tồn"
              type="number"
              min="0"
              step="1"
              value={formData.stock}
              onChange={(event) => setFormData({ ...formData, stock: event.target.value })}
              placeholder="10"
              required
            />
          )}
          <div className="md:col-span-2">
            <p className="block text-sm font-medium text-muted-foreground mb-1.5">Mô tả chi tiết</p>
            <RichTextEditor
              value={formData.description}
              onChange={(val) => setFormData({ ...formData, description: val })}
              placeholder="Viết bài viết giới thiệu sản phẩm..."
            />
          </div>
          <div className="md:col-span-2">
            <p className="block text-sm font-medium text-indigo-400 font-bold flex items-center gap-1.5 mb-1.5">
              <span className="inline-block size-1.5 bg-indigo-400 rounded-full"></span>
              Thông số kỹ thuật
            </p>
            <textarea
              aria-label="Thông số kỹ thuật"
              value={formData.specRows}
              onChange={(e) => setFormData({ ...formData, specRows: e.target.value })}
              placeholder={"Thương hiệu: Akko\nModel: 5075B Plus\nKết nối: Bluetooth / 2.4G / USB-C\nPin: 3000mAh\nTrọng lượng: 0.9kg"}
              className="w-full rounded-lg border border-white/[0.06] bg-slate-950/60 px-3 py-2 text-sm text-white placeholder:text-slate-500 placeholder:leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-mono resize-y min-h-[160px]"
              rows={8}
              spellCheck={false}
            />
            <p className="text-xs text-slate-500 mt-1">
              Mỗi dòng một thông số, định dạng <code className="text-indigo-400">Tên: Giá trị</code> hoặc <code className="text-indigo-400">Tên|Giá trị</code>
            </p>
            {formData.specRows.trim() && (
              <div className="mt-2 rounded-lg border border-white/[0.06] bg-slate-950/40 p-2.5">
                <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider mb-1.5">Xem trước ({parseSpecText(formData.specRows).length} thông số)</p>
                <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-xs">
                  {parseSpecText(formData.specRows).map((spec, i) => (
                    <div key={i} className="contents">
                      <span className="text-slate-400 truncate max-w-[160px]">{spec.name}:</span>
                      <span className="text-white">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <AdminProductPreview
          name={formData.name}
          categoryName={formData.categoryName}
          description={formData.description}
          imageUrl={formData.imageUrl}
          previewVariant={previewVariant}
          previewPrice={previewPrice}
          previewOldPrice={previewOldPrice}
          previewStock={previewStock}
        />
      </div>

      <div className="mt-8 pt-6 border-t border-white/[0.06]">
        <AdminVariantEditor
          optionGroups={formData.optionGroups}
          variants={formData.variants}
          onOptionGroupsChange={(groups) =>
            setFormData((current: any) => ({
              ...current,
              optionGroups: groups,
            }))
          }
          onVariantsChange={(variants) =>
            setFormData((current: any) => ({ ...current, variants }))
          }
          productGalleryImages={formData.imageUrl ? formData.imageUrl.split(/\r?\n/).filter(Boolean) : []}
          disabled={isSaving}
        />
      </div>

      <div className="flex justify-end gap-3 mt-5 pt-5 border-t border-white/5">
        {editingId && (
          <Button type="button" onClick={handleCancelEdit} disabled={isSaving} className="bg-slate-800 hover:bg-slate-700">
            Hủy
          </Button>
        )}
        <Button type="submit" isLoading={isSaving} className="gap-2">
          {editingId ? <Edit2 className="size-4" /> : <Plus className="size-4" />}
          {editingId ? 'Cập nhật' : 'Lưu sản phẩm mới'}
        </Button>
      </div>
    </form>
  )
}
