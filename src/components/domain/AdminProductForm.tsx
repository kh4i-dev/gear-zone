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
    <form onSubmit={handleSubmit} className="mb-8 bg-slate-900/40 backdrop-blur-md rounded-2xl border border-white/5 p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="size-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
          {editingId ? <Edit2 className="size-3.5 text-blue-400" /> : <Plus className="size-3.5 text-blue-400" />}
        </div>
        <div>
          <h2 className="font-semibold">{editingId ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm mới'}</h2>
          <p className="text-[11px] text-muted-foreground">Các trạng thái bán hàng nâng cao sẽ sớm được hỗ trợ (TODO).</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4">
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_180px] gap-3">
            <div>
              <Input
                label="Tên sản phẩm"
                value={formData.name}
                onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                placeholder="VD: Logitech G Pro X Superlight 2"
                required
              />
              <p className="mt-0.5 text-[10px] text-slate-500 flex items-center gap-1">
                <span className="inline-block size-1 bg-emerald-400 rounded-full animate-pulse" />
                Hãng tự nhận diện theo tên SP (VD: Logitech, Razer, Akko…).
              </p>
            </div>
            <div>
              <Input
                label="Danh mục"
                value={formData.categoryName}
                onChange={(event) => setFormData({ ...formData, categoryName: event.target.value })}
                placeholder="Chuột, Bàn phím…"
                list="categories"
              />
              <datalist id="categories">
                {existingCategories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </datalist>
            </div>
          </div>
          <AdminImageGallery
            imageUrl={formData.imageUrl}
            onChange={(val) => setFormData({ ...formData, imageUrl: val })}
            onUpload={handleImageUpload}
            isUploading={isUploading}
            disabled={isSaving}
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <MoneyInputVND
              label="Giá cũ"
              value={formData.oldPrice}
              onChange={(val) => setFormData({ ...formData, oldPrice: val })}
              placeholder=""
            />
            <MoneyInputVND
              label="Giá bán *"
              value={formData.price}
              onChange={(val) => setFormData({ ...formData, price: val })}
              placeholder=""
              required
              error={hasSubmitted && formData.price === 0 ? "Bắt buộc > 0" : undefined}
              hint={formData.oldPrice != null && formData.oldPrice > 0 && formData.price > formData.oldPrice ? "Cao hơn giá cũ" : undefined}
            />
            {formHasVariants ? (
              <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 flex flex-col justify-center">
                <p className="text-xs font-bold text-emerald-300">Kho = biến thể</p>
                <p className="text-[11px] text-slate-400">
                  Tổng: <span className="font-mono font-bold text-white">{formVariantStockTotal}</span>
                </p>
              </div>
            ) : (
              <Input
                label="Số lượng tồn *"
                type="number"
                min="0"
                step="1"
                value={formData.stock}
                onChange={(event) => setFormData({ ...formData, stock: event.target.value })}
                placeholder="10"
                required
              />
            )}
          </div>
          <div>
            <p className="block text-sm font-medium text-muted-foreground mb-1">Mô tả chi tiết</p>
            <RichTextEditor
              value={formData.description}
              onChange={(val) => setFormData({ ...formData, description: val })}
              placeholder="Viết bài viết giới thiệu sản phẩm..."
            />
          </div>
          <div>
            <p className="block text-sm font-medium text-indigo-400 font-bold flex items-center gap-1.5 mb-1">
              <span className="inline-block size-1.5 bg-indigo-400 rounded-full"></span>
              Thông số kỹ thuật
            </p>
            <textarea
              aria-label="Thông số kỹ thuật"
              value={formData.specRows}
              onChange={(e) => setFormData({ ...formData, specRows: e.target.value })}
              placeholder={"Thương hiệu: Akko\nModel: 5075B Plus\nKết nối: Bluetooth / 2.4G / USB-C"}
              className="w-full rounded-lg border border-white/[0.06] bg-slate-950/60 px-3 py-2 text-sm text-white placeholder:text-slate-500 placeholder:leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-mono resize-y min-h-[100px]"
              rows={5}
              spellCheck={false}
            />
            <p className="text-[11px] text-slate-500 mt-0.5">
              Mỗi dòng: <code className="text-indigo-400">Tên: Giá trị</code>
            </p>
            {formData.specRows.trim() && (
              <div className="mt-1.5 rounded-lg border border-white/[0.06] bg-slate-950/40 p-2">
                <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-1">Xem trước ({parseSpecText(formData.specRows).length} thông số)</p>
                <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-xs">
                  {parseSpecText(formData.specRows).map((spec, i) => (
                    <div key={i} className="contents">
                      <span className="text-slate-400 truncate max-w-[140px]">{spec.name}:</span>
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

      <div className="mt-5 pt-4 border-t border-white/[0.06]">
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

      <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-white/5">
        {editingId && (
          <Button type="button" onClick={handleCancelEdit} disabled={isSaving} className="bg-slate-800 hover:bg-slate-700">
            Hủy
          </Button>
        )}
        <Button type="submit" isLoading={isSaving} className="gap-1.5">
          {editingId ? <Edit2 className="size-3.5" /> : <Plus className="size-3.5" />}
          {editingId ? 'Cập nhật' : 'Lưu sản phẩm mới'}
        </Button>
      </div>
    </form>
  )
}
